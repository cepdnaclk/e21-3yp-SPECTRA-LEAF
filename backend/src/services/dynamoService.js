const {
  QueryCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const { ddb, TABLE_NAME } = require('../config/dynamodb');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function summaryKey(batchId) {
  return { DEVICE_ID: `BATCH#${batchId}`, TIMESTAMP: 'SUMMARY' };
}

function fermentationStateKey(factoryId) {
  return { DEVICE_ID: `FERMENTATION#${factoryId}`, TIMESTAMP: 'STATE' };
}

function priceValue(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function readingValue(item, key, fallbackKey) {
  return item[key] ?? (fallbackKey ? item[fallbackKey] : undefined) ?? null;
}

function hasSensorValues(item) {
  return [
    'RG_RATIO',
    'COLOR',
    'MQ137',
    'MQ135',
    'TGS2620',
    'TGS822',
    'HUMIDITY',
  ].some((key) => item[key] !== undefined && item[key] !== null);
}

// Paginate through all pages of a QueryCommand params object.
async function queryAll(params) {
  const items = [];
  let lastKey;
  do {
    const cmd = new QueryCommand({ ...params, ...(lastKey ? { ExclusiveStartKey: lastKey } : {}) });
    const result = await ddb.send(cmd);
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

async function scanAll(params) {
  const items = [];
  let lastKey;
  do {
    const cmd = new ScanCommand({ ...params, ...(lastKey ? { ExclusiveStartKey: lastKey } : {}) });
    const result = await ddb.send(cmd);
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return items;
}

function canFallbackToScan(err) {
  return ['ValidationException', 'ResourceNotFoundException'].includes(err?.name);
}

async function scanSensorsForFactory(factoryId) {
  const items = await scanAll({ TableName: TABLE_NAME });
  return items.filter((i) => i.TYPE === 'SENSOR' && i.FACTORY_ID === factoryId);
}

async function scanSummariesForFactory(factoryId) {
  const items = await scanAll({ TableName: TABLE_NAME });
  return items.filter((i) => i.TYPE === 'SUMMARY' && i.FACTORY_ID === factoryId);
}

// ─── Sensor APIs ─────────────────────────────────────────────────────────────

async function createSensorReading(item) {
  const record = {
    DEVICE_ID: item.DEVICE_ID,
    TIMESTAMP: item.TIMESTAMP,
    TYPE: 'SENSOR',
    FACTORY_ID: item.FACTORY_ID,
    BATCH_ID: item.BATCH_ID,
    RG_RATIO: Number(item.RG_RATIO ?? item.COLOR),
    TEMPERATURE: Number(item.TEMPERATURE),
    HUMIDITY: Number(item.HUMIDITY),
    MQ137: Number(item.MQ137 ?? item.MQ135),
    TGS2620: Number(item.TGS2620),
    TGS822: Number(item.TGS822),
  };
  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: record }));
  return record;
}

// ─── Shared fermentation state ───────────────────────────────────────────────

async function getFermentationState(factoryId) {
  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: fermentationStateKey(factoryId),
    })
  );
  return result.Item ?? null;
}

async function setFermentationState({
  factoryId,
  status,
  batchId,
  sensorDeviceId,
  updatedAt,
}) {
  const current = await getFermentationState(factoryId);
  const record = {
    ...fermentationStateKey(factoryId),
    TYPE: 'FERMENTATION_STATE',
    FACTORY_ID: factoryId,
    STATUS: status,
    BATCH_ID: batchId ?? current?.BATCH_ID ?? null,
    SENSOR_DEVICE_ID: sensorDeviceId ?? current?.SENSOR_DEVICE_ID ?? null,
    STARTED_AT: status === 'RUNNING'
      ? (current?.STATUS === 'RUNNING' && current?.BATCH_ID === batchId
        ? current.STARTED_AT
        : updatedAt)
      : current?.STARTED_AT ?? null,
    UPDATED_AT: updatedAt,
  };

  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: record }));
  return record;
}

// ─── Batch Reading APIs (GSI_BATCH_TIME) ─────────────────────────────────────

// NOTE: GSI_BATCH_TIME must project RG_RATIO, MQ137, TGS2620, and TGS822
// for the sensor graphs to work.
async function getBatchReadings(batchId) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'GSI_BATCH_TIME',
    KeyConditionExpression: 'BATCH_ID = :bid',
    ExpressionAttributeValues: { ':bid': batchId },
    ScanIndexForward: true,
  };
  try {
    const items = await queryAll(params);
    const sensors = items.filter((i) => i.TYPE === 'SENSOR');
    if (sensors.some((i) => !hasSensorValues(i))) {
      const scanned = await scanAll({ TableName: TABLE_NAME });
      return scanned
        .filter((i) => i.TYPE === 'SENSOR' && i.BATCH_ID === batchId)
        .sort((a, b) => String(a.TIMESTAMP).localeCompare(String(b.TIMESTAMP)));
    }
    return sensors;
  } catch (err) {
    if (!canFallbackToScan(err)) throw err;
    const items = await scanAll({ TableName: TABLE_NAME });
    return items
      .filter((i) => i.TYPE === 'SENSOR' && i.BATCH_ID === batchId)
      .sort((a, b) => String(a.TIMESTAMP).localeCompare(String(b.TIMESTAMP)));
  }
}

// ─── Batch Summary APIs (GSI_BATCH_SUMMARY) ──────────────────────────────────

async function getBatchSummary(batchId) {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI_BATCH_SUMMARY',
        KeyConditionExpression: 'BATCH_ID = :bid AND SUMMARY_KEY = :sk',
        ExpressionAttributeValues: { ':bid': batchId, ':sk': 'SUMMARY' },
        Limit: 1,
      })
    );
    return result.Items?.[0] ?? null;
  } catch (err) {
    if (!canFallbackToScan(err)) throw err;
    const items = await scanAll({ TableName: TABLE_NAME });
    return items.find((i) => i.TYPE === 'SUMMARY' && i.BATCH_ID === batchId) ?? null;
  }
}

async function upsertBatchGlp(batchId, factoryId, glp) {
  const result = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: summaryKey(batchId),
      UpdateExpression:
        'SET #type = :type, SUMMARY_KEY = :sk, FACTORY_ID = :fid, BATCH_ID = :bid, GLP = :glp',
      ExpressionAttributeNames: { '#type': 'TYPE' },
      ExpressionAttributeValues: {
        ':type': 'SUMMARY',
        ':sk': 'SUMMARY',
        ':fid': factoryId,
        ':bid': batchId,
        ':glp': Number(glp),
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return result.Attributes;
}

async function upsertBatchPrice(batchId, factoryId, price) {
  const result = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: summaryKey(batchId),
      UpdateExpression:
        'SET #type = :type, SUMMARY_KEY = :sk, FACTORY_ID = :fid, BATCH_ID = :bid, PRICE = :price',
      ExpressionAttributeNames: { '#type': 'TYPE' },
      ExpressionAttributeValues: {
        ':type': 'SUMMARY',
        ':sk': 'SUMMARY',
        ':fid': factoryId,
        ':bid': batchId,
        ':price': String(Number(price)),
      },
      ReturnValues: 'ALL_NEW',
    })
  );
  return result.Attributes;
}

// ─── Factory Reading APIs (GSI_FACTORY_TIME) ─────────────────────────────────

async function getFactoryReadings(factoryId, { limit = 100, startTime, endTime } = {}) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'GSI_FACTORY_TIME',
    ScanIndexForward: false,
    Limit: Number(limit),
  };

  if (startTime && endTime) {
    params.KeyConditionExpression = 'FACTORY_ID = :fid AND #ts BETWEEN :start AND :end';
    params.ExpressionAttributeNames = { '#ts': 'TIMESTAMP' };
    params.ExpressionAttributeValues = { ':fid': factoryId, ':start': startTime, ':end': endTime };
  } else if (startTime) {
    params.KeyConditionExpression = 'FACTORY_ID = :fid AND #ts >= :start';
    params.ExpressionAttributeNames = { '#ts': 'TIMESTAMP' };
    params.ExpressionAttributeValues = { ':fid': factoryId, ':start': startTime };
  } else {
    params.KeyConditionExpression = 'FACTORY_ID = :fid';
    params.ExpressionAttributeValues = { ':fid': factoryId };
  }

  try {
    const result = await ddb.send(new QueryCommand(params));
    const sensors = (result.Items || []).filter((i) => i.TYPE === 'SENSOR');
    if (sensors.some((i) => !hasSensorValues(i))) {
      let items = await scanSensorsForFactory(factoryId);
      if (startTime) items = items.filter((i) => String(i.TIMESTAMP) >= startTime);
      if (endTime) items = items.filter((i) => String(i.TIMESTAMP) <= endTime);
      return items
        .sort((a, b) => String(b.TIMESTAMP).localeCompare(String(a.TIMESTAMP)))
        .slice(0, Number(limit));
    }
    return sensors;
  } catch (err) {
    if (!canFallbackToScan(err)) throw err;
    let items = await scanSensorsForFactory(factoryId);
    if (startTime) items = items.filter((i) => String(i.TIMESTAMP) >= startTime);
    if (endTime) items = items.filter((i) => String(i.TIMESTAMP) <= endTime);
    return items
      .sort((a, b) => String(b.TIMESTAMP).localeCompare(String(a.TIMESTAMP)))
      .slice(0, Number(limit));
  }
}

// Build a flat batch list for a factory by grouping GSI_FACTORY_TIME readings.
// Fetches the latest reading per batch, then attaches the SUMMARY for GLP/PRICE.
async function getFactoryBatches(factoryId) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'GSI_FACTORY_TIME',
    KeyConditionExpression: 'FACTORY_ID = :fid',
    ExpressionAttributeValues: { ':fid': factoryId },
    ScanIndexForward: false,
    // Cap at 2000 items to avoid very slow calls on large factories
    Limit: 2000,
  };

  let sensorItems;
  try {
    const result = await ddb.send(new QueryCommand(params));
    sensorItems = (result.Items || []).filter((i) => i.TYPE === 'SENSOR');
    if (sensorItems.some((i) => !hasSensorValues(i))) {
      sensorItems = await scanSensorsForFactory(factoryId);
      sensorItems.sort((a, b) => String(b.TIMESTAMP).localeCompare(String(a.TIMESTAMP)));
      sensorItems = sensorItems.slice(0, 2000);
    }
  } catch (err) {
    if (!canFallbackToScan(err)) throw err;
    sensorItems = await scanSensorsForFactory(factoryId);
    sensorItems.sort((a, b) => String(b.TIMESTAMP).localeCompare(String(a.TIMESTAMP)));
    sensorItems = sensorItems.slice(0, 2000);
  }

  // Group: keep the most recent reading per batch
  const batchMap = {};
  for (const item of sensorItems) {
    const bid = item.BATCH_ID;
    if (!bid) continue;
    if (!batchMap[bid] || item.TIMESTAMP > batchMap[bid].TIMESTAMP) {
      batchMap[bid] = item;
    }
  }

  const batchIds = Object.keys(batchMap);
  if (batchIds.length === 0) return [];

  // Fetch summaries in parallel
  const summaries = await Promise.all(batchIds.map((bid) => getBatchSummary(bid)));
  const summaryMap = {};
  for (let i = 0; i < batchIds.length; i++) {
    if (summaries[i]) summaryMap[batchIds[i]] = summaries[i];
  }

  const batches = batchIds.map((batchId) => {
    const latest = batchMap[batchId];
    const summary = summaryMap[batchId];
    const price = priceValue(summary?.PRICE);
    return {
      batchId,
      lastTimestamp: latest.TIMESTAMP,
      latestTemperature: latest.TEMPERATURE ?? null,
      latestHumidity: latest.HUMIDITY ?? null,
      latestRgRatio: readingValue(latest, 'RG_RATIO', 'COLOR'),
      latestMq137: readingValue(latest, 'MQ137', 'MQ135'),
      latestTgs2620: readingValue(latest, 'TGS2620'),
      latestTgs822: readingValue(latest, 'TGS822'),
      glp: summary?.GLP ?? null,
      price,
    };
  });

  batches.sort((a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp));
  return batches;
}

// ─── Factory Price APIs (GSI_FACTORY_PRICE) ──────────────────────────────────

async function getHighestPriceBatch(factoryId) {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI_FACTORY_PRICE',
        KeyConditionExpression: 'FACTORY_ID = :fid',
        ExpressionAttributeValues: { ':fid': factoryId },
        ScanIndexForward: false, // descending price
        Limit: 5,
      })
    );
    const summaries = (result.Items || []).filter((i) => i.TYPE === 'SUMMARY');
    return summaries[0] ?? null;
  } catch (err) {
    if (!canFallbackToScan(err)) throw err;
    const summaries = await scanSummariesForFactory(factoryId);
    return summaries
      .filter((i) => priceValue(i.PRICE) != null)
      .sort((a, b) => Number(b.PRICE) - Number(a.PRICE))[0] ?? null;
  }
}

async function getLowestPriceBatch(factoryId) {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI_FACTORY_PRICE',
        KeyConditionExpression: 'FACTORY_ID = :fid',
        ExpressionAttributeValues: { ':fid': factoryId },
        ScanIndexForward: true, // ascending price
        Limit: 5,
      })
    );
    const summaries = (result.Items || []).filter((i) => i.TYPE === 'SUMMARY');
    return summaries[0] ?? null;
  } catch (err) {
    if (!canFallbackToScan(err)) throw err;
    const summaries = await scanSummariesForFactory(factoryId);
    return summaries
      .filter((i) => priceValue(i.PRICE) != null)
      .sort((a, b) => Number(a.PRICE) - Number(b.PRICE))[0] ?? null;
  }
}

// Return all priced summaries for a factory (for revenue calculations).
async function getAllPricedBatches(factoryId) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'GSI_FACTORY_PRICE',
    KeyConditionExpression: 'FACTORY_ID = :fid',
    ExpressionAttributeValues: { ':fid': factoryId },
    ScanIndexForward: false,
  };
  try {
    const items = await queryAll(params);
    return items.filter((i) => i.TYPE === 'SUMMARY' && priceValue(i.PRICE) != null);
  } catch (err) {
    if (!canFallbackToScan(err)) throw err;
    const summaries = await scanSummariesForFactory(factoryId);
    return summaries.filter((i) => priceValue(i.PRICE) != null);
  }
}

module.exports = {
  createSensorReading,
  getFermentationState,
  setFermentationState,
  getBatchReadings,
  getBatchSummary,
  upsertBatchGlp,
  upsertBatchPrice,
  getFactoryReadings,
  getFactoryBatches,
  getHighestPriceBatch,
  getLowestPriceBatch,
  getAllPricedBatches,
};

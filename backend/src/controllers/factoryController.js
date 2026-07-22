const {
  getFactoryReadings,
  getFactoryBatches,
  getHighestPriceBatch,
  getLowestPriceBatch,
} = require('../services/dynamoService');
const { ok, serverError } = require('../utils/response');

function readingValue(item, key, fallbackKey) {
  return item[key] ?? (fallbackKey ? item[fallbackKey] : undefined) ?? null;
}

// GET /api/factories/:factoryId/readings?limit=100&startTime=&endTime=
async function getReadings(req, res) {
  const { factoryId } = req.params;
  const { limit, startTime, endTime } = req.query;
  try {
    const items = await getFactoryReadings(factoryId, { limit, startTime, endTime });
    const data = items.map((i) => ({
      timestamp: i.TIMESTAMP,
      deviceId: i.DEVICE_ID,
      factoryId: i.FACTORY_ID,
      batchId: i.BATCH_ID,
      rgRatio: readingValue(i, 'RG_RATIO', 'COLOR'),
      temperature: i.TEMPERATURE ?? null,
      humidity: i.HUMIDITY ?? null,
      mq137: readingValue(i, 'MQ137', 'MQ135'),
      tgs2620: readingValue(i, 'TGS2620'),
      tgs822: readingValue(i, 'TGS822'),
    }));
    return ok(res, data);
  } catch (err) {
    return serverError(res, 'Failed to fetch factory readings', err);
  }
}

// GET /api/factories/:factoryId/batches
async function getBatches(req, res) {
  const { factoryId } = req.params;
  try {
    const batches = await getFactoryBatches(factoryId);
    return res.json({ success: true, factoryId, batches });
  } catch (err) {
    return serverError(res, 'Failed to fetch factory batches', err);
  }
}

// GET /api/factories/:factoryId/highest-price
async function getHighestPrice(req, res) {
  const { factoryId } = req.params;
  try {
    const item = await getHighestPriceBatch(factoryId);
    return ok(res, item ? {
      batchId: item.BATCH_ID,
      factoryId: item.FACTORY_ID,
      price: item.PRICE,
      glp: item.GLP ?? null,
    } : null);
  } catch (err) {
    return serverError(res, 'Failed to fetch highest-price batch', err);
  }
}

// GET /api/factories/:factoryId/lowest-price
async function getLowestPrice(req, res) {
  const { factoryId } = req.params;
  try {
    const item = await getLowestPriceBatch(factoryId);
    return ok(res, item ? {
      batchId: item.BATCH_ID,
      factoryId: item.FACTORY_ID,
      price: item.PRICE,
      glp: item.GLP ?? null,
    } : null);
  } catch (err) {
    return serverError(res, 'Failed to fetch lowest-price batch', err);
  }
}

// GET /api/factories/:factoryId/dashboard
async function getDashboard(req, res) {
  const { factoryId } = req.params;
  try {
    const [latestReadings, batches, highestBatch, lowestBatch] = await Promise.all([
      getFactoryReadings(factoryId, { limit: 10 }),
      getFactoryBatches(factoryId),
      getHighestPriceBatch(factoryId),
      getLowestPriceBatch(factoryId),
    ]);

    return res.json({
      success: true,
      factoryId,
      totalBatches: batches.length,
      latestReadings: latestReadings.map((i) => ({
        timestamp: i.TIMESTAMP,
        deviceId: i.DEVICE_ID,
        batchId: i.BATCH_ID,
        rgRatio: readingValue(i, 'RG_RATIO', 'COLOR'),
        temperature: i.TEMPERATURE ?? null,
        humidity: i.HUMIDITY ?? null,
        mq137: readingValue(i, 'MQ137', 'MQ135'),
        tgs2620: readingValue(i, 'TGS2620'),
        tgs822: readingValue(i, 'TGS822'),
      })),
      highestPriceBatch: highestBatch ? {
        batchId: highestBatch.BATCH_ID,
        price: highestBatch.PRICE,
        glp: highestBatch.GLP ?? null,
      } : null,
      lowestPriceBatch: lowestBatch ? {
        batchId: lowestBatch.BATCH_ID,
        price: lowestBatch.PRICE,
        glp: lowestBatch.GLP ?? null,
      } : null,
    });
  } catch (err) {
    return serverError(res, 'Failed to build factory dashboard', err);
  }
}

module.exports = { getReadings, getBatches, getHighestPrice, getLowestPrice, getDashboard };

const {
  getBatchReadings,
  getBatchSummary,
  upsertBatchGlp,
  upsertBatchPrice,
} = require('../services/dynamoService');
const { ok, notFound, badRequest, serverError } = require('../utils/response');
const { requireFields, isValidNumber } = require('../utils/validation');

function readingValue(item, key, fallbackKey) {
  return item[key] ?? (fallbackKey ? item[fallbackKey] : undefined) ?? null;
}

// GET /api/batches/:batchId/readings
async function getReadings(req, res) {
  const { batchId } = req.params;
  try {
    const items = await getBatchReadings(batchId);
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
    return res.json({
      success: true,
      batchId,
      count: data.length,
      data,
    });
  } catch (err) {
    return serverError(res, 'Failed to fetch batch readings', err);
  }
}

// GET /api/batches/:batchId/graphs
async function getGraphs(req, res) {
  const { batchId } = req.params;
  try {
    const items = await getBatchReadings(batchId);
    const temperature = [];
    const humidity = [];
    const rgRatio = [];
    const mq137 = [];
    const tgs2620 = [];
    const tgs822 = [];
    for (const i of items) {
      const ts = i.TIMESTAMP;
      if (i.TEMPERATURE != null) temperature.push({ timestamp: ts, value: i.TEMPERATURE });
      if (i.HUMIDITY != null) humidity.push({ timestamp: ts, value: i.HUMIDITY });
      const rg = readingValue(i, 'RG_RATIO', 'COLOR');
      const mq = readingValue(i, 'MQ137', 'MQ135');
      if (rg != null) rgRatio.push({ timestamp: ts, value: rg });
      if (mq != null) mq137.push({ timestamp: ts, value: mq });
      if (i.TGS2620 != null) tgs2620.push({ timestamp: ts, value: i.TGS2620 });
      if (i.TGS822 != null) tgs822.push({ timestamp: ts, value: i.TGS822 });
    }
    return res.json({ success: true, batchId, temperature, humidity, rgRatio, mq137, tgs2620, tgs822 });
  } catch (err) {
    return serverError(res, 'Failed to fetch graph data', err);
  }
}

// GET /api/batches/:batchId/summary
async function getSummary(req, res) {
  const { batchId } = req.params;
  try {
    const item = await getBatchSummary(batchId);
    if (!item) {
      return notFound(res, `No summary found for batch ${batchId}. GLP and PRICE may not have been set yet.`);
    }
    return ok(res, {
      batchId: item.BATCH_ID,
      factoryId: item.FACTORY_ID,
      glp: item.GLP ?? null,
      price: item.PRICE ?? null,
      summaryKey: item.SUMMARY_KEY,
      type: item.TYPE,
    });
  } catch (err) {
    return serverError(res, 'Failed to fetch batch summary', err);
  }
}

// PUT /api/batches/:batchId/glp
async function updateGlp(req, res) {
  const { batchId } = req.params;
  const body = req.body;
  const factoryId = body.factoryId ?? body.FACTORY_ID;
  const glp = body.glp ?? body.GLP;
  const missing = [];
  if (!factoryId) missing.push('factoryId');
  if (glp === undefined || glp === null) missing.push('glp');
  if (missing.length > 0) return badRequest(res, `Missing: ${missing.join(', ')}`);
  if (!isValidNumber(glp) || Number(glp) < 0 || Number(glp) > 100) {
    return badRequest(res, 'glp must be a number between 0 and 100');
  }
  try {
    const attrs = await upsertBatchGlp(batchId, factoryId, glp);
    return ok(res, {
      DEVICE_ID: attrs.DEVICE_ID,
      TIMESTAMP: attrs.TIMESTAMP,
      TYPE: attrs.TYPE,
      SUMMARY_KEY: attrs.SUMMARY_KEY,
      FACTORY_ID: attrs.FACTORY_ID,
      BATCH_ID: attrs.BATCH_ID,
      GLP: attrs.GLP,
      PRICE: attrs.PRICE ?? null,
      batchId: attrs.BATCH_ID,
      factoryId: attrs.FACTORY_ID,
      glp: attrs.GLP,
      price: attrs.PRICE ?? null,
    }, 'GLP updated');
  } catch (err) {
    console.error('[updateGlp]', err);
    return res.status(500).json({
      success: false,
      message: err?.message ?? 'Failed to update GLP',
      data: null,
    });
  }
}

// PUT /api/batches/:batchId/price
async function updatePrice(req, res) {
  const { batchId } = req.params;
  const body = req.body;
  const factoryId = body.factoryId ?? body.FACTORY_ID;
  const price = body.price ?? body.PRICE;
  const missing = [];
  if (!factoryId) missing.push('factoryId');
  if (price === undefined || price === null) missing.push('price');
  if (missing.length > 0) return badRequest(res, `Missing: ${missing.join(', ')}`);
  if (!isValidNumber(price) || Number(price) <= 0) {
    return badRequest(res, 'price must be a positive number');
  }
  try {
    const attrs = await upsertBatchPrice(batchId, factoryId, price);
    return ok(res, {
      DEVICE_ID: attrs.DEVICE_ID,
      TIMESTAMP: attrs.TIMESTAMP,
      TYPE: attrs.TYPE,
      SUMMARY_KEY: attrs.SUMMARY_KEY,
      FACTORY_ID: attrs.FACTORY_ID,
      BATCH_ID: attrs.BATCH_ID,
      GLP: attrs.GLP ?? null,
      PRICE: attrs.PRICE,
      batchId: attrs.BATCH_ID,
      factoryId: attrs.FACTORY_ID,
      glp: attrs.GLP ?? null,
      price: attrs.PRICE,
    }, 'Price updated');
  } catch (err) {
    console.error('[updatePrice]', err);
    return res.status(500).json({
      success: false,
      message: err?.message ?? 'Failed to update price',
      data: null,
    });
  }
}

module.exports = { getReadings, getGraphs, getSummary, updateGlp, updatePrice };

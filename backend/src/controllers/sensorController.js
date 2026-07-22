const { createSensorReading } = require('../services/dynamoService');
const { ok, created, badRequest, serverError } = require('../utils/response');
const { requireFields, isValidNumber, isValidTimestamp } = require('../utils/validation');

async function ingestReading(req, res) {
  const body = req.body;
  const missing = requireFields(body, [
    'DEVICE_ID',
    'TIMESTAMP',
    'FACTORY_ID',
    'BATCH_ID',
    'RG_RATIO',
    'TEMPERATURE',
    'HUMIDITY',
    'MQ137',
    'TGS2620',
    'TGS822',
  ]);
  if (missing.length > 0) {
    return badRequest(res, `Missing required fields: ${missing.join(', ')}`);
  }
  if (!isValidTimestamp(body.TIMESTAMP)) {
    return badRequest(res, 'TIMESTAMP must be a valid ISO 8601 string e.g. 2026-04-23T10:20:00Z');
  }
  for (const field of ['RG_RATIO', 'TEMPERATURE', 'HUMIDITY', 'MQ137', 'TGS2620', 'TGS822']) {
    if (!isValidNumber(body[field])) {
      return badRequest(res, `${field} must be a valid number`);
    }
  }
  try {
    const record = await createSensorReading(body);
    return created(res, record, 'Sensor reading stored');
  } catch (err) {
    return serverError(res, 'Failed to store sensor reading', err);
  }
}

module.exports = { ingestReading };

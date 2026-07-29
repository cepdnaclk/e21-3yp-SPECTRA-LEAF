const { IoTDataPlaneClient, UpdateThingShadowCommand } = require('@aws-sdk/client-iot-data-plane');
const {
  getFermentationState,
  setFermentationState,
} = require('../services/dynamoService');

const iotClient = new IoTDataPlaneClient({
  region: process.env.AWS_IOT_REGION || 'ap-south-1',
});

const THING_NAME = process.env.AWS_IOT_THING_NAME || 'SpectraLeaf_Proto_01';

function toResponse(item, fallbackFactoryId) {
  return {
    factoryId: item?.FACTORY_ID ?? fallbackFactoryId,
    status: item?.STATUS ?? 'STOPPED',
    batchId: item?.BATCH_ID ?? null,
    deviceId: item?.SENSOR_DEVICE_ID ?? null,
    startedAt: item?.STARTED_AT ?? null,
    updatedAt: item?.UPDATED_AT ?? null,
  };
}

exports.getFermentationState = async (req, res) => {
  const { factoryId } = req.params;

  try {
    const state = await getFermentationState(factoryId);
    return res.status(200).json({
      success: true,
      data: toResponse(state, factoryId),
    });
  } catch (error) {
    console.error('[Fermentation State Read Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to read fermentation state',
      error: error.message,
    });
  }
};

exports.controlFermentation = async (req, res) => {
  const status = String(req.body.status ?? '').toUpperCase();
  const factoryId = req.body.factory_id ?? req.body.factoryId;
  const requestedBatchId = req.body.batch_id ?? req.body.batchId;
  const requestedDeviceId = req.body.device_id ?? req.body.deviceId;

  if (!['RUNNING', 'STOPPED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'status must be RUNNING or STOPPED',
    });
  }
  if (!factoryId) {
    return res.status(400).json({ success: false, message: 'factory_id is required' });
  }
  if (status === 'RUNNING' && !requestedBatchId) {
    return res.status(400).json({
      success: false,
      message: 'batch_id is required when starting fermentation',
    });
  }

  try {
    const current = await getFermentationState(factoryId);
    const batchId = status === 'RUNNING'
      ? String(requestedBatchId).trim().toUpperCase()
      : (requestedBatchId && requestedBatchId !== 'NONE'
        ? String(requestedBatchId).trim().toUpperCase()
        : current?.BATCH_ID ?? null);
    const deviceId = requestedDeviceId
      ? String(requestedDeviceId).trim().toUpperCase()
      : current?.SENSOR_DEVICE_ID ?? 'DEV001';

    if (
      status === 'RUNNING'
      && current?.STATUS === 'RUNNING'
      && current?.BATCH_ID
      && current.BATCH_ID !== batchId
    ) {
      return res.status(409).json({
        success: false,
        message: `Batch ${current.BATCH_ID} is already running for factory ${factoryId}`,
        data: toResponse(current, factoryId),
      });
    }

    const payload = {
      state: {
        desired: {
          status,
          batch_id: batchId ?? 'NONE',
          factory_id: factoryId,
          device_id: deviceId,
        },
      },
    };

    const command = new UpdateThingShadowCommand({
      thingName: THING_NAME,
      payload: Buffer.from(JSON.stringify(payload))
    });

    await iotClient.send(command);

    const stored = await setFermentationState({
      factoryId,
      status,
      batchId,
      sensorDeviceId: deviceId,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: status === 'RUNNING'
        ? `Fermentation started for batch ${batchId}`
        : 'Live sensor stream stopped',
      data: toResponse(stored, factoryId),
    });

  } catch (error) {
    console.error('[IoT Shadow Update Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update fermentation control',
      error: error.message
    });
  }
};

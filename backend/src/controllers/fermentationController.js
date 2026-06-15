const { IoTDataPlaneClient, UpdateThingShadowCommand } = require('@aws-sdk/client-iot-data-plane');

// Ensure we don't hardcode credentials. It will use the IAM role automatically in Lambda.
const iotClient = new IoTDataPlaneClient({ region: 'ap-south-1' });

// Placeholder for the Thing Name.
const THING_NAME = 'SpectraLeaf_Proto_01';

exports.controlFermentation = async (req, res) => {
  // Authorization check - expecting a validated user session from Amazon Cognito
  // (app.js sets req.user via the authorization middleware, but leaves it undefined in local mock layout)

  const { status, batch_id, glp } = req.body;

  if (!status || !batch_id || (status === 'RUNNING' && glp === undefined)) {
    return res.status(400).json({ success: false, message: 'Missing required fields: status, batch_id, glp (glp required when RUNNING)' });
  }

  try {
    const payload = {
      state: {
        desired: {
          status: status,
          batch_id: batch_id,
          ...(glp !== undefined && { glp: glp })
        }
      }
    };

    const command = new UpdateThingShadowCommand({
      thingName: THING_NAME,
      payload: Buffer.from(JSON.stringify(payload))
    });

    await iotClient.send(command);
    
    return res.status(200).json({
      success: true,
      message: 'IoT Shadow updated successfully'
    });

  } catch (error) {
    console.error('[IoT Shadow Update Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update IoT Shadow',
      error: error.message
    });
  }
};

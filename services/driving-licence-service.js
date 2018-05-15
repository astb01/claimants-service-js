const config = require('config');
const rp = require('request-promise');

const serviceUrl = config.get('drivingLicenceServiceUrl');
const servicePath = config.get('drivingLicenceServiceEndPoint');

const validate = async (requestPayload) => {
  const options = {
    uri: `${serviceUrl}/${servicePath}`,
    json: true,
    method: 'POST',
    body: requestPayload,
  };

  try {
    const response = await rp(options);
    return response;
  } catch (err) {
    return err;
  }
};

module.exports = { validate };

const rp = require('request-promise');
const config = require('config');

const ninoServiceUrl = config.get('ninoServiceUrl');
const ninoServicePath = config.get('ninoServicePath');

const validate = (requestPayload) => {
  const options = {
    uri: `${ninoServiceUrl}/${ninoServicePath}`,
    json: true,
    method: 'POST',
    body: requestPayload,
  };

  return rp(options)
    .then(parsedResponse => parsedResponse)
    .catch(err => err);
};

module.exports = { validate };

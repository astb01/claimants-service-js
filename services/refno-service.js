const rp = require('request-promise');
const config = require('config');

const refNoServiceUrl = config.get('refNoServiceUrl');
const refNoServicePath = config.get('refNoServicePath');

const validate = (requestPayload) => {
  const options = {
    uri: `${refNoServiceUrl}/${refNoServicePath}`,
    json: true,
    method: 'POST',
    body: requestPayload,
  };

  return rp(options)
    .then(parsedResponse => parsedResponse)
    .catch(err => err);
};

module.exports = { validate };

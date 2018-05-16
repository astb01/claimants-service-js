const Claimant = require('../models/Claimant');
const drivingLicenceService = require('../services/driving-licence-service');
const Joi = require('joi');
const {
  SERVICE_UNAVAILABLE, OK, BAD_REQUEST, NO_CONTENT, NOT_FOUND, CREATED,
} = require('http-status-codes');

const createValidationSchema = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  postCode: Joi.string()
    .regex(/([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})/)
    .required(),
  drivingLicenceNo: Joi.string()
    .regex(/^[a-zA-Z]{2,}\d{6}[a-zA-Z0-9]{6}$/)
    .allow('')
    .allow(null),
  refNo: Joi.string()
    .regex(/^\s*[a-zA-Z]{2}(?:\s*\d\s*){6}[a-zA-Z]?\s*$/)
    .required(),
}).options({ allowUnknown: true, abortEarly: true });

const updateSchema = Joi.object().keys({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  street: Joi.string().optional(),
  city: Joi.string().optional(),
  postCode: Joi.string().optional(),
}).options({ allowUnknown: false, abortEarly: true });

const getClaimants = async (req, res) => {
  const claimants = await Claimant.find({});
  return res.send(claimants);
};

const getClaimantById = async (req, res) => {
  const { claimantId } = req.params;

  try {
    const claimant = await Claimant.findById(claimantId);
    res.send(claimant);
  } catch (err) {
    res.status(NOT_FOUND).send(err.name);
  }
};

const createClaimant = async (req, res) => {
  try {
    const validationResult = await Joi.validate(req.body, createValidationSchema);

    if (validationResult.drivingLicenceNo) {
      const drivingRequestBody = {
        firstName: '',
        lastName: '',
        drivingLicenceNo: '',
        dob: '',
      };

      Object.keys(validationResult).forEach((key) => {
        if (key in drivingRequestBody) {
          drivingRequestBody[key] = validationResult[key];
        }
      });

      try {
        const drivingResponse = await drivingLicenceService.validate(drivingRequestBody);

        if (drivingResponse.httpStatus === OK) {
          const createdClaimant = await Claimant.create(validationResult);

          return res.status(CREATED).send(createdClaimant);
        }

        return res.status(drivingResponse.httpStatus).send('Unexpected service error. Please check logs');
      } catch (drivingError) {
        const status = drivingError.httpStatus || drivingError.statusCode || SERVICE_UNAVAILABLE;
        return res.status(status).send(drivingError);
      }
    } else {
      const createdClaimant = await Claimant.create(validationResult);
      return res.status(CREATED).send(createdClaimant);
    }
  } catch (validationError) {
    return res.status(BAD_REQUEST).send(validationError);
  }
};

const updateClaimant = async (req, res) => {
  const { claimantId } = req.params;

  try {
    const validationResult = await Joi.validate(req.body, updateSchema);

    const updatedClaimant = await Claimant
      .findByIdAndUpdate(claimantId, { $set: validationResult });

    if (!updatedClaimant) {
      return res.status(NOT_FOUND).send('Claimant not found matching given ID');
    }

    return res.status(NO_CONTENT).send(updatedClaimant);
  } catch (validationError) {
    return res.status(BAD_REQUEST).send(validationError.name);
  }
};

const deleteClaimant = async (req, res) => {
  const { claimantId } = req.params;
  const deletedClaimant = await Claimant.findByIdAndRemove(claimantId);

  if (!deletedClaimant) {
    return res.status(NOT_FOUND).send(`Claimant matching ID ${claimantId} not found`);
  }

  return res.send(deletedClaimant);
};

const getClaimantByRefNo = async (req, res) => {
  const { refNo } = req.params;
  const claimant = await Claimant.findOne({ refNo });

  if (!claimant) {
    return res.status(NOT_FOUND).send(`Claimant matching Ref No ${refNo} not found`);
  }

  return res.send(claimant);
};

module.exports = {
  getClaimants,
  getClaimantById,
  createClaimant,
  updateClaimant,
  deleteClaimant,
  getClaimantByRefNo,
};

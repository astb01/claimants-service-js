const router = require('express').Router();
const claimantService = require('../services/claimants-service');

router.get('/claimants', claimantService.getClaimants);

router.get('/claimants/:claimantId', claimantService.getClaimantById);

router.post('/claimants', claimantService.createClaimant);

router.put('/claimants/:claimantId', claimantService.updateClaimant);

router.delete('/claimants/:claimantId', claimantService.deleteClaimant);

router.get('/claimants/ref/:refNo', claimantService.getClaimantByRefNo);

module.exports = router;

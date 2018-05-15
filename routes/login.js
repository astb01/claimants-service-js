const router = require('express').Router();
const authService = require('../services/auth-service');

router.post('/', authService.doLogin);

module.exports = router;

const router = require('express').Router();

const {
    get_access_token,
} = require('../controllers/plaid');

router.post('/get_access_token', get_access_token);

module.exports = router;

const router = require('express').Router();

const {
    set_access_token,

} = require('../controllers/plaid');

router.post('/set_access_token', set_access_token);

module.exports = router;

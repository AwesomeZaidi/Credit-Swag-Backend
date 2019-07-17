const router = require('express').Router();

const {
    get_access_token,
    transactions
} = require('../controllers/plaid');

router.post('/get_access_token', get_access_token);
router.post('/transactions', transactions);

module.exports = router;

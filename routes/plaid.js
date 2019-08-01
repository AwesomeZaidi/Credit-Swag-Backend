const router = require('express').Router();

const {
    get_access_token,
    transactions,
    getBalanceGraphData,
} = require('../controllers/plaid');

router.post('/get_access_token', get_access_token);
router.post('/transactions', transactions);
router.get('/getBalanceGraphData', getBalanceGraphData);

module.exports = router;

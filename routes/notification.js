const router = require('express').Router();

const {
    overdraftNotification,
    minimumBalanceNotification,
    bigTransactionNotification,
} = require('../controllers/notification');

router.post('/overdraftNotification', overdraftNotification);
router.post('/minimumBalanceNotification', minimumBalanceNotification);
router.post('/bigTransactionNotification', bigTransactionNotification);

module.exports = router;

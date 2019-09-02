const router = require('express').Router();

const {
    addBill,
} = require('../controllers/bill');

router.post('/addBill', addBill);

module.exports = router;

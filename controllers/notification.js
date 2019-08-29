// controllers/goal.js

const User = require('../models/user');

const overdraftNotification = async (req, res) => {
    try {
        let user = await User.findById(req.body.userId);
        user.overdraftNotification = req.body.notificationOnOrOff;
        user.save();
        // I've never sent back specific data like this to on the client update a property on an object in my store!
        return res.json(user.overdraftNotification);
    } catch(e) {
        return res.json('Something went wrong, please try again or contact support.');
    }
};

const minimumBalanceNotification = async (req, res) => {
    try {
        let user = await User.findById(req.body.userId);
        req.user.minimumBalanceNotification = req.body.minimumBalanceNotification;
        req.user.minimumBalanceAmount = req.body.minimumBalanceAmount;
        user.save();
        return res.json(user);
    } catch(e) {
        return res.json('Something went wrong, please try again or contact support.');
    }
};  

const bigTransactionNotification = async (req, res) => {
    try {
        let user = await User.findById(req.body.userId);
        req.user.bigTransactionNotification = req.body.bigTransactionNotification;
        req.user.bigTransactionAmount = req.body.bigTransactionAmount;
        user.save();
        return res.json(user);
    } catch(e) {
        return res.json('Something went wrong, please try again or contact support.');
    }
};  

module.exports = {
    overdraftNotification,
    minimumBalanceNotification,
    bigTransactionNotification
};

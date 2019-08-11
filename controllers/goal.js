// controllers/goal.js

const _ = require('lodash');
const User = require('../models/user');
const savingGoal = require('../models/savingGoal');

const createSavingGoal = (req, res) => {
    try {
        const savingGoal = new savingGoal(req.body);
        req.user.savingGoals.push(savingGoal);
        savingGoal.save();
        user.save();
        return res.json(user);
    } catch(e) {
        console.log('e:', e);
        return res.json('Something went wrong, please try again or contact support.');
    }
};
  
module.exports = {
    createSavingGoal
};

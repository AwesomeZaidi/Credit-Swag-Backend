// controllers/goal.js


const _ = require('lodash');
const User = require('../models/user');
// const Goal = require('../models/savingGoal');
const plaid = require('plaid');
const moment = require('moment');

const PLAID_CLIENT_ID = '5d7da1d5f793f300137e8ff3'; // USE IN SANDBOX AND DEV
// const PLAID_SECRET = 'enternewhere - using techmade plaid account now, old account fucked.'; // USE IN SANDBOX
const PLAID_SECRET = '978024e80a84d06687224c6e186ab5'; // USE IN DEV
const PLAID_PUBLIC_KEY = 'f04faf8b95bc5d5e0357791a52b40c'; // USE IN SANDBOX AND DEV
// const PLAID_ENV = 'sandbox';
const PLAID_ENV = 'development';
const { Expo } = require('expo-server-sdk');

var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  {version: '2019-05-29', clientApp: 'Credit Swag'}
);

const addGoal = async (req, res) => {
    try {
        const name = req.body.goalData.name;
        const limit = Number(req.body.goalData.limit);
        const category = req.body.goalData.category;    
        const date = req.body.goalData.date;  
        const goal = {
            name: name,
            limit: limit,
            category: category,
            date: date,
            health: 0,
            spendings: []
        }
        let user = await User.findById(req.body.userId); 
        user.savingGoals.push(goal);
        user.save();
        return res.json({user, goal});
    } catch(e) {
        return res.json('Something went wrong, please try again or contact support.');
    }
};

const getSavingGoals = async (req, res) => {
    let user = await User.findById(req.body.userId); 
    let savingGoals = user.savingGoals;
    return res.json(savingGoals);
};

const getTransactions = async (req, res, next) => {
    let user = await User.findById(req.body.userId);
    let goal = user.savingGoals[req.body.goalIndex];
    const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    let _ = await client.getTransactions(user.access_token, startDate, endDate, { count: 250, offset: 0 }, (error, res) => {
        if (error != null) {
        return response.json({
            error
        });
        } else {
        let transactions = res.transactions;
        goal.spendings = [] // important to reset it here.
        goal.health = 0;
        transactions.forEach((transaction) => { 
            let categories = transaction.category;
            if (categories.includes(goal.category)) {
                goal.spendings.push(
                    {
                        amount: transaction.amount,
                        date: transaction.date
                    }
                )   
                goal.health += transaction.amount
            }
        })

        let num = goal.health;
        num = Number(num);
        num = num.toFixed(2)
        goal.health = num;
        user.savingGoals[req.body.goalIndex] = goal;
        req.savingGoals = user.savingGoals
        req.user = req.user;
        next();
        };
    });
}

const fetchGoal = async (req,  res) => {
    const savingGoals = req.savingGoals;
    let user = await User.findById(req.body.userId);
    user.savingGoals = savingGoals;
    user.save();   
    res.json(user);
};
  
module.exports = {
    addGoal,
    fetchGoal,
    getSavingGoals,
    getTransactions
};


// We need this whenever:

// Creates a goal - you actually need to do this calculation
// right at that point and show the loading icon as the network req happens.

// Anytime they hit the page, they should see where they're at for today
// and we can do this in our existing cron jobs transactional api request.

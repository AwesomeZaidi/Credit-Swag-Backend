// controllers/goal.js

const _ = require('lodash');
const User = require('../models/user');
// const Goal = require('../models/savingGoal');
const plaid = require('plaid');
const moment = require('moment');

const PLAID_CLIENT_ID = '5d280da44388c80013735b14';
const PLAID_SECRET = 'd5df4201427a1cbec5de25ade9bf41';
const PLAID_PUBLIC_KEY = 'e7325291c9f6c0bdb72a3829865923';
const PLAID_ENV = 'sandbox';

const client = new plaid.Client(
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_PUBLIC_KEY,
    plaid.environments[PLAID_ENV],
    {version: '2019-05-29', clientApp: 'Plaid Quickstart'}
);

const addGoal = async (req, res) => {
    try {
        const name = req.body.goalData.name;
        const limit = Number(req.body.goalData.limit);
        const category = req.body.goalData.category;    
        const date = req.body.goalData.date;  
        // const goal = new Goal({name, limit, category, date});
        const goal = {
            name: name,
            limit: limit,
            category: category,
            date: date
        }
        let user = await User.findById(req.body.userId); 
        user.savingGoals.push(goal);
        // goal.save();
        user.save();
        return res.json(goal);
    } catch(e) {
        return res.json('Something went wrong, please try again or contact support.');
    }
};

const getSavingGoals = async (req, res) => {
    let user = await User.findById(req.body.userId); 
    let savingGoals = user.savingGoals;
    if (savingGoals) {
        const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        const endDate = moment().format('YYYY-MM-DD');
        client.getTransactions(user.access_token, startDate, endDate, {
          count: 250,
          offset: 0,
        }, (error, res) => {
          if (error != null) {
            return res.json({
              error: error
            });
          } else {
                const transactions = res.transactions;
                let updatedGoals = [];
                savingGoals.map((goal) => {
                    goal.health = 0; // reset the value!
                    transactions.map((transaction) => {
                        let categories = transactions.category;
                        Array(categories).map((category) => {
                            if (category === goal.category) {
                                goal.health += transaction.amount // found a category match, increment the goal amnt!
                            }
                        })
                    });
                    updatedGoals.push(goal)
                });
                console.log('updatedGoals:', updatedGoals);
            };
        });
        res.status(200)
    } else {
        res.status(500);
    }
  };
  
module.exports = {
    addGoal,
    getSavingGoals
};

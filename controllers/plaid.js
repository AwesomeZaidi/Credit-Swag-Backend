
// const _ = require('lodash');
const User = require('../models/user');
// const Transaction = require('../models/transaction');
const Balance = require('../models/balance');
const moment = require('moment');
const plaid = require('plaid');

// var APP_PORT = 8000;
var PLAID_CLIENT_ID = '5d280da44388c80013735b14';
var PLAID_SECRET = 'c7122b47cb5c4066c9142338b155ef';
var PLAID_PUBLIC_KEY = 'e7325291c9f6c0bdb72a3829865923';
var PLAID_ENV = 'development';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
// var PLAID_PRODUCTS = 'transactions';

// PLAID_PRODUCTS is a comma-separated list of countries for which users
// will be able to select institutions from.
// var PLAID_COUNTRY_CODES = 'US,CA,GB,FR,ES';

// We store the access_token in memory - in production, store it in a secure
// persistent data store
var ACCESS_TOKEN = null;
var PUBLIC_TOKEN = null;
var ITEM_ID = null;

var client = new plaid.Client(
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    PLAID_PUBLIC_KEY,
    plaid.environments[PLAID_ENV],
    {version: '2019-05-29', clientApp: 'Plaid Quickstart'}
);


const get_access_token = async (request, response, next) => {
    PUBLIC_TOKEN = request.body.public_token;
    let user = await User.findById(request.body.userId);
    user.public_token = PUBLIC_TOKEN;
    client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {
      if (error != null) {
        // prettyPrintResponse(error);
        return response.json({
          error: error,
        });
      }
      ACCESS_TOKEN = tokenResponse.access_token;
      ITEM_ID = tokenResponse.item_id;
      user.access_token = ACCESS_TOKEN;
      user.item_id = ITEM_ID;
      user.save();
      response.json({
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
        error: null,
      });
    });
};

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
const transactions = async (request, response, next) => {
  let user = await User.findById(request.body.userId);
  // Pull transactions for the Item for the last 30 days
  var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  var endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(user.access_token, startDate, endDate, {
    count: 250,
    offset: 0,
  }, function(error, res) {
    if (error != null) {
      return response.json({
        error: error
      });
    } else { // Success
      console.log('res.data.transactions.accounts[0]:', res.transactions.accounts[0]);
      const currentBalance = res.transactions.accounts[0].available;
      // let balance = new Balance({date: req.body.today, value: currentBalance});
      let balance = new Balance({value: currentBalance});
      balance.save();
      user.balances.push(balance);
      user.transactions = req.transactions.transactions;
      user.save();
      response.json({error: null, user});
    }
  });
};

module.exports = {
  get_access_token,
  transactions
}
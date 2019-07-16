
const _ = require('lodash');
const {
  User
} = require('../models/user');
// const jwt = require('jsonwebtoken');
const plaid = require('plaid');

var APP_PORT = 8000;
var PLAID_CLIENT_ID = '5d280da44388c80013735b14';
var PLAID_SECRET = 'd5df4201427a1cbec5de25ade9bf41';
var PLAID_PUBLIC_KEY = 'e7325291c9f6c0bdb72a3829865923';
var PLAID_ENV = 'sandbox';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
var PLAID_PRODUCTS = 'transactions';

// PLAID_PRODUCTS is a comma-separated list of countries for which users
// will be able to select institutions from.
var PLAID_COUNTRY_CODES = 'US,CA,GB,FR,ES';

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
    console.log('here in cont');
    console.log('request.body.public_token:', request.body.public_token);
    console.log('request.body.public_token:', request.body.public_token);
    console.log('request.body.public_token:', request.body.userId);
    PUBLIC_TOKEN = request.body.public_token;
    let user = await User.findById(request.body.userId);
    user.public_token = PUBLIC_TOKEN;
    user.save();
    client.exchangePublicToken(PUBLIC_TOKEN, function(error, tokenResponse) {        
      if (error != null) {
        console.log('tokenResponse:', tokenResponse);
        prettyPrintResponse(error);
        return response.json({
          error: error,
        });
      }
      ACCESS_TOKEN = tokenResponse.access_token;
      ITEM_ID = tokenResponse.item_id;
      user.access_token = ACCESS_TOKEN;
      user.item_id = ITEM_ID;
      
      prettyPrintResponse(tokenResponse);
      response.json({
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
        error: null,
      });
    });
};

module.exports = {
    get_access_token,
}
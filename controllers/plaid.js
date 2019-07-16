
const _ = require('lodash');
const {
  User
} = require('../models/user');
const jwt = require('jsonwebtoken');
const plaid = require('plaid');
// const client_id = '5d280da44388c80013735b14';
// const secret = 'd5df4201427a1cbec5de25ade9bf41';
// const PLAID_PUBLIC_KEY = 'd5df4201427a1cbec5de25ade9bf41';
// const PLAID_ENV = 'sandbox';
// const plaidClient = new plaid.Client(client_id, secret, public_key, plaid_env, {version: '2018-05-22'});
// PLAID_PUBLIC_KEY: PLAID_PUBLIC_KEY,
// PLAID_ENV: PLAID_ENV,
// PLAID_PRODUCTS: PLAID_PRODUCTS,
// PLAID_COUNTRY_CODES: PLAID_COUNTRY_CODES,

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow

const set_access_token = (req, res) => {
    console.log('in plaid controller');
    
    // const plaidClient = new plaid.Client(
    //     process.env.PLAID_CLIENT_ID,
    //     process.env.PLAID_SECRET,
    //     process.env.PUBLIC_KEY,
    //     plaid.environments.sandbox,
    //     {version: '2018-05-22'}
    //   );
    // console.log('plaidClient:', plaidClient);
    
    // client.exchangePublicToken(process.env.PUBLIC_TOKEN, function(error, tokenResponse) {
    //   if (error != null) {
    //     prettyPrintResponse(error);
    //     return response.json({
    //       error: error,
    //     });
    //   }
    //   ACCESS_TOKEN = tokenResponse.access_token;
    //   ITEM_ID = tokenResponse.item_id;
    //   prettyPrintResponse(tokenResponse);
    //   response.json({
    //     access_token: ACCESS_TOKEN,
    //     item_id: ITEM_ID,
    //     error: null,
    //   });
    // });
}
module.exports = {
    set_access_token,
}
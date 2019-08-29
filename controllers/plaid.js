// plaid.js

const User = require('../models/user');
const Balance = require('../models/balance');
const moment = require('moment');
const plaid = require('plaid');
const cron = require('node-cron');
const PLAID_CLIENT_ID = '5d280da44388c80013735b14';
const PLAID_SECRET = 'd5df4201427a1cbec5de25ade9bf41';
const PLAID_PUBLIC_KEY = 'e7325291c9f6c0bdb72a3829865923';
var PLAID_ENV = 'sandbox';
const { Expo } = require('expo-server-sdk');

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

// Retrieve user freindly balance graph data
const getBalanceGraphData = async (req, res) => {
  const data = await User.findById(req.body.userId).populate('balances');
  data ?
    res.json(data.balances)
  : 
  res.status(500);
};

// Cron job to recieve the budgets.
// const balanceCron = (req, res, user) => {
//   return (req, res) => {
//     const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
//     const endDate = moment().format('YYYY-MM-DD');
//     client.getTransactions(user.access_token, startDate, endDate, {
//       count: 250,
//       offset: 0,
//     }, (error, res) => {
//       if (error != null) {
//         return res.json({
//           error: error
//         });
//       } else { // Successful response (res)
//         const date = new Date();
//         const currentBalance = res.accounts[0].balances.available;
//         //TODO: later change model attrib name from value to currentBalance.
//         const balance = new Balance({date: date, value: currentBalance})
//         balance.save();
//         user.balances.push(balance);
//         user.save();
//         // response.json({error: null, user});
//       };
//     });
//   };
// };

// // Cron job to recieve the budgets.
var balanceCron = (req, res, user) => {
  return (req, res) => {  
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
      } else { // Successful response (res)
        const date = new Date();
        const currentBalance = res.accounts[0].balances.available;
        const balance = new Balance({date: date, value: currentBalance})
        
        balance.save();
        user.balances.push(balance);
        user.save();
        
        if (user.overdraftNotification && user.notificationToken) {
          if (user.overdraftNotification && balance <= 0) {
            sendOverdraftNotification(user, currentBalance, "Uh Oh! You over drafted 🥵👎 Add money to your account before the bank charges you in the morning!");
          }
          if (user.minimumBalanceNotification && balance < user.minimumBalanceAmount) {
            minimumBalanceNotification(user, currentBalance, `Uh Oh! You hit your minimum balance of ${user.minimumBalanceNotification} 🥵👎`);
          }
          res.transactions.map((transaction, _) => {
            if (transaction.amount > user.bigTransactionAmount) {
              sendBigTransactionNotification(user, currentBalance, `Uh Oh! This purchase ${transaction.category[0]} of exceeded your limit ${user.bigTransactionAmount} 🥵👎`);
            }
          });
        };

        // User has a list of objects (Saving Limits)
        // Go through the new transactions returned from this function, literally loop through them
        // and if we find anyones that match the MO for any of the doc refs, create a temp buffer to
        // hold that counter value, that counter value should constantly be compared to the doc ref
        // value and if at any point, the value goes over, send this alert below and save the var name
        // and message for each I guess, case... to pass in  dynmaically.

        // During this nightly pull, also check if the balance has overdrafted. If so, send Notification.
      };
    });
  };
};

// tracks user location in foreground, sends location, then geo
// see them all on a map
// when they enter their office, they get checked in.
// if they're outside of it, 
// they login, enter whats a schedule

const transactions = async (request, response, next) => {
  let user = await User.findById(request.body.userId);
  // STEP 2

  cron.schedule('0 0 0 * * *', () => 
    balanceCron(request, response, user), {
      scheduled: true,
      timezone: "America/Sao_Paulo"
  }).start();

  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(user.access_token, startDate, endDate, {
    count: 250,
    offset: 0,
  }, (error, res) => {
    if (error != null) {
      return response.json({
        error: error
      });
    } else { // Success
      const currentBalance = res.accounts[0].balances.available;
      user.currentBalance = currentBalance;
      user.transactions = res.transactions;

      if (user.balances.length == 0) {
        const balance = new Balance({date: new Date(), value: currentBalance});
        balance.save();        
        user.balances.push(balance);
        user.save();
      };
      response.json({error: null, user});
    };
  });
};

const sendNotification = (user, balance, message) => {
  const pushTokens = [user.notificationToken]    
  // Create a new Expo SDK client
  let expo = new Expo();
  
  // Create the messages that you want to send to clients
  let messages = [];
  for (let pushToken of pushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
  
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
  
    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    messages.push({
      to: pushToken,
      sound: 'default',
      body: message,
      data: { withSome: 'data' },
    })
  }
  
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
  
  let receiptIds = [];
  for (let ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }
  
  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);
  
        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receipt of receipts) {
          if (receipt.status === 'ok') {
            continue;
          } else if (receipt.status === 'error') {
            console.error(`There was an error sending a notification: ${receipt.message}`);
            if (receipt.details && receipt.details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
              // You must handle the errors appropriately.
              console.error(`The error code is ${receipt.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

module.exports = {
  get_access_token,
  transactions,
  getBalanceGraphData
};

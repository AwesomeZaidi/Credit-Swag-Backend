// plaid.js

const moment = require('moment');
const plaid = require('plaid');
const cron = require('node-cron');
const PLAID_CLIENT_ID = '5d7da1d5f793f300137e8ff3'; // USE IN SANDBOX AND DEV
// const PLAID_SECRET = 'enternewhere - using techmade plaid account now, old account fucked.'; // USE IN SANDBOX
const PLAID_SECRET = '978024e80a84d06687224c6e186ab5'; // USE IN DEV
const PLAID_PUBLIC_KEY = 'f04faf8b95bc5d5e0357791a52b40c'; // USE IN SANDBOX AND DEV
// const PLAID_ENV = 'sandbox';
const PLAID_ENV = 'development';
const { Expo } = require('expo-server-sdk');
const Balance = require('../models/balance');
const User = require('../models/user');

let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;

const client = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments[PLAID_ENV],
  {version: '2019-05-29', clientApp: 'Credit Swag'}
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
      user.finishedPlaidSetup = true;
      user.save();
      return response.json({
        access_token: ACCESS_TOKEN,
        item_id: ITEM_ID,
        error: null,
      });

    ACCESS_TOKEN = tokenResponse.access_token;
    ITEM_ID = tokenResponse.item_id;
    user.access_token = ACCESS_TOKEN;
    user.item_id = ITEM_ID;
    user.save();
    return response.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
      error: null,
    });
  });
};

// Retrieve balance graph data easily.
const getBalanceGraphData = async (req, res) => {
  const data = await User.findById(req.body.userId).populate('balances');
  if(data) {
    return res.json(data.balances)
  } else {
    return res.status(500);
  }
};

const balanceCron = (req, res, user) => {
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
      } else {
        // We update the balances once a day for the client graph here.
        const date = new Date();
        const currentBalance = res.accounts[0].balances.available;
        const balance = new Balance({date: date, value: currentBalance})
        
        balance.save();
        user.balances.push(balance);
        user.save();
        
        if (user.overdraftNotification && user.notificationToken) {
          if (user.overdraftNotification && balance <= 0) {
            sendNotification(user, "Uh Oh! You over drafted 🥵👎 Add money to your account before the bank charges you in the morning!");
          }
          if (user.minimumBalanceNotification && balance < user.minimumBalanceAmount) {
            sendNotification(user, `Uh Oh! You hit your minimum balance of ${user.minimumBalanceNotification} 🥵👎`);
          }
          res.transactions.map((transaction, _) => {
            if (transaction.amount > user.bigTransactionAmount) {
              sendNotification(user, `Uh Oh! This purchase ${transaction.category[0]} of exceeded your limit ${user.bigTransactionAmount} 🥵👎`);
            }
          });
        };
      };
    });
  };
};

const transactions = async (request, response) => {
  let user = await User.findById(request.body.userId);

  cron.schedule('0 0 0 * * *', () => balanceCron(request, response, user), {
    scheduled: true,
    timezone: 'America/Sao_Paulo',
  }).start();

  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  client.getTransactions(user.access_token, startDate, endDate, {
    count: 250,
    offset: 0,
  }, (error, res) => {
    if (error != null) {
      return response.json({
        error,
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
        let data = user.populate('balances');
        return response.json({user, balances: data.balances});
      };

      user.save();
      return response.json({user});
    };
  });
};

const sendNotification = (user, message) => {
  const pushTokens = [user.notificationToken]    
  // Create a new Expo SDK client
  const expo = new Expo();

  // Create the messages that you want to send to clients
  const messages = [];
  for (const pushToken of pushTokens) {
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
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();

  const receiptIds = [];
  for (const ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (const chunk of receiptIdChunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (const receipt of receipts) {
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
  getBalanceGraphData,
};


// Should include this function later when we wanna optimize like how often this  api is called,
// right now though in the goal controller, i just call it anytime that route is hit.
// const getSavingGoalsAmounts = (req, res, user) => {
//   const transactions = res.transactions;
//   let updatedGoals = [];
//   savingGoals.map((goal) => {
//       goal.health = 0; // reset the value!
//       transactions.map((transaction) => {
//           let categories = transactions.category;
//           Array(categories).map((category) => {
//               if (category === goal.category) {
//                   goal.health += transaction.amount // found a category match, increment the goal amnt!
//               }
//           })
//       });
//       updatedGoals.push(goal);
//       user.savingGoals = updatedGoals;
//       user.save()   
//   });
// };

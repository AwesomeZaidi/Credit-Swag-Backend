# Credit Swag


## Run Project locally
1. Clone repository
2. `cd` into root repo
3. Look into the `sample.env` file and change the values to your own secrets!
4. Remove the `sample` on the filename so it is your own `.env` file. 
5. `npm i`
6. `nodemon server.js`
7. In another terminal tab, ngrok run `./ngrok http 5000` then take that https url and go to the client redux folded actions, index and replace the `baseUrl` 

## Plaid API Research

For the Plaid API it looks like I need to hit the 

`POST /plaid/auth/get`
Retrieve account and routing numbers for checking and savings accounts.


# Models

## User
    - name
    - email
    - number
    - password
    - public_key (use this to make all their api calls)
    - CurrentBalance
    - balances: array of strings -> every day of the week
    - standing -(oldBalance - CurrentBalance) / oldBalance
    - transactions (Array of Transaction document references)
    - upcomingBills (Array of Bill document references)

## Transaction
    - name
    - price
    - categories (array)
    - prevBalance
    - newBalance

## Bill
    - name
    - price
    - date
    - image
    - recurring (boolean)
    - recurringType ('weekly', 'monthly', 'annually')?

# Notifications
    - Mininum balance
    - Overdraft 
    - Bill Reminder
    - Big transaction

# Controller Logic

- ✅ Get the transactions data and structure that data into our database models.
- Allow the user to create a bill: Create Bill obj with name, amount, date and time and reccurance and when they wanna be notified or not about it.
- Check your if your balance if ever too low and you have a bill coming up, send a notification.

<!-- New -->    
- 
- When we pull the user transaction data, if the balance is lower than 0, can we send a trigger to the client and a notification?

Maybe after 1 month, we don't store the specific transactional data - but the overview numbers of your balance.


For the monthly, chunck it into chunks 5

Think of it week to week and once 

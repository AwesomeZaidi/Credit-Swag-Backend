# Credit Swag
## Run Project locally
1. Clone repository
2. `cd` into root repo
3. Look into the `sample.env` file and change the values to your own secrets!
4. Remove the `sample` on the filename so it is your own `.env` file. 
5. `npm i`
6. `nodemon server.js`

## Plaid API Research

For the Plaid API it looks like I need to hit the 

`POST /plaid/auth/get`
Retrieve account and routing numbers for checking and savings accounts.
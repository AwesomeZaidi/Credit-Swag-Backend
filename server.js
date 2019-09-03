
require('dotenv').config();
const path = require('path');
const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const logger = require('morgan');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
// database connection
require('./database/mongodb');

app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // <- maybe add this for testing
// override with POST having ?_method=DELETE & ?_method=PUT
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));
app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    let method = req.body._method;
    delete req.body._method;
    return method;
  };
}));

// const checkAuth = require('./middleware/authorization');
// app.use(checkAuth);
const auth = require('./routes/auth');
const plaidRoutes = require('./routes/plaid');
const notificationRoutes = require('./routes/notification');
const billRoutes = require('./routes/bill');
const goalRoutes = require('./routes/goal');

app.use(auth);
app.use(plaidRoutes);
app.use(notificationRoutes);
app.use(billRoutes);
app.use(goalRoutes);

app.get('/', (req, res) => {
  res.json('Welcome to the Credit Swag Backend API 🤑💻')
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`)
});

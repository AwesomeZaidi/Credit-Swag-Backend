// controllers/goal.js


const User = require('../models/user');
const Bill = require('../models/bill');

const addBill = async (req, res) => {
  const { name, amount, category, date } = req.body.billData;
  try {
    const user = await User.findById(req.body.userId);
    const bill = new Bill({
      name, amount, category, date,
    });
    user.bills.push(bill);
    bill.save();
    user.save();
    return res.json(bill);
  } catch (e) {
    return res.json('Something went wrong, please try again or reinstall the app. Sorry.');
  }
};

module.exports = {
  addBill,
};

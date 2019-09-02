// controllers/goal.js


const User = require('../models/user');
const Bill = require('../models/bill');

const addBill = async (req, res) => {
    const name = req.body.billData.name;
    const amount = req.body.billData.amount;
    const category = req.body.billData.category;    
    const date = req.body.billData.date;    
    try {
        let user = await User.findById(req.body.userId);       
        const bill = new Bill({name, amount, category, date});     
        user.bills.push(bill);
        bill.save();
        user.save();
        return res.json(bill);
    } catch(e) {
        return res.json('Something went wrong, please try again or reinstall the app. Sorry.');
    }
};

module.exports = {
    addBill
};

// Client Call Notes:

// Dog Training Company in Houston that wants a mobile app. No money, no funny.
// Business gives client account so they can recieve daily updates and send videos and photos.
// Your dog did this, did that, today, etc.

// Report card style thing, timeline shown through, buy products through the app, can have a link for everything.
// Custom dog profile.

// Law Partner Office that handles car accident cases, they have enough money easy way for them to manage their clients.

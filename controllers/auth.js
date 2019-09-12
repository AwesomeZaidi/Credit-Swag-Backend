
const _ = require('lodash');
const User = require('../models/user');

const signup = async (req, res) => {  
  const data = req.body;
  try {
    const email = data.email;
    let user = await User.findOne({email}, "email notificationToken");
    if (user) {
      res.status(401).send('Account with this email already exists');
    };
    
    const newUser = new User(data); 
    await newUser.save();
    // const token = jwt.sign({ _id: newUser._id }, process.env.SECRET, { expiresIn: "60 days" });   
    // res.cookie('csToken', token, { maxAge: 900000, httpOnly: false });
    return res.status(200).json(newUser);
  } catch(err) {
    res.status(401).send(err);
  }
}

const login = async (req, res) => {
  const data = req.body;

  try {
    const { email, password } = data;
    let user = await User.findOne({email}, "email password public_key access_token currentBalance minimumBalanceNotification minimumBalanceAmount overdraftNotification bigTransactionNotification bigTransactionAmount transactions balances bills savingGoals name notificationToken");    
    if (!user) {
      return res.status(401).send('Wrong Email');
    };

    user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          return res.status(401).send('Wrong Email or Password');
        } else {
          // const token = jwt.sign({_id: user._id, email: user.email}, process.env.SECRET, { expiresIn: "60 days" });
          // res.cookie("csToken", token, {maxAge: 900000, httpOnly: false});
          return res.json({user});  
        }
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

module.exports = {
  signup,
  login
}
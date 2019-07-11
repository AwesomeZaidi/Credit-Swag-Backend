
const _ = require('lodash');
const {
  User
} = require('../models/user');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const data = JSON.parse(Object.keys(req.body)[0]);
  try {
    const email = data.email;
    let user = await User.findOne({email}, "email");
    if (user) {
      res.status(401).send('Account with this email already exists');
    };
    
    const newUser = new User(data); 
    await newUser.save();
    console.log('newUser:', newUser);
    
    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET, { expiresIn: "60 days" });   
    res.cookie('csToken', token, { maxAge: 900000, httpOnly: false });

    return res.status(200).json(newUser);
  } catch(err) {
    console.log('err:', err);
    
    res.status(401).send(err);
  }
}

const login = async (req, res) => {
  console.log('req.body:', req.body);
  try {
    const { email, password } = req.body;
    let user = await User.findOne({email}, "email password");

    if (!user) {
      res.status(401).send('Wrong Email');
    };

    user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          res.status(401).send('Wrong Email or Password');
        } else {
          const token = jwt.sign({_id: user._id, username: user.username}, process.env.SECRET, { expiresIn: "60 days" });
          res.cookie("csToken", token, {maxAge: 900000, httpOnly: false});
          return res.status(200).send(user);  
        }
    });
  } catch (err) {
    res.status(401).send(err);
  }
};

//LOGOUT
const logout = (req, res) => {
  res.clearCookie('csToken');
  return res.status(200).send('User logged out.');
};

module.exports = {
  signup,
  login,
  logout
}

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const signup = async (req, res) => {
  const data = req.body;
  try {
    const { email } = data;
    const user = await User.findOne({ email }, 'email notificationToken');
    if (user) {
      res.status(401).send('Account with this email already exists');
    }

    const newUser = new User(data);
    await newUser.save();
    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET, { expiresIn: '60 days' });
    res.cookie('csToken', token, { maxAge: 900000, httpOnly: false });
    return res.status(200).json(newUser);
  } catch (err) {
    return res.status(401).send(err);
  }
};

const login = async (req, res) => {
  const data = req.body;

  try {
    const { email, password } = data;
    const user = await User.findOne({ email }, 'email password public_key');
    if (!user) {
      return res.status(401).send('Wrong Email');
    }

    user.comparePassword(password, (err, isMatch) => {
      if (!isMatch) {
        res.status(401).send('Wrong Email or Password');
      } else {
        const token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '60 days' });
        res.cookie('csToken', token, { maxAge: 900000, httpOnly: false });
        return res.status(200).send(user);
      }
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

module.exports = {
  signup,
  login,
};

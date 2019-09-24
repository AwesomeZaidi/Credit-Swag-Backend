const mongoose = require('mongoose');

const { Schema } = mongoose;
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} not a valid email',
    },
  },
  // Plaid
  public_token: String,
  access_token: String,
  notificationToken: String,
  overdraftNotification: { type: Boolean, default: false },
  minimumBalanceNotification: { type: Boolean, default: false },
  minimumBalanceAmount: { type: Number, default: 50 },
  bigTransactionNotification: { type: Boolean, default: false },
  bigTransactionAmount: { type: Number, default: 50 },
  item_id: String,
  password: {
    type: String,
    required: true,
  },
  currentBalance: String,
  transactions: [],
  balances: [{ type: Schema.Types.ObjectId, ref: 'Balance' }],
  bills: [{ type: Schema.Types.ObjectId, ref: 'Bill' }],
  savingGoals: [],
  finishedPlaidSetup: {type: Boolean, default: false}
}, {
  timestamps: true,
});

UserSchema.pre('save', function hashPassword(next) {
  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  return bcrypt.genSalt(10, (_, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
}; //ends comparePassword

module.exports = mongoose.model('User', UserSchema);

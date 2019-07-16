const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcryptjs')

let UserSchema = new Schema({
  // firstName: { type: String, required: true }, add this later.
  // lastName: { type: String, required: true }, once the client has been connected successfully.
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} not a valid email`
    }
  },
  public_token: String,
  access_token: String,
  item_id: String,
  // phoneNumber: { type: String, required: true },
  password: {
    type: String,
    required: true,
    // minlength: 6
  }
}, {
  timestamps: true
});

UserSchema.pre("save", function(next) {

  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    }); //ends bcrypt.hash()

  }); //ends bcrypt.genSalt()

}); //end UserSchema.pre()
  
UserSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

let User = mongoose.model('User', UserSchema);

module.exports = {
  User
}
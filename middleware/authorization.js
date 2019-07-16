const User = require('../models/user');
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    if (req.cookies && req.cookies.nToken) {
        const uid = jwt.decode(req.cookies.csToken, process.env.SECRET, { complete: true })._id || {};
        User.findById(uid).then(user => {
            req.user = user;
            res.locals.authenticatedUser = user;
            next();
            return true;
        });
    } else {
      req.user = null;
      next();  
      return false;
    }
};
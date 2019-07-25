// const User = require('../models/user');
// const jwt = require('jsonwebtoken');

// module.exports = function (req, res, next) {
//     console.log('in middleware');
    
//     if (req.cookies && req.cookies.nToken) {
//         const uid = jwt.decode(req.cookies.nToken, process.env.SECRET)._id;
//         User.findById(uid).then(user => {
//             request.user = user;
//             return next();
//         });
//     } else {
//         return res.status(401).send("User not logged in");
//     };
// };
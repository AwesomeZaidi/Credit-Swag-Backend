const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BalanceSchema = new Schema({
    date: Date,
    value: String,
},
{
    timestamps: true
});

module.exports = mongoose.model('Balance', BalanceSchema);

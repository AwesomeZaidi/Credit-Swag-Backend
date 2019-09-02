const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BillSchema = new Schema({
    name: String,
    amount: String,
    category: String,
    date: String,
},
{
    timestamps: true
});

module.exports = mongoose.model('Bill', BillSchema);

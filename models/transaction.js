const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TransactionSchema = new Schema({
    name: String,
    price: String,
    categories: [],
    prevBalance: String,
    newBalance: String,
    timestamps: true
});

let Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = {
    Transaction
}

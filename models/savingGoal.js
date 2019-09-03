const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SavingGoalSchema = new Schema({
    name: String,
    limit: Number,
    health: Number,
    date: String,
    category: String,
},
{
    timestamps: true
});

module.exports = mongoose.model('SavingGoal', SavingGoalSchema);

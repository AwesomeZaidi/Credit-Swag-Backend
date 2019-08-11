const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SavingGoalSchema = new Schema({
    limit: String,
    health: String
},
{
    timestamps: true
});

module.exports = mongoose.model('SavingGoal', SavingGoalSchema);

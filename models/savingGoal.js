const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SavingGoalSchema = new Schema({
    name: String,
    limit: Number,
    health: { type: Number, default: 50 },
    date: String,
    category: String,
    spendings: {type: Array, default: []}
    // Later, pre save we could have api call to actually fetch the spendings info right away.
},
{
    timestamps: true
});

module.exports = mongoose.model('SavingGoal', SavingGoalSchema);

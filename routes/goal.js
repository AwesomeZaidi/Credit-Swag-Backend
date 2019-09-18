const router = require('express').Router();

const {
    addGoal,
    fetchGoal,
    getSavingGoals,
    getTransactions
} = require('../controllers/goal');

router.post('/addGoal', addGoal);
router.post('/fetchGoal', getTransactions, fetchGoal);
router.post('/getSavingGoals', getSavingGoals);


module.exports = router;

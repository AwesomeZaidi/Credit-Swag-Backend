const router = require('express').Router();

const {
    addGoal,
    getSavingGoals
} = require('../controllers/goal');

router.post('/addGoal', addGoal);
router.post('/getSavingGoals', getSavingGoals);


module.exports = router;

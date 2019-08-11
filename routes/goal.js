const router = require('express').Router();

const {
    createSavingGoal,
} = require('../controllers/goal');

router.post('/createSavingGoal', createSavingGoal);

module.exports = router;

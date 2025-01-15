const express = require ('express');
const router =express.Router();

const dashboardController= require('./controllers/DashboardController');
const {ensureAuthenticated, ensureLogin } = require('@AuthMiddleware');

router.get('/', dashboardController.viewDashboard); 



// ensureAuthenticated,


module.exports = router;
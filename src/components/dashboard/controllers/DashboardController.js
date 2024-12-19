const { mutipleMongooseToObject } = require('@utils/mongoose');
const { mongooseToObject } = require('@utils/mongoose');
const session = require('express-session');



class DashboardController{
    async viewDashboard(req, res, next) {
        res.render('dashboard');
    }
    
}

module.exports = new DashboardController();
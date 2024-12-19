const express = require ('express');
const router =express.Router();
const orderController=require('./controllers/ReportController');
const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');
const reportController = require('./controllers/ReportController');
// Báo cáo doanh thu
router.get('/revenue-report', reportController.viewRevenueReport);

// Báo cáo sản phẩm top doanh thu
router.get('/top-revenue-products', reportController.viewTopRevenueProducts);

module.exports = router;
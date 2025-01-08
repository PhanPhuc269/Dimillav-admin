const express = require ('express');
const router =express.Router();
const orderController=require('./controllers/ReportController');
const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');
const reportController = require('./controllers/ReportController');


router.get('/revenueYear', reportController.viewAnnualRevenueReport);

router.get('/saleYear', reportController.viewAnnualSalesReport);


// Báo cáo sản phẩm top doanh thu
router.get('/topProducts', reportController.viewTopProductsReport);



module.exports = router;
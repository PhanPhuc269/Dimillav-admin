const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');
const Report = require("@components/report/models/Report");
const Product = require("@components/product/models/Product");
const Order = require("@components/order/models/Order");

class ReportController{
   // Báo cáo doanh thu theo khoảng thời gian
   async viewRevenueReport(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        const report = await ReportService.getRevenueReport(startDate, endDate);

        res.render('admin/revenueReport', {
            report,
            startDate,
            endDate,
        });
    } catch (error) {
        console.error('Error generating revenue report:', error);
        next(error);
    }
}

// Báo cáo sản phẩm có doanh thu cao nhất
async viewTopRevenueProducts(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        const topProducts = await ReportService.getTopRevenueProducts(startDate, endDate);

        res.render('admin/topRevenueProducts', {
            topProducts,
            startDate,
            endDate,
        });
    } catch (error) {
        console.error('Error generating top revenue products report:', error);
        next(error);
    }
}
   
}

module.exports = new ReportController();
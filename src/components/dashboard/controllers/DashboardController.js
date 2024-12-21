const { mutipleMongooseToObject } = require('@utils/mongoose');
const { mongooseToObject } = require('@utils/mongoose');
const session = require('express-session');
const Order = require("@components/order/models/Order");
const OrderService = require("@components/order/services/OrderService");
const ReportService = require("@components/report/services/ReportService");


class DashboardController{
    async viewDashboard(req, res, next) {
        try {
            // Lấy tất cả các đơn hàng và sắp xếp theo ngày tạo (mới nhất trước)
            const orders = await OrderService.getAllOrdersSortedByDate();
            const report=await ReportService.getRevenueReportAllTime();
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const reportToday = await ReportService.getRevenueReport(startOfDay, endOfDay);
            const reportProductToday = await ReportService.getTotalProductsReport(startOfDay, endOfDay);
            const reportProduct = await ReportService.getTotalProductsReportAllTime();

            // console.log('sp: ',reportProductToday);
            // console.log('order: ',orders)
            // Render danh sách đơn hàng
            res.render('dashboard', {
                orders: mutipleMongooseToObject(orders),
                report:  report,
                reportToday:  reportToday,
                reportProductToday:  reportProductToday,
                reportProduct:  reportProduct,

            });
        } catch (error) {
            console.error('Error fetching order list:', error);
            next(error);
        }
      
    }
   
}

module.exports = new DashboardController();
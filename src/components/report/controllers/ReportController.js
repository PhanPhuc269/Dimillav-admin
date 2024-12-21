const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');
const ReportService = require("@components/report/services/ReportService");

class ReportController {
    // Báo cáo doanh thu theo khoảng thời gian
    async viewRevenueReport(req, res, next) {
        try {
            const { startDate, endDate } = req.query;

            // Gọi dịch vụ để lấy dữ liệu báo cáo
            const report = await ReportService.getRevenueReport(startDate, endDate);

            res.render('revenueReport', {
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

            // Gọi dịch vụ để lấy danh sách sản phẩm
            const topProducts = await ReportService.getTopRevenueProducts(startDate, endDate);
            console.log('top: ',topProducts);
            res.render('topRevenueProducts', {
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

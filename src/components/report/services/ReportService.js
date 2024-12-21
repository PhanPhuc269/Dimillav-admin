const Order = require('@components/order/models/Order');

class ReportService {

    async getRevenueReport(startDate, endDate) {
        const matchStage = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
            status: 'completed', // Thêm điều kiện chỉ lấy đơn hàng đã hoàn thành
        };
    
        const revenueReport = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                },
            },
        ]);
    
        return revenueReport[0] || { totalRevenue: 0, totalOrders: 0 };
    }
    
    async getRevenueReportAllTime() {
        const matchStage = {
            status: 'completed', // Chỉ lấy đơn hàng đã hoàn thành
        };
    
        const revenueReport = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                },
            },
        ]);
    
        return revenueReport[0] || { totalRevenue: 0, totalOrders: 0 };
    }
    
    async getTotalProductsReport(startDate, endDate) {
        const matchStage = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
            status: 'completed', // Chỉ lấy đơn hàng đã hoàn thành
        };

        const productsReport = await Order.aggregate([
            { $match: matchStage },
            { $unwind: "$items" }, // Phân tách mảng items
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: "$items.quantity" }, // Tổng số lượng sản phẩm
                },
            },
        ]);

        return productsReport[0]?.totalProducts || 0;
    }

    async getTotalProductsReportAllTime() {
        const matchStage = {
            status: 'completed', // Chỉ lấy đơn hàng đã hoàn thành
        };

        const productsReport = await Order.aggregate([
            { $match: matchStage },
            { $unwind: "$items" }, // Phân tách mảng items
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: "$items.quantity" }, // Tổng số lượng sản phẩm
                },
            },
        ]);

        return productsReport[0]?.totalProducts || 0;
    }

   // Sản phẩm có doanh thu cao nhất trong khoảng thời gian
async getTopRevenueProducts(startDate, endDate, limit = 10) {
    const matchStage = {
        createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        },
        status: "completed", // Thêm điều kiện chỉ lấy đơn hàng đã hoàn thành
    };

    const topProducts = await Order.aggregate([
        { $match: matchStage },
        { $unwind: '$items' }, // Mở rộng danh sách sản phẩm trong đơn hàng
        {
            $group: {
                _id: '$items.productId',
                totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                totalQuantity: { $sum: '$items.quantity' },
            },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit },
    ]);

    return topProducts;
}

}

module.exports = new ReportService();

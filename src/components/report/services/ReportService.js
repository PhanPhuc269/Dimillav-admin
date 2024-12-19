const Product = require('../models/Product');
const nodemailer = require('nodemailer');
const mjml = require('mjml');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Order = require('../models/Order');

class ReportService {
    // Báo cáo doanh thu theo khoảng thời gian
    async getRevenueReport(startDate, endDate) {
        const matchStage = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
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

    // Sản phẩm có doanh thu cao nhất trong khoảng thời gian
    async getTopRevenueProducts(startDate, endDate, limit = 10) {
        const matchStage = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
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


















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

class OrderService {
    // Lấy danh sách đơn hàng, sắp xếp theo thời gian tạo (mới nhất trước)
    async getOrdersSortedByCreationTime(customerId) {
        return Order.find({ customerId }).sort({ createdAt: -1 });
    }

    // Lọc đơn hàng theo trạng thái
    async filterOrdersByStatus(customerId, status) {
        return Order.find({ customerId, status });
    }

    // Lấy chi tiết đơn hàng theo ID
    async getOrderDetails(orderId) {
        return Order.findById(orderId).populate('items.productId');
    }

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        return Order.findByIdAndUpdate(orderId, { status }, { new: true });
    }
}

module.exports = new OrderService();



















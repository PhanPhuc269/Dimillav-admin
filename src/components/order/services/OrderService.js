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

 /**
     * Lấy danh sách đơn hàng của khách hàng
     * @param {string} customerId - ID của khách hàng
     * @returns {Promise<Array>} - Danh sách đơn hàng
     */
 async getOrdersByCustomerId(customerId) {
    try {
        return await Order.find({ customerId });
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
    }
}

/**
 * Lấy chi tiết đơn hàng
 * @param {string} orderId - ID của đơn hàng
 * @returns {Promise<Object>} - Chi tiết đơn hàng
 */
async getOrderDetails(orderId) {
    try {
        return await Order.findById(orderId).populate('items.productId');
    } catch (error) {
        throw new Error(`Lỗi khi lấy chi tiết đơn hàng: ${error.message}`);
    }
}

/**
 * Tạo đơn hàng mới
 * @param {string} userId - ID của người dùng
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @returns {Promise<Object>} - Đơn hàng mới được tạo
 */
async createOrder(userId, orderData) {
    try {
        // Lấy giỏ hàng của người dùng
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new Error('Giỏ hàng trống. Không thể tạo đơn hàng.');
        }

        // Tính tổng tiền từ giỏ hàng
        let totalAmount = 0;
        const items = cart.items.map(item => {
            const price = item.productId.price;
            const quantity = item.quantity;
            totalAmount += price * quantity;
            return {
                productId: item.productId._id,
                quantity,
                price
            };
        });

        // Cộng thêm phí vận chuyển
        const shippingFee = 50;
        totalAmount += shippingFee;

        // Tạo đối tượng đơn hàng mới
        const newOrder = new Order({
            customerId: userId,
            ...orderData,
            items,
            totalAmount,
            shippingFee
        });

        // Lưu đơn hàng vào cơ sở dữ liệu
        await newOrder.save();

        return newOrder;
    } catch (error) {
        throw new Error(`Lỗi khi tạo đơn hàng: ${error.message}`);
    }
}

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



















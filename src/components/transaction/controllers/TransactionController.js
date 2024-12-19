const Cart = require("@components/cart/models/Cart");
const Product = require("@components/product/models/Product");
const Order = require("@components/order/models/Order");
const Transaction = require("@components/transaction/models/Transaction");
const dotenv = require('dotenv');
const {  checkPaid } = require('../../../utils/payment');
const { mongooseToObject } = require('../../../utils/mongoose');


dotenv.config(); // Load environment variables

require('dotenv').config(); // Load environment variables from .env

const TransactionService = require('../services/TransactionService');
const { checkPaid } = require('../../../utils/payment');


class TransactionController {
    // Lấy danh sách giao dịch của người dùng
    async getTransactionsByUser(req, res, next) {
        try {
            const userId = req.user._id;
            const transactions = await TransactionService.getTransactionsByUser(userId);

            if (!transactions.length) {
                return res.status(404).json({ message: 'No transactions found' });
            }

            res.status(200).json({
                message: 'Transactions retrieved successfully',
                transactions,
            });
        } catch (error) {
            console.error('Error retrieving transactions:', error);
            res.status(500).json({ message: 'Error retrieving transactions', error });
        }
    }

    // Hiển thị giao dịch QR Code
    async getQrTransaction(req, res, next) {
        try {
            const { transactionId } = req.params;
            const transactionDetails = await TransactionService.getQrTransaction(transactionId);

            if (!transactionDetails) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            res.render('transaction', transactionDetails);
        } catch (error) {
            console.error('Error retrieving QR transaction:', error);
            res.status(500).json({ message: 'Error retrieving QR transaction', error });
        }
    }

    // Tạo giao dịch mới
    async createTransaction(req, res, next) {
        try {
            const { orderId } = req.body;
            const customerId = req.user._id;

            const newTransaction = await TransactionService.createTransaction(orderId, customerId);

            res.redirect(`/transaction/processPayment/${newTransaction._id}`);
        } catch (error) {
            console.error('Error creating transaction:', error);
            res.status(500).json({ message: 'Error creating transaction', error });
        }
    }

    // Xử lý thanh toán
    async processPayment(req, res, next) {
        try {
            const { transactionId } = req.body;
            const userId = req.user._id;

            const result = await TransactionService.processPayment(transactionId, userId);

            if (result.success) {
                return res.json(result);
            }

            return res.status(400).json(result);
        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).json({ message: 'Error processing payment', error });
        }
    }

    // Lấy tất cả giao dịch (admin)
    async getAllTransactions(req, res, next) {
        try {
            const transactions = await TransactionService.getAllTransactions();

            res.status(200).json({
                message: 'All transactions retrieved successfully',
                transactions,
            });
        } catch (error) {
            console.error('Error retrieving all transactions:', error);
            res.status(500).json({ message: 'Error retrieving all transactions', error });
        }
    }
}

module.exports = new TransactionController();


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

const Transaction = require('@components/transaction/models/Transaction');
const Order = require('@components/order/models/Order');
const nodemailer = require('nodemailer');
const mjml = require('mjml');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class TransactionService {
    async getTransactionsByUser(userId) {
        return Transaction.find({ userId }).sort({ createdAt: -1 });
    }

    async getQrTransaction(transactionId) {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return null;

        const bankInfo = {
            id: process.env.BANK_ID,
            accountNo: process.env.ACCOUNT_NO,
            accountName: process.env.ACCOUNT_NAME,
            template: process.env.TEMPLATE,
        };

        const qrCode = `https://img.vietqr.io/image/${bankInfo.id}-${bankInfo.accountNo}-${bankInfo.template}.png?amount=${transaction.amount}&addInfo=${encodeURIComponent(transaction.description)}&accountName=${bankInfo.accountName}`;

        return {
            qrCode,
            amount: transaction.amount,
            description: transaction.description,
            transactionId: transaction._id,
        };
    }

    async createTransaction(orderId, customerId) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Order not found');

        const newTransaction = new Transaction({
            customerId,
            amount: order.totalAmount,
            paymentMethod: 'bank',
            orderId,
            description: `OrderID-${orderId}`,
            status: 'pending',
        });

        await newTransaction.save();

        return newTransaction;
    }

    async processPayment(transactionId, userId) {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) throw new Error('Transaction not found');

        if (transaction.status !== 'pending') {
            return { success: false, message: 'Transaction is not pending' };
        }

        const timeout = 5 * 60 * 1000;
        const checkInterval = 10 * 1000;
        let elapsed = 0;

        while (elapsed < timeout) {
            const isPaid = await checkPaid(transaction.amount, transaction.description);

            if (isPaid.success) {
                transaction.status = 'completed';
                await transaction.save();

                const order = await Order.findById(transaction.orderId);
                if (order) {
                    order.status = 'completed';
                    await order.save();
                }

                return { success: true, message: 'Transaction completed successfully', transaction };
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        transaction.status = 'failed';
        await transaction.save();

        return { success: false, message: 'Payment failed: Timeout exceeded' };
    }

    async getAllTransactions() {
        return Transaction.find().sort({ createdAt: -1 });
    }
}

module.exports = new TransactionService();


module.exports = new TransactionService();


















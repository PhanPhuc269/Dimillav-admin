const mongoose = require('mongoose');

// Định nghĩa schema cho đơn hàng
const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    //companyName: { type: String, required: false },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    //country: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    city: { type: String, required: true },
    district: { type: String, required: true },
    zip: { type: String, required: true },
    //createAccount: { type: Boolean, default: false },
   // shipToDifferentAddress: { type: Boolean, default: false },
    orderNotes: { type: String, required: false },
    //couponCode: { type: String, required: false },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    shippingFee: { type: Number, default: 50 },
    status: { type: String, default: 'pending' }, // Status của đơn hàng
    createdAt: { type: Date, default: Date.now }
});

// Tạo mô hình Order từ schema
const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;

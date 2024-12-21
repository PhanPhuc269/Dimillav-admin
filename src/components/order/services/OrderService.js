
const UserService = require('@components/auth/services/UserService');

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
async filterOrdersByStatus(status) {
    // Nếu trạng thái không được cung cấp, lấy tất cả đơn hàng
    if (!status) {
        return Order.find({});
    }

    // Nếu có trạng thái, chỉ lấy đơn hàng với trạng thái đó
    return Order.find({ status });
}


    // Lấy chi tiết đơn hàng theo ID
    async getOrderDetails(orderId) {
        return Order.findById(orderId).populate('items.productId');
    }

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        return Order.findByIdAndUpdate(orderId, { status }, { new: true });
    }
    async getAllOrdersSortedByCreationTime() {
        return await Order.find().sort({ createdAt: -1 }).lean();
    }

    // Lấy danh sách đơn hàng theo khách hàng (bao gồm thông tin chi tiết khách hàng)
    async getOrdersGroupedByCustomerWithDetails() {
        const orders = await this.getAllOrdersSortedByCreationTime(); // Lấy tất cả đơn hàng
        const groupedOrders = {};

        for (const order of orders) {
            const userId = order.customerId;

            // Nếu chưa có userId trong nhóm, gọi UserService để lấy thông tin khách hàng
            if (!groupedOrders[userId]) {
                const userDetails = await UserService.findUserByUserId(userId); // Lấy thông tin chi tiết khách hàng
                groupedOrders[userId] = {
                    user: userDetails, // Gán thông tin chi tiết khách hàng
                    orders: [],
                };
            }

            groupedOrders[userId].orders.push(order);
        }

        return groupedOrders;
    }

     async getAllOrdersSortedByDate() {
        try {
            const orders = await Order.find().sort({ createdAt: -1 }); // -1: giảm dần
            return orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }
}

module.exports = new OrderService();



















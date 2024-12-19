const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');
const Cart = require("@components/cart/models/Cart");
const Product = require("@components/product/models/Product");
const Order = require("@components/order/models/Order");

class OrderController{
    ViewProductCheckout(req, res, next) {
        res.render('checkout');
    }

    async ViewOrderList(req, res, next) {
        try {
            const customerId = req.user._id;
            console.log('user: ', customerId);
            const orders = await OrderService.getOrdersByCustomerId(customerId);
            res.render('orderList', {
                orders: mutipleMongooseToObject(orders),
            });
        } catch (error) {
            next(error);
        }
    }

    async ViewOrderDetail(req, res, next) {
        try {
            const orderId = req.params._id;
            const order = await OrderService.getOrderDetails(orderId);

            if (!order) {
                return res.status(404).send('Không tìm thấy đơn hàng.');
            }

            res.render('orderDetail', {
                order: mongooseToObject(order),
            });
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).send('Lỗi server.');
        }
    }

    async addOrder(req, res, next) {
        try {
            const userId = req.user._id;
            const {
                firstName, lastName, phoneNumber, email,
                addressLine1, addressLine2, city, district, zip, orderNotes
            } = req.body;

            const orderData = {
                firstName,
                lastName,
                phoneNumber,
                email,
                addressLine1,
                addressLine2,
                city,
                district,
                zip,
                orderNotes
            };

            const newOrder = await OrderService.createOrder(userId, orderData);

            res.redirect(`/order/list`);
        } catch (error) {
            console.error(error);
            res.status(500).render('errorOrder', {
                message: 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.',
                errorCode: 500,
                errorDetails: error.message
            });
        }
    }

     // Hiển thị danh sách đơn hàng, sắp xếp theo thời gian tạo
     async viewOrdersSorted(req, res, next) {
        try {
            const customerId = req.user._id;
            const orders = await OrderService.getOrdersSortedByCreationTime(customerId);
            res.render('orderList', { orders: mutipleMongooseToObject(orders) });
        } catch (error) {
            console.error('Error fetching sorted orders:', error);
            res.status(500).render('errorOrder', {
                message: 'Lỗi khi tải danh sách đơn hàng.',
                errorDetails: error.message,
            });
        }
    }

    // Lọc danh sách đơn hàng theo trạng thái
    async filterOrders(req, res, next) {
        try {
            const customerId = req.user._id;
            const { status } = req.query;

            const orders = await OrderService.filterOrdersByStatus(customerId, status);
            res.render('orderList', { orders: mutipleMongooseToObject(orders) });
        } catch (error) {
            console.error('Error filtering orders:', error);
            res.status(500).render('errorOrder', {
                message: 'Lỗi khi lọc danh sách đơn hàng.',
                errorDetails: error.message,
            });
        }
    }

    // Hiển thị chi tiết đơn hàng
    async viewOrderDetails(req, res, next) {
        try {
            const orderId = req.params.id;

            const order = await OrderService.getOrderDetails(orderId);
            if (!order) {
                return res.status(404).render('errorOrder', { message: 'Không tìm thấy đơn hàng.' });
            }

            res.render('orderDetail', { order: mongooseToObject(order) });
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).render('errorOrder', {
                message: 'Lỗi khi lấy chi tiết đơn hàng.',
                errorDetails: error.message,
            });
        }
    }

    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(req, res, next) {
        try {
            const orderId = req.params.id;
            const { status } = req.body;

            const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
            if (!updatedOrder) {
                return res.status(404).render('errorOrder', { message: 'Không tìm thấy đơn hàng.' });
            }

            res.redirect(`/order/${orderId}/detail`); // Điều hướng tới trang chi tiết đơn hàng
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).render('errorOrder', {
                message: 'Lỗi khi cập nhật trạng thái đơn hàng.',
                errorDetails: error.message,
            });
        }
    }
   
}

module.exports = new OrderController();
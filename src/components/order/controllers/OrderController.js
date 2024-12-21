const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');

const Product = require("@components/product/models/Product");
const Order = require("@components/order/models/Order");
const OrderService = require("../services/OrderService");


class OrderController{
    ViewProductCheckout(req, res, next) {
        res.render('checkout');
    }

    async ViewOrderList(req, res, next) {
        try {
            // Lấy tất cả các đơn hàng và sắp xếp theo ngày tạo (mới nhất trước)
            const orders = await OrderService.getAllOrdersSortedByDate();
    
            // Render danh sách đơn hàng
            res.render('orderList', {
                orders: mutipleMongooseToObject(orders),
            });
        } catch (error) {
            console.error('Error fetching order list:', error);
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

   // Hiển thị danh sách đơn hàng, phân loại theo customerId
   async viewOrdersGroupedByCustomer(req, res) {
    try {
        // Gọi hàm từ OrderService để lấy danh sách đơn hàng và thông tin khách hàng
        const groupedOrders = await OrderService.getOrdersGroupedByCustomerWithDetails();
        console.log(groupedOrders);
        res.render('orderList', { groupedOrders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi tải danh sách đơn hàng');
    }
}


   // Lọc danh sách đơn hàng theo trạng thái
   async filterOrders(req, res, next) {
    try {
        // Lấy trạng thái từ query params
        const { status } = req.query;
console.log('status: ',status);
        // Lọc đơn hàng dựa trên trạng thái
        const orders = await OrderService.filterOrdersByStatus(status);
        console.log('đơn: ',orders);
        // Trả về danh sách đơn hàng dưới dạng JSON
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error filtering orders:', error);

        // Trả về thông báo lỗi dưới dạng JSON
        res.status(500).json({
            success: false,
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

            res.redirect(`/order/detail/${orderId}`); // Điều hướng tới trang chi tiết đơn hàng
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
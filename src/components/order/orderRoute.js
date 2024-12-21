const express = require ('express');
const router =express.Router();
const orderController=require('./controllers/OrderController');
const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');

router.get('/',orderController.ViewProductCheckout);
router.get('/checkout', ensureAuthenticated,orderController.ViewProductCheckout);
router.post('/checkout', ensureAuthenticated,orderController.addOrder);

//router.get('/detail/:_id',ensureAuthenticated,orderController.ViewOrderDetail);



// Hiển thị danh sách đơn hàng theo thời gian tạo
router.get('/list', orderController.ViewOrderList);

// Lọc đơn hàng theo trạng thái
router.get('/filter', orderController.filterOrders);

// Hiển thị chi tiết đơn hàng
router.get('/detail/:id', orderController.viewOrderDetails);

// Cập nhật trạng thái đơn hàng
router.post('/updateStatus/:id', orderController.updateOrderStatus);

module.exports = router;
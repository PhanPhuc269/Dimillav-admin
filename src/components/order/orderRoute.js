const express = require ('express');
const router =express.Router();
const orderController=require('./controllers/OrderController');
const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');



router.get('/',orderController.ViewOrderList);
router.get('/detail/:_id',orderController.ViewOrderDetail);
// ensureAuthenticated,
// ensureAuthenticated,

module.exports = router;
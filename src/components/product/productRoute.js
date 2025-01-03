const express = require ('express');
const router =express.Router();
const productController= require('./controllers/ProductController');
const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');

 
router.get('/list',productController.ViewProductListings);
//router.get('/product-details/:slug',productController.ViewProductDetails);
//router.get('/confirmation', ensureAuthenticated,productController.ViewOrderConfirmation);
router.get('/filter', productController.getFilteredProducts);
router.get('/search', productController.SearchProduct);
// Route để hiển thị form cập nhật sản phẩm
router.get('/update/:slug', productController.editProductForm);
router.post('/update/:slug', productController.updateProduct);
router.patch('/:slug/image', productController.addImage);
router.delete('/:slug/image', productController.removeImage);
router.patch('/:slug/category-brand', productController.changeCategoryOrBrand);
router.patch('/:slug/availability', productController.updateAvailability);

module.exports = router;
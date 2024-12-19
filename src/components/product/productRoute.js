const express = require ('express');
const router =express.Router();
const productController= require('./controllers/ProductController');
const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');

 
router.get('/list',productController.ViewProductListings);
//router.get('/product-details/:slug',productController.ViewProductDetails);
//router.get('/confirmation', ensureAuthenticated,productController.ViewOrderConfirmation);
router.get('/filter', productController.getFilteredProducts);
router.get('/search', productController.SearchProduct);

router.put('/product/:slug', productController.updateProduct);
router.patch('/product/:slug/image', productController.addImage);
router.delete('/product/:slug/image', productController.removeImage);
router.patch('/product/:slug/category-brand', productController.changeCategoryOrBrand);
router.patch('/product/:slug/availability', productController.updateAvailability);

module.exports = router;
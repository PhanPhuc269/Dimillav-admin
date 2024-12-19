const { MAX } = require('uuid');
const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');
const ReviewController = require('../../review/controllers/ReviewController');
const Product = require("../models/Product");
const ProductService = require('../services/ProductService');

class ProductController {
    // Hiển thị danh sách sản phẩm
    async ViewProductListings(req, res, next) {
        try {
            const keyword = req.query.keyword ? req.query.keyword.trim() : '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;
            const sort = req.query.sort || 'default';

            // Kiểm tra giá trị hợp lệ
            if (page < 1 || limit < 1) {
                return res.status(400).json({ error: 'Invalid page or limit value' });
            }

            // Bộ lọc tìm kiếm
            const filters = {};
            if (keyword) {
                filters.name = { $regex: keyword, $options: 'i' };
            }

            // Xác định tiêu chí sắp xếp
            let sortCriteria = {};
            switch (sort) {
                case 'price_asc':
                    sortCriteria = { price: 1 };
                    break;
                case 'price_desc':
                    sortCriteria = { price: -1 };
                    break;
                case 'creation_time_desc':
                    sortCriteria = { createdAt: -1 };
                    break;
                case 'rate_desc':
                    sortCriteria = { rate: -1 };
                    break;
                default:
                    sortCriteria = {};
            }

            // Tổng số sản phẩm và sản phẩm theo phân trang
            const total = await Product.countDocuments(filters);
            const products = await Product.find(filters)
                .sort(sortCriteria)
                .skip(skip)
                .limit(limit);

            // Sản phẩm đang giảm giá
            const dealProducts = await Product.find({ availibility: 'On Sale' });

            res.render('category', {
                products: mutipleMongooseToObject(products),
                dealProducts: mutipleMongooseToObject(dealProducts),
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                keyword,
                sort,
            });
        } catch (error) {
            console.error('Error in ViewProductListings:', error);
            next(error);
        }
    }

    // Chi tiết sản phẩm
    async ViewProductDetails(req, res, next) {
        try {
          const product = await Product.findOne({ slug: req.params.slug });
          const relevantProducts = await Product.find({ category: product.category }).limit(9);
          const page = parseInt(req.query.reviewPage) || 1;
          const limit = 5;
    
          // Fetch reviews with pagination
          const { reviews, totalReviews, totalPages, currentPage } = await ReviewController.getReviewsByProductId(
            product._id,
            page,
            limit
          );
          
          // Kiểm tra giá trị và kiểu dữ liệu
          console.log('currentPage:', currentPage, typeof currentPage);
          console.log('totalPages:', totalPages, typeof totalPages);
          
          // Calculate overallRating using ReviewController
          const overallRating = await ReviewController.getOverallRating(product._id);
    
          // Update the product's rate
          product.rate = overallRating;
          await product.save();
    
          // Calculate ratingBreakdown using ReviewController
          const ratingBreakdown = await ReviewController.getRatingBreakdown(product._id);
    
          res.render('product-details', { 
            product: mongooseToObject(product),
            relevantProducts: mutipleMongooseToObject(relevantProducts),
            reviews: mutipleMongooseToObject(reviews),
            overallRating,
            totalReviews,
            ratingBreakdown,
            user: req.user,
            reviewPagination: { totalPages, currentPage },
          });
        } catch (error) {
          next(error);
        }
      }



    ViewOrderConfirmation(req, res, next) {
        res.render('confirmation');
    }

    // Tìm kiếm sản phẩm
    async SearchProduct(req, res, next) {
        try {
            const {
                type: productType,
                brand: productBrand,
                color: productColor,
                minPrice,
                maxPrice,
                page = 1,
                limit = 12,
                keyword,
                sort,
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const filters = {};

            if (keyword) {
                filters.name = { $regex: keyword, $options: 'i' };
            }

            if (productType) {
                const typeArray = productType.includes(',') ? productType.split(',') : [productType];
                filters.type = { $in: typeArray };
            }

            if (productBrand) {
                const brandArray = productBrand.includes(',') ? productBrand.split(',') : [productBrand];
                filters.brand = { $in: brandArray };
            }

            if (productColor) {
                const colorArray = productColor.includes(',') ? productColor.split(',') : [productColor];
                filters.color = { $in: colorArray };
            }

            if (minPrice || maxPrice) {
                filters.price = {};
                if (minPrice) filters.price.$gte = parseFloat(minPrice);
                if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
            }

            let sortCriteria = {};
            switch (sort) {
                case 'price_asc':
                    sortCriteria = { price: 1 };
                    break;
                case 'price_desc':
                    sortCriteria = { price: -1 };
                    break;
                case 'creation_time_desc':
                    sortCriteria = { createdAt: -1 };
                    break;
                case 'rate_desc':
                    sortCriteria = { rate: -1 };
                    break;
                default:
                    sortCriteria = {};
            }

            const total = await Product.countDocuments(filters);
            const products = await Product.find(filters)
                .sort(sortCriteria)
                .skip(skip)
                .limit(parseInt(limit));
            const dealProducts = await Product.find({ availibility: 'On Sale' });

            res.render('category', {
                products: mutipleMongooseToObject(products),
                sort,
                limit,
                productType,
                productBrand,
                productColor,
                minPrice,
                maxPrice,
                dealProducts: mutipleMongooseToObject(dealProducts),
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            console.error('Error searching products:', error);
            next(error);
        }
    }

    // Lọc sản phẩm
    async getFilteredProducts(req, res, next) {
        try {
            const {
                type: productType,
                brand: productBrand,
                color: productColor,
                minPrice,
                maxPrice,
                page = 1,
                limit = 12,
                keyword,
                sort,
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const filters = {};

            if (keyword) {
                filters.name = { $regex: keyword, $options: 'i' };
            }

            if (productType) {
                const typeArray = productType.includes(',') ? productType.split(',') : [productType];
                filters.type = { $in: typeArray };
            }

            if (productBrand) {
                const brandArray = productBrand.includes(',') ? productBrand.split(',') : [productBrand];
                filters.brand = { $in: brandArray };
            }

            if (productColor) {
                const colorArray = productColor.includes(',') ? productColor.split(',') : [productColor];
                filters.color = { $in: colorArray };
            }

            if (minPrice || maxPrice) {
                filters.price = {};
                if (minPrice) filters.price.$gte = parseFloat(minPrice);
                if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
            }

            let sortCriteria = {};
            switch (sort) {
                case 'price_asc':
                    sortCriteria = { price: 1 };
                    break;
                case 'price_desc':
                    sortCriteria = { price: -1 };
                    break;
                case 'creation_time_desc':
                    sortCriteria = { createdAt: -1 };
                    break;
                case 'rate_desc':
                    sortCriteria = { rate: -1 };
                    break;
                default:
                    sortCriteria = {};
            }

            const total = await Product.countDocuments(filters);
            const products = await Product.find(filters)
                .sort(sortCriteria)
                .skip(skip)
                .limit(parseInt(limit));

            res.json({
                products: mutipleMongooseToObject(products),
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            console.error('Error filtering products:', error);
            res.status(500).json({ message: 'Error filtering products', error });
        }
    }

    async updateProduct(req, res, next) {
        try {
            const { slug } = req.params;
            const updateData = req.body;

            const updatedProduct = await ProductService.updateProduct(slug, updateData);
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product updated successfully', product: updatedProduct });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Error updating product', error });
        }
    }

    // Thêm ảnh cho sản phẩm
    async addImage(req, res, next) {
        try {
            const { slug } = req.params;
            const { image } = req.body;

            if (!image) {
                return res.status(400).json({ message: 'Image URL is required' });
            }

            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            product.image = image;
            await ProductService.saveProduct(product);

            res.json({ message: 'Image added successfully', product });
        } catch (error) {
            console.error('Error adding image:', error);
            res.status(500).json({ message: 'Error adding image', error });
        }
    }

    // Xóa ảnh của sản phẩm
    async removeImage(req, res, next) {
        try {
            const { slug } = req.params;

            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            product.image = null;
            await ProductService.saveProduct(product);

            res.json({ message: 'Image removed successfully', product });
        } catch (error) {
            console.error('Error removing image:', error);
            res.status(500).json({ message: 'Error removing image', error });
        }
    }

    // Thay đổi danh mục hoặc thương hiệu của sản phẩm
    async changeCategoryOrBrand(req, res, next) {
        try {
            const { slug } = req.params;
            const { category, brand } = req.body;

            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (category) {
                product.category = category;
            }
            if (brand) {
                product.brand = brand;
            }

            await ProductService.saveProduct(product);

            res.json({ message: 'Category/Brand updated successfully', product });
        } catch (error) {
            console.error('Error updating category/brand:', error);
            res.status(500).json({ message: 'Error updating category/brand', error });
        }
    }

    // Cập nhật tình trạng của sản phẩm
    async updateAvailability(req, res, next) {
        try {
            const { slug } = req.params;
            const { availability } = req.body;

            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            product.availibility = availability;
            await ProductService.saveProduct(product);

            res.json({ message: 'Availability updated successfully', product });
        } catch (error) {
            console.error('Error updating availability:', error);
            res.status(500).json({ message: 'Error updating availability', error });
        }
    }
}

module.exports = new ProductController();

const { MAX } = require('uuid');
const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');
//const ReviewController = require('../../review/controllers/ReviewController');
const Product = require("../models/Product");
const ProductService = require('../services/ProductService');
const cloudinary = require('cloudinary').v2;
const upload = require('../../../config/cloudinary/cloudinaryConfig');


class ProductController {

     // Hiển thị form cập nhật sản phẩm
    async editProductForm(req, res, next) {
        try {
            const { slug } = req.params;

            // Lấy thông tin sản phẩm từ slug
            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Render form với dữ liệu sản phẩm
            res.render('edit-product', { product: mongooseToObject(product) });
        } catch (error) {
            console.error('Error rendering edit form:', error);
            res.status(500).json({ message: 'Error rendering edit form', error });
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

            const total = await ProductService.countProducts(filters);
            const products = await ProductService.getProductList(filters,sortCriteria,skip,parseInt(limit));
               

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

    async ViewProductListings(req, res, next) {
        try {
            const keyword = req.query.keyword?.trim() || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;
            const sort = req.query.sort || 'default';

            const filters = {};
            if (keyword) filters.name = { $regex: keyword, $options: 'i' };

            let sortCriteria = {};
            switch (sort) {
                case 'price_asc': sortCriteria = { price: 1 }; break;
                case 'price_desc': sortCriteria = { price: -1 }; break;
                case 'creation_time_desc': sortCriteria = { createdAt: -1 }; break;
                case 'rate_desc': sortCriteria = { rate: -1 }; break;
                default: sortCriteria = {};
            }

            const total = await ProductService.countProducts(filters);
            const products = await ProductService.getProductList(filters, sortCriteria, skip, limit);

            res.render('category', {
                products: mutipleMongooseToObject(products),
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                keyword,
                sort,
            });
        } catch (error) {
            next(error);
        }
    }

    // async ViewProductDetails(req, res, next) {
    //     try {
    //         const product = await ProductService.getProductBySlug(req.params.slug);
    //         if (!product) return res.status(404).send('Product not found');

    //         const relevantProducts = await ProductService.getRelevantProducts(product.category, 9);

    //         const page = parseInt(req.query.reviewPage) || 1;
    //         const limit = 5;

    //         const { reviews, totalReviews, totalPages, currentPage } = await ReviewController.getReviewsByProductId(
    //             product._id,
    //             page,
    //             limit
    //         );

    //         const overallRating = await ReviewController.getOverallRating(product._id);
    //         product.rate = overallRating;
    //         await product.save();

    //         const ratingBreakdown = await ReviewController.getRatingBreakdown(product._id);

    //         res.render('product-details', {
    //             product: mongooseToObject(product),
    //             relevantProducts: mutipleMongooseToObject(relevantProducts),
    //             reviews: mutipleMongooseToObject(reviews),
    //             overallRating,
    //             totalReviews,
    //             ratingBreakdown,
    //             user: req.user,
    //             reviewPagination: { totalPages, currentPage },
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

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

            if (keyword) filters.name = { $regex: keyword, $options: 'i' };
            if (productType) filters.type = { $in: productType.split(',') };
            if (productBrand) filters.brand = { $in: productBrand.split(',') };
            if (productColor) filters.color = { $in: productColor.split(',') };
            if (minPrice || maxPrice) filters.price = { ...(minPrice && { $gte: minPrice }), ...(maxPrice && { $lte: maxPrice }) };

            let sortCriteria = {};
            switch (sort) {
                case 'price_asc': sortCriteria = { price: 1 }; break;
                case 'price_desc': sortCriteria = { price: -1 }; break;
                case 'creation_time_desc': sortCriteria = { createdAt: -1 }; break;
                case 'rate_desc': sortCriteria = { rate: -1 }; break;
                default: sortCriteria = {};
            }

            const total = await ProductService.countProducts(filters);
            const products = await ProductService.getProductList(filters, sortCriteria, skip, parseInt(limit));

            res.render('category', {
                products: mutipleMongooseToObject(products),
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            next(error);
        }
    }


    async updateProduct(req, res, next) {
        upload.single('image')(req, res, async function (err) {
            try {
                if (err) {
                    console.error('Multer error:', err);
                    return res.status(400).json({ message: 'Error uploading file', error: err.message });
                }
    
                const { slug } = req.params;
                const updateData = req.body;
    
                // Tìm sản phẩm theo slug
                const product = await ProductService.findProductBySlug(slug);
                if (!product) {
                    return res.status(404).json({ message: 'Product not found' });
                }
    
                // Cập nhật các trường từ body (chỉ cập nhật nếu có giá trị)
                for (const key in updateData) {
                    if (updateData[key] !== undefined) {
                        product[key] = updateData[key];
                    }
                }
    
                // Xử lý cập nhật hình ảnh nếu file được upload
                if (req.file) {
                    product.image = req.file.path; // URL của hình ảnh từ Cloudinary
                }
    
                // Lưu sản phẩm sau khi cập nhật
                const updatedProduct = await ProductService.saveProduct(product);
    
                res.json({ message: 'Product updated successfully', product: updatedProduct });
            } catch (error) {
                console.error('Error updating product:', error);
                res.status(500).json({ message: 'Error updating product', error });
            }
        });
    }
    

    // Thêm ảnh cho sản phẩm
  async addImage(req, res, next) {
    upload.single('image')(req, res, async function (err) {
        try {
            // Xử lý lỗi từ Multer
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({ message: 'Error uploading file', error: err.message });
            }

            // Lấy slug từ params
            const { slug } = req.params;

            // Tìm sản phẩm theo slug
            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Kiểm tra nếu file không tồn tại
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Upload thành công, lấy URL của ảnh
            const imageUrl = req.file.path;

            // Cập nhật ảnh vào sản phẩm
            product.image = imageUrl;
            await ProductService.saveProduct(product);

            res.json({ message: 'Image added successfully', product });
        } catch (error) {
            console.error('Error adding image:', error);
            res.status(500).json({ message: 'Error adding image', error });
        }
    });
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
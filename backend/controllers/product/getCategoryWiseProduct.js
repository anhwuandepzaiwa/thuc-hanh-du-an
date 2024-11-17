const productModel = require("../../models/productModel")

const getCategoryWiseProduct = async (req, res) => {
    try {
        const { category } = req?.body || req?.query
        const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là trang 1
        const limit = parseInt(req.query.limit) || 10; // Số sản phẩm mỗi trang, mặc định là 10
        const skip = (page - 1) * limit;

        // Đếm tổng số sản phẩm thuộc danh mục
        const totalProducts = await productModel.countDocuments({ category });

        // Tính số lượng trang dựa trên tổng số sản phẩm
        const totalPages = Math.ceil(totalProducts / limit);

        const product = await productModel.find({ category })
            .limit(limit)  // Giới hạn số lượng sản phẩm
            .skip(skip);  // Bỏ qua sản phẩm từ các trang trước

        res.json({
            data: product,
            message: "Product",
            success: true,
            error: false,
            page: page,
            limit: limit,
            totalPages: totalPages,  // Tổng số trang
            totalProducts: totalProducts // Tổng số sản phẩm
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = getCategoryWiseProduct;

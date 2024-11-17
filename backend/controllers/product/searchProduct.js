const productModel = require("../../models/productModel");

const searchProduct = async (req, res) => {
    try {
        const query = req.query.q?.trim();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Kiểm tra nếu không có từ khóa tìm kiếm
        if (!query) {
            return res.status(400).json({
                message: "Search query cannot be empty",
                error: true,
                success: false
            });
        }

        const regex = new RegExp(query, 'i'); // Không cần cờ 'g' vì không có lợi trong tìm kiếm

        const products = await productModel.find({
            "$or": [
                { productName: regex },
                { category: regex },
                { subcategory: regex }
            ]
        })
        .skip((page - 1) * limit) // Bỏ qua các kết quả của trang trước
        .limit(limit); // Giới hạn số lượng kết quả trả về

        // Kiểm tra nếu không tìm thấy sản phẩm nào
        if (products.length === 0) {
            return res.status(404).json({
                message: "No products found",
                error: false,
                success: true,
                data: []
            });
        }

        res.status(200).json({
            data: products,
            message: "Search Product list",
            error: false,
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
};

module.exports = searchProduct;

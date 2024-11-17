const productModel = require("../../models/productModel");

const getProductController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit; 

        const allProducts = await productModel
            .find()
            .sort({ createdAt: -1 }) 
            .skip(skip) 
            .limit(limit);

        res.status(200).json({
            message: "All Products",
            success: true,
            error: false,
            data: allProducts
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
};

module.exports = getProductController;

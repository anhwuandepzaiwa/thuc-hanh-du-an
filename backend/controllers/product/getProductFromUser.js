const productModel = require("../../models/productModel");

const getProductFromUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit; 
        const category = req.query.category; 
        const subcategory = req.query.subcategory;
        const isNew = req.query.new === 'true';  // Check if "new" is set to true in the query

        // Build the filter object
        const filter = {};
        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;
        if (isNew) filter.new = true;  // Add new filter if isNew is true

        // Get the total count of products based on the filter
        const totalProducts = await productModel.countDocuments(filter);

        // Get the paginated list of products based on the filter
        const allProducts = await productModel
            .find(filter)
            .sort({ createdAt: -1 }) 
            .skip(skip) 
            .limit(limit);

        res.status(200).json({
            message: "All Products",
            success: true,
            error: false,
            totalProducts,  // Include the total count in the response
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

module.exports = getProductFromUser;

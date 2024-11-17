const productModel = require("../../models/productModel");

const filterProductController = async (req, res) => {
  try {
    const categoryList = req.body.category || [];
    const subcategoryList = req.body.subcategory || [];
    const minSoldCount = req.body.minSoldCount || 0;
    const sortBy = req.body.sortBy || "priceAsc"; // Default to sorting by price in ascending order

    // Define sort criteria based on sortBy
    let sortCriteria = {};
    switch (sortBy) {
      case "priceAsc": // Price ascending
        sortCriteria = { price: 1 };
        break;
      case "priceDesc": // Price descending
        sortCriteria = { price: -1 };
        break;
      case "nameAsc": // Name A-Z
        sortCriteria = { name: 1 };
        break;
      case "nameDesc": // Name Z-A
        sortCriteria = { name: -1 };
        break;
      case "oldest": // Oldest product
        sortCriteria = { createdAt: 1 };
        break;
      case "newest": // Newest product
        sortCriteria = { createdAt: -1 };
        break;
      case "bestSelling": // Best-selling products by soldCount
        sortCriteria = { soldCount: -1 };
        break;
      default:
        sortCriteria = { price: 1 }; // Default to price ascending
    }

    // Build filter object based on provided criteria
    const filter = {
      category: { "$in": categoryList },
      subcategory: { "$in": subcategoryList },
      soldCount: { "$gte": minSoldCount }
    };

    // Get the total count of products based on the filter
    const totalProducts = await productModel.countDocuments(filter);

    // Get the filtered and sorted products
    const products = await productModel
      .find(filter)
      .sort(sortCriteria);

    res.json({
      totalProducts, // Include total product count in the response
      data: products,
      message: "Filtered products",
      error: false,
      success: true
    });
  } catch (err) {
    res.json({
      message: err.message || "Internal Server Error",
      error: true,
      success: false
    });
  }
};

module.exports = filterProductController;

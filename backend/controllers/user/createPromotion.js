const Promotion = require("../../models/promotionSchema")

const createPromotion = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, startDate, endDate, usageLimit } = req.body;

        // Kiểm tra xem mã khuyến mại đã tồn tại chưa
        const existingPromotion = await Promotion.findOne({ code });
        if (existingPromotion) {
            return res.status(400).json({
                message: "Promotion code already exists",
                success: false
            });
        }

        // Tạo mã khuyến mại mới
        const newPromotion = new Promotion({
            code,
            discountType,
            discountValue,
            minOrderValue,
            startDate,
            endDate,
            usageLimit,
            isActive: true
        });

        // Lưu mã khuyến mại vào cơ sở dữ liệu
        await newPromotion.save();

        res.status(201).json({
            message: "Promotion code created successfully",
            success: true,
            data: newPromotion
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "Server error",
            success: false
        });
    }
};

module.exports = createPromotion;

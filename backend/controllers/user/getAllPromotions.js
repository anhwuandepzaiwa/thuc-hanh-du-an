const Promotion = require('../../models/promotionSchema');

const getAllPromotions = async (req, res) => {
    try {
        // Lấy tất cả mã khuyến mại
        const promotions = await Promotion.find();

        res.json({ success: true, promotions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retrieve promotions' });
    }
};

module.exports = getAllPromotions;
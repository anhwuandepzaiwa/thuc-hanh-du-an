const Promotion = require('../../models/promotionSchema');

const deletePromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;

        // Tìm và xóa mã khuyến mại theo ID
        const deletedPromotion = await Promotion.findByIdAndDelete(promotionId);

        if (!deletedPromotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        res.json({ success: true, message: 'Promotion deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete promotion' });
    }
};

module.exports = deletePromotion;
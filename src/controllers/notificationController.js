import { Notification } from '../model/Notification.js'
import { Company } from '../model/Company.js'

// 1. GET ALL NOTIFICATIONS
const getAllNotifications = async (req, res) => {
    try {
        const companyId = req.tenantId || req.user?._id;

        const notifications = await Notification.find({ companyId })
            .sort({ createdAt: -1 })
            .limit(50); 

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. MARK ALL AS READ
const markAllRead = async (req, res) => {
    try {
        const companyId = req.tenantId || req.user?._id;

        const result = await Notification.updateMany(
            { companyId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notifications marked as read.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. CLEAR ALL NOTIFICATIONS (Manual Delete)
const clearAllNotifications = async (req, res) => {
    try {
        const companyId = req.tenantId || req.user?._id;

        await Notification.deleteMany({ companyId });

        await Company.findByIdAndUpdate(companyId, {
            $set: { notifications: [] }
        });

        res.status(200).json({
            success: true,
            message: "All notifications cleared successfully."
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export{clearAllNotifications,markAllRead,getAllNotifications}
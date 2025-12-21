import { initBusinessSession } from '../services/sendWhatApp.js';

export const linkedWhatsApp = async (req, res) => {

    const io = req.app.get('socketio'); // Get Socket.io instance from app
    const companyId = req.tenantId.toString();

    try {
        initBusinessSession(companyId, io);
        res.status(200).json({ 
            success: true, 
            message: "WhatsApp initialization started. Please listen for the QR code via Socket.io" 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
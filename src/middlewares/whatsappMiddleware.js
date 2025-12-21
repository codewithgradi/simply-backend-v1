import { sessions } from '../services/sendWhatApp.js';

export const ensureWhatsAppConnected = (req, res, next) => {
    const companyId = req.tenantId.toString();
    const client = sessions.get(companyId);

    // Check if session exists AND if it's actually authenticated/ready
    if (!client || !client.info) {
        return res.status(412).json({
            success: false, 
            message: "WhatsApp is starting up or not linked. Please wait a moment or scan the QR code."
        });
    }

    next();
};
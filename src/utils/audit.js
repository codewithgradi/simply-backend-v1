import Log from '../model/Log.js';

export const createAuditLog = async (data) => {
    if (process.env.ENABLE_ACTIVITY_LOGS !== 'true') return;

    try {
        await Log.create({
            adminId: data.adminId,
            action: data.action,
            targetId: data.targetId,
            details: data.details,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Failed to write audit log:", error.message);
    }
};
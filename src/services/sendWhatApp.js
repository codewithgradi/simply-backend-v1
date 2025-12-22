import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg
import QrCode from 'qrcode';

export const sessions = new Map();
export const qrCache = new Map();

export const initBusinessSession = async (companyId, io) => {
    // 1. Check if session exists and is alive
    if (sessions.has(companyId)) {
        const client = sessions.get(companyId);
        try {
            const state = await client.getState();
            if (state === 'CONNECTED') {
                return io.to(companyId).emit('whatsapp-status', 'CONNECTED');
            }
        } catch (e) {
            sessions.delete(companyId); // Clear dead session
        }
    }

    // 2. If we have a cached QR, send it immediately to the room
    if (qrCache.has(companyId)) {
        io.to(companyId).emit('whatsapp-qr', qrCache.get(companyId));
    }

    // 3. Create new client if needed
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: companyId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        qrCache.set(companyId, qr); // Store QR
        io.to(companyId).emit('whatsapp-qr', qr);
        console.log(`QR sent to room: ${companyId}`);
    });

    client.on('ready', () => {
        qrCache.delete(companyId);
        sessions.set(companyId, client);
        io.to(companyId).emit('whatsapp-status', 'CONNECTED');
        console.log(`WhatsApp Ready for: ${companyId}`);
    });

    client.on('auth_failure', () => {
        qrCache.delete(companyId);
        sessions.delete(companyId);
        io.to(companyId).emit('whatsapp-status', 'ERROR');
    });

    client.initialize().catch(err => console.error("Init error", err));
};
/**
 * Your sending function now needs to know WHICH business is sending
 */
export const sendVisitorWhatsApp = async (companyId, phone, visitorName, passCode) => {
    const client = sessions.get(companyId);
    
    if (!client) throw new Error("WhatsApp not linked for this business");

    const formattedPhone = `27${phone.substring(1)}@c.us`;
    const isRegistered = await client.isRegisteredUser(formattedPhone);
    if (isRegistered) {
        const qrBuffer = await QRCode.toBuffer(passCode);
        const media = new MessageMedia('image/png', qrBuffer.toString('base64'), 'exit-pass.png');

        await client.sendMessage(formattedPhone, media, {
            caption: `*EXIT PASS*\n\nHi ${visitorName}, scan this QRCode at the exit to check out.\nHope to see you soon.`
    });
    } else {
        console.log("This number is not registered on WhatsApp.");
        return res.status(403).json({success:false,message:'Number is not registered on WhatsApp.'})
    }
    
};


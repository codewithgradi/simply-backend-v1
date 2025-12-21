import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg
import qrcodeTerminal from 'qrcode-terminal';

import QRCode from 'qrcode';

// Store all active business sessions here
export const sessions = new Map();

/**
 * Initializes a unique WhatsApp session for a specific business
 */
export const initBusinessSession = (companyId, io) => {
    // If session already exists, don't recreate it
    if (sessions.has(companyId)) return;

    const client = new Client({
        authStrategy: new LocalAuth({ 
            clientId: companyId, // Unique folder for each business
            dataPath: './sessions' 
        }),
        puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // This helps save a lot of RAM in Node environments
            '--disable-gpu'
        ],
    }
    });

    // Handle QR Code for the Website Dashboard
    client.on('qr', (qr) => {
        console.log(`QR generated for ${companyId}`);

        qrcodeTerminal.generate(qr, { small: true });

        // Send the QR code to the business owner's browser via Socket.io
        io.to(companyId).emit('whatsapp-qr', qr);
    });

    client.on('ready', () => {
        console.log(`Business ${companyId} is ONLINE`);
        sessions.set(companyId, client);
        io.to(companyId).emit('whatsapp-status', 'CONNECTED');
    });

    client.initialize();
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


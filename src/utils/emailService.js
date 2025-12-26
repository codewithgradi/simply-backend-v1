import QRCode from 'qrcode';
import { transporter } from '../config/emailConfig.js';

export const sendVisitorEmail = async (email, firstName, roomNumber, passCode) => {
    try {
        // Generate the QR Code Buffer
        const qrBuffer = await QRCode.toBuffer(passCode, {
            color: {
                dark: '#00ED64',  
                light: '#001E2B'  
            },
            width: 300
        });

        const mailOptions = {
            from: `"Check-in System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Your Exit Pass - ${firstName}`,
            html: `
                <div style="background-color: #001E2B; color: #ffffff; padding: 40px; font-family: sans-serif; text-align: center; border-radius: 15px;">
                    <h1 style="color: #00ED64; margin-bottom: 5px;">Check-in Successful</h1>
                    <p style="color: #8899A6; margin-bottom: 30px;">Welcome to Room ${roomNumber}, ${firstName}.</p>
                    
                    <div style="background: #ffffff; padding: 20px; display: inline-block; border-radius: 12px; margin-bottom: 20px;">
                        <img src="cid:exit_qr" alt="Exit QR Code" width="200" height="200" />
                    </div>
                    
                    <p style="font-size: 14px; color: #E8EDF0;">Passcode for manual entry: <br/> 
                       <span style="font-family: monospace; font-size: 18px; color: #00ED64;">${passCode}</span>
                    </p>
                </div>
            `,
            attachments: [{
                filename: 'exit-pass.png',
                content: qrBuffer,
                cid: 'exit_qr' 
            }]
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email Service Error:", error.message);
        // We don't throw the error here so the main check-in process doesn't crash
        return null;
    }
};
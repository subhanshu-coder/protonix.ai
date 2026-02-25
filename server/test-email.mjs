import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
    },
});

console.log('Testing connection to Gmail...');
transporter.verify((err, ok) => {
    if (err) {
        console.error('❌ GMAIL FAILED:', err.message);
        console.error('Full error:', err.code, err.responseCode);
    } else {
        console.log('✅ Gmail credentials are VALID! Email will work.');
    }
    process.exit(0);
});

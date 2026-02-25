import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, 'server', '.env');
console.log('Testing dotenv read from:', envPath);

const result = dotenv.config({ path: envPath });

console.log('Error:', result.error?.message || 'None');
console.log('Parsed keys:', Object.keys(result.parsed || {}).length);
console.log('MONGODB_URI type:', typeof process.env.MONGODB_URI);
if (process.env.MONGODB_URI) {
    console.log('First 20 chars:', process.env.MONGODB_URI.substring(0, 20));
}

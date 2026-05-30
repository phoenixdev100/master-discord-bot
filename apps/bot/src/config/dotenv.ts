import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local from bot directory
const localEnvPath = join(__dirname, '../../.env.local');
config({ path: localEnvPath });

// Load root .env as fallback
const rootEnvPath = join(__dirname, '../../../../.env');
config({ path: rootEnvPath });

console.log('Loaded env files:', { localEnvPath, rootEnvPath });
console.log('DISCORD_BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN ? 'Found' : 'Not found');


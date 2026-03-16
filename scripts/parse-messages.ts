import { readFileSync } from 'fs';
import { DiscordMessageBuilder } from '../src/DiscordMessageBuilder.ts';

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: tsx scripts/parse-messages.ts <path-to-json>');
    process.exit(1);
}

const json = readFileSync(filePath, 'utf-8');
const messages = DiscordMessageBuilder.parseMessages(json);
console.log(messages);

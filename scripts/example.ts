import { readFileSync } from 'fs';
import { DiscordMessageBuilder } from '../src';

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: tsx scripts/example.ts <path-to-json>');
    process.exit(1);
}

const json = readFileSync(filePath, 'utf-8');
const messages = DiscordMessageBuilder.parseMessages(json, {useLocalImages: true});
console.log(messages);

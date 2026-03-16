import type { DiscordMessage, RawAttachment, RawExport, RawMessage } from './types';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);

export class DiscordMessageBuilder {
    static parseMessages(jsonString: string): DiscordMessage[] {
        const raw: RawExport = JSON.parse(jsonString);
        const messages = raw.messages ?? raw.pinnedMessages ?? [];
        return messages.map(DiscordMessageBuilder.mapMessage);
    }

    private static mapMessage(raw: RawMessage): DiscordMessage {
        return {
            message: raw.content,
            authorUsername: raw.author.name,
            authorNickname: raw.author.nickname,
            timeSent: new Date(raw.timestamp),
            imgLocation: DiscordMessageBuilder.findImageUrl(raw.attachments),
        };
    }

    private static findImageUrl(attachments: RawAttachment[]): string | null {
        const img = attachments.find((a) => {
            const ext = a.fileName.split('.').at(-1)?.toLowerCase() ?? '';
            return IMAGE_EXTENSIONS.has(ext);
        });
        return img?.url ?? null;
    }
}

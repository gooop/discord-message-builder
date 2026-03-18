import type { DiscordMessage, ParseOptions, RawAttachment, RawExport, RawMessage } from './types';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);

export class DiscordMessageBuilder {
    static parseMessages(jsonString: string, options: ParseOptions = {}): DiscordMessage[] {
        const raw: RawExport = JSON.parse(jsonString);
        const messages = raw.messages ?? raw.pinnedMessages ?? [];
        return messages.map((m) => DiscordMessageBuilder.mapMessage(m, options));
    }

    private static mapMessage(raw: RawMessage, options: ParseOptions): DiscordMessage {
        return {
            message: raw.content,
            authorUsername: raw.author.name,
            authorNickname: raw.author.nickname,
            timeSent: new Date(raw.timestamp),
            imgLocation: DiscordMessageBuilder.findImageLocation(raw.id, raw.attachments, options),
        };
    }

    private static findImageLocation(
        _messageId: string,
        attachments: RawAttachment[],
        options: ParseOptions,
    ): string | null {
        const img = attachments.find((a) => {
            const ext = a.fileName.split('.').at(-1)?.toLowerCase() ?? '';
            return IMAGE_EXTENSIONS.has(ext);
        });
        if (!img) return null;
        if (options.useLocalImages) {
            const ext = img.fileName.split('.').at(-1)!.toLowerCase();
            return `${img.id}.${ext}`;
        }
        return img.url;
    }
}

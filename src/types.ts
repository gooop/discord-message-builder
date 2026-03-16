export interface DiscordMessage {
    message: string;
    authorNickname: string;
    authorUsername: string;
    timeSent: Date;
    imgLocation: string | null;
}

export interface RawAttachment {
    id: string;
    url: string;
    fileName: string;
    fileSizeBytes: number;
}

// Raw shape of one message entry in the export JSON
export interface RawMessage {
    id: string;
    content: string;
    timestamp: string;
    author: {
        name: string;
        nickname: string;
    };
    attachments: RawAttachment[];
}

export interface ParseOptions {
    useLocalImages?: boolean;
}

export interface RawExport {
    messages?: RawMessage[];
    pinnedMessages?: RawMessage[];
}

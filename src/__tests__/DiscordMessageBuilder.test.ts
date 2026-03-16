import { DiscordMessageBuilder } from '../DiscordMessageBuilder';

const IMAGE_URL =
    'https://cdn.discordapp.com/attachments/779550235969323022/784284734926225449/photo.png';

const makeFixture = (attachments: unknown[] = [], embeds: unknown[] = []) =>
    JSON.stringify({
        guild: { id: '1', name: 'test guild', iconUrl: '' },
        channel: {
            id: '2',
            type: 'GuildTextChat',
            categoryId: '3',
            category: 'Text',
            name: 'general',
            topic: null,
        },
        messages: [
            {
                id: '100',
                type: 'Default',
                timestamp: '2024-01-15T10:30:00.000+00:00',
                timestampEdited: null,
                callEndedTimestamp: null,
                isPinned: false,
                content: 'Hello world',
                author: {
                    id: '200',
                    name: 'johndoe',
                    discriminator: '0000',
                    nickname: 'John',
                    color: '#ffffff',
                    isBot: false,
                    roles: [],
                    avatarUrl: '',
                },
                attachments,
                embeds,
                stickers: [],
                reactions: [],
                mentions: [],
                inlineEmojis: [],
            },
        ],
    });

const FIXTURE = makeFixture();

describe('DiscordMessageBuilder.parseMessages', () => {
    test('returns one message per entry', () => {
        const result = DiscordMessageBuilder.parseMessages(FIXTURE);
        expect(result).toHaveLength(1);
    });

    test('maps message content', () => {
        const [msg] = DiscordMessageBuilder.parseMessages(FIXTURE);
        expect(msg.message).toBe('Hello world');
    });

    test('maps authorUsername from author.name', () => {
        const [msg] = DiscordMessageBuilder.parseMessages(FIXTURE);
        expect(msg.authorUsername).toBe('johndoe');
    });

    test('maps authorNickname from author.nickname', () => {
        const [msg] = DiscordMessageBuilder.parseMessages(FIXTURE);
        expect(msg.authorNickname).toBe('John');
    });

    test('maps timeSent as a Date', () => {
        const [msg] = DiscordMessageBuilder.parseMessages(FIXTURE);
        expect(msg.timeSent).toBeInstanceOf(Date);
        expect(msg.timeSent.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    test('returns empty array for empty messages array', () => {
        const json = JSON.stringify({ ...JSON.parse(FIXTURE), messages: [] });
        expect(DiscordMessageBuilder.parseMessages(json)).toEqual([]);
    });

    describe('imgLocation', () => {
        test('is null when there are no attachments', () => {
            const [msg] = DiscordMessageBuilder.parseMessages(makeFixture());
            expect(msg.imgLocation).toBeNull();
        });

        test('is null when the only attachment is not an image', () => {
            const [msg] = DiscordMessageBuilder.parseMessages(
                makeFixture([
                    {
                        id: '1',
                        url: 'https://cdn.discordapp.com/attachments/1/1/clip.mp4',
                        fileName: 'clip.mp4',
                        fileSizeBytes: 5000000,
                    },
                ]),
            );
            expect(msg.imgLocation).toBeNull();
        });

        test('is null when the message has only an embed (link preview), no attachment', () => {
            const [msg] = DiscordMessageBuilder.parseMessages(
                makeFixture(
                    [],
                    [
                        {
                            title: 'Some YouTube video',
                            url: 'https://www.youtube.com/watch?v=abc123',
                            thumbnail: { url: 'https://i.ytimg.com/vi/abc123/maxresdefault.jpg' },
                        },
                    ],
                ),
            );
            expect(msg.imgLocation).toBeNull();
        });

        test.each([
            ['png', IMAGE_URL],
            ['jpg', IMAGE_URL.replace('.png', '.jpg')],
            ['jpeg', IMAGE_URL.replace('.png', '.jpeg')],
            ['gif', IMAGE_URL.replace('.png', '.gif')],
            ['webp', IMAGE_URL.replace('.png', '.webp')],
        ])('uses the url for a .%s attachment', (_ext, url) => {
            const [msg] = DiscordMessageBuilder.parseMessages(
                makeFixture([
                    {
                        id: '1',
                        url,
                        fileName: url.split('/').at(-1),
                        fileSizeBytes: 100000,
                    },
                ]),
            );
            expect(msg.imgLocation).toBe(url);
        });

        test('uses the first image attachment when multiple attachments exist', () => {
            const secondUrl = IMAGE_URL.replace('photo.png', 'other.jpg');
            const [msg] = DiscordMessageBuilder.parseMessages(
                makeFixture([
                    { id: '1', url: IMAGE_URL, fileName: 'photo.png', fileSizeBytes: 100 },
                    { id: '2', url: secondUrl, fileName: 'other.jpg', fileSizeBytes: 200 },
                ]),
            );
            expect(msg.imgLocation).toBe(IMAGE_URL);
        });

        test('skips non-image attachments to find the first image', () => {
            const [msg] = DiscordMessageBuilder.parseMessages(
                makeFixture([
                    {
                        id: '1',
                        url: 'https://cdn.discordapp.com/attachments/1/1/clip.mp4',
                        fileName: 'clip.mp4',
                        fileSizeBytes: 5000000,
                    },
                    { id: '2', url: IMAGE_URL, fileName: 'photo.png', fileSizeBytes: 100 },
                ]),
            );
            expect(msg.imgLocation).toBe(IMAGE_URL);
        });
    });
});

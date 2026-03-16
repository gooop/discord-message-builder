const add = (a: number, b: number): number => a + b;

describe('add', () => {
    test('adds two numbers', () => {
        expect(add(2, 3)).toBe(5);
    });
});

const mockQuery = {
    select: jest.fn().mockResolvedValue({ classesHandled: ['A'] })
};

describe("debug", () => {
    it("resolves chained mock", async () => {
        const result = await mockQuery.select('classesHandled');
        expect(result).toEqual({ classesHandled: ['A'] });
    });
});

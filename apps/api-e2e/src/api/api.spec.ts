import axios from 'axios';

describe('GET /api/v1/dioceses', () => {
  it('returns a page of published dioceses', async () => {
    const res = await axios.get(`/api/v1/dioceses`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ items: expect.any(Array), nextCursor: null });
  });
});

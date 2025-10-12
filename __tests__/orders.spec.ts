import { createMocks } from 'node-mocks-http';
import handler from '@/api/orders';
import { getMongoClient } from '@/lib/mongo';

jest.mock('@/lib/mongo');

describe('Orders API', () => {
  let dbMock;

  beforeAll(() => {
    dbMock = {
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockOrderId' }),
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([{ orderId: 'mockOrderId', customerEmail: 'test@example.com' }]) }),
      }),
    };
    getMongoClient.mockResolvedValue({ db: dbMock });
  });

  it('should save a new order', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerEmail: 'test@example.com',
        items: [{ name: 'Product 1', quantity: 1, price: 100 }],
        totalAmount: 100,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Order saved successfully', orderId: 'mockOrderId' });
  });

  it('should fetch orders for a user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { email: 'test@example.com' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ orders: [{ orderId: 'mockOrderId', customerEmail: 'test@example.com' }] });
  });
});
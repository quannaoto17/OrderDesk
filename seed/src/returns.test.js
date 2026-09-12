const { openReturn } = require('./returns');

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const order = (deliveredAt) => ({ id: 'ord-1', deliveredAt });
const line = { sku: 'ABC', qty: 1 };

test('allows opening a return exactly 30 days after delivery', () => {
  expect(() => openReturn(order(daysAgo(30)), [line])).not.toThrow();
});

test('refuses opening a return 31 days after delivery', () => {
  expect(() => openReturn(order(daysAgo(31)), [line])).toThrow(/30 days after delivery/);
});

test('allows opening a return when nothing has been delivered yet', () => {
  expect(() => openReturn(order(null), [line])).not.toThrow();
});

test('still refuses an empty line list', () => {
  expect(() => openReturn(order(daysAgo(1)), [])).toThrow('a return must cover at least one line');
});
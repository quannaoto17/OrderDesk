// Returns handling for OrderDesk.
//
// A return covers one or more lines of an order. A refund against it must be
// approved by a refunds clerk before any money moves.

/**
 * Open a return request against an order.
 *
 * @param {object} order  the order being returned against
 * @param {Array}  lines  the order lines the customer is sending back
 * @returns {object} the new return request
 */
const RETURN_WINDOW_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function openReturn(order, lines) {
  if (lines.length === 0) {
    throw new Error('a return must cover at least one line');
  }

  // Cửa sổ tính từ deliveredAt, KHÔNG tính từ ngày đặt hàng (docs/ policy nói vậy;
  // chữ "one month" trên website là vấn đề khác, không thuộc phạm vi ticket này)
  if (order.deliveredAt) {
    const daysSinceDelivery = Math.floor(
      (Date.now() - new Date(order.deliveredAt).getTime()) / MS_PER_DAY
    );
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      throw new Error(`a return cannot be opened more than ${RETURN_WINDOW_DAYS} days after delivery`);
    }
  }
  // Chưa có deliveredAt => cửa sổ chưa bắt đầu => vẫn cho phép

  return {
    orderId: order.id,
    lines,
    raisedAt: new Date().toISOString(),
    approvedBy: null,
    approvedAt: null,
  };
}

function approve(returnRequest, clerkId, reason) {
  if (!reason) {
    throw new Error('a refund approval must carry a reason');
  }

  return {
    ...returnRequest,
    approvedBy: clerkId,
    approvedAt: new Date().toISOString(),
    reason,
  };
}

module.exports = { openReturn, approve, RETURN_WINDOW_DAYS };
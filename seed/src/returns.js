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

  // RESOLUTION RATIONALE:
  // Merging main and feature/odk-152-return-window requires enforcing both business rules:
  // 1. Final clearance items are non-returnable (from main). We filter out non-eligible lines
  //    and reject the return if no returnable items remain.
  // 2. Returns must be requested within the 30-day window following delivery (from feature branch).
  //
  // Preserving both checks ensures non-clearance items cannot bypass the delivery window rule,
  // and delivered orders within the window still cannot return final clearance items.

  const eligibleLines = lines.filter(line => !line.finalClearance);
  if (eligibleLines.length === 0) {
    throw new Error('cannot return final clearance items');
  }

  if (order.deliveredAt) {
    const daysSinceDelivery = Math.floor(
      (Date.now() - new Date(order.deliveredAt).getTime()) / MS_PER_DAY
    );
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      throw new Error(`a return cannot be opened more than ${RETURN_WINDOW_DAYS} days after delivery`);
    }
  }

  return {
    orderId: order.id,
    lines: eligibleLines,
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
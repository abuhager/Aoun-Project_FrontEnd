import test from 'node:test';
import assert from 'node:assert/strict';
import { getBookingDeadlineState } from '../src/lib/utils/bookingDeadline.ts';

test('booking deadline changes at the exact boundary, independent of timezone', () => {
  const expiry = '2026-10-08T13:00:00+03:00';
  const boundary = Date.parse('2026-10-08T10:00:00Z');
  assert.equal(getBookingDeadlineState(expiry, boundary - 1), 'active');
  assert.equal(getBookingDeadlineState(expiry, boundary), 'expired');
  assert.equal(getBookingDeadlineState(expiry, boundary + 1), 'expired');
  assert.equal(getBookingDeadlineState(null, boundary), null);
  assert.equal(getBookingDeadlineState('invalid', boundary), null);
});

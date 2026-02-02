import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotals } from '../../src/common/utils/calculations';

describe('calculateInvoiceTotals', () => {
  it('should correctly calculate subtotal, tax and total for multiple items', () => {
    const items = [
      { quantity: 2, unitPrice: 100 }, // 200
      { quantity: 1, unitPrice: 50.5 }, // 50.5
    ];
    
    // subtotal = 250.5
    // tax (15%) = 37.575 -> 37.58
    // total = 288.08
    
    const result = calculateInvoiceTotals(items, 0.15);
    
    expect(result.subtotal.toNumber()).toBe(250.5);
    expect(result.taxAmount.toNumber()).toBe(37.58);
    expect(result.total.toNumber()).toBe(288.08);
  });

  it('should handle zero items', () => {
    const result = calculateInvoiceTotals([]);
    expect(result.subtotal.toNumber()).toBe(0);
    expect(result.total.toNumber()).toBe(0);
  });

  it('should handle high precision values', () => {
    const items = [
      { quantity: 0.3333, unitPrice: 10.1234 }
    ];
    // 0.3333 * 10.1234 = 3.37412922
    // tax = 0.506119383 -> 0.51
    // total = 3.37412922 + 0.51 = 3.88412922
    
    const result = calculateInvoiceTotals(items, 0.15);
    expect(result.processedItems[0].amount.toNumber()).toBe(3.37412922);
    expect(result.taxAmount.toNumber()).toBe(0.51);
  });
});

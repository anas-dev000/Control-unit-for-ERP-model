import { Decimal } from 'decimal.js';

export interface InvoiceItemInput {
  quantity: number | Decimal;
  unitPrice: number | Decimal;
}

export const calculateInvoiceTotals = (
  items: InvoiceItemInput[],
  taxRate: number = 0.15
) => {
  let subtotal = new Decimal(0);

  const processedItems = items.map((item) => {
    const amount = new Decimal(item.quantity).times(item.unitPrice);
    subtotal = subtotal.plus(amount);
    return {
      quantity: new Decimal(item.quantity),
      unitPrice: new Decimal(item.unitPrice),
      amount,
    };
  });

  const taxAmount = subtotal.times(taxRate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const total = subtotal.plus(taxAmount).toDecimalPlaces(2);

  return {
    processedItems,
    subtotal,
    taxAmount,
    total,
    taxRate,
  };
};

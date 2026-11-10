import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkStockStatus,
  calculateProfitMargin,
  calculateInventoryMetrics,
  validateSkuFormat,
  applyStockMovement,
  ProductItem,
} from './inventoryCalculations';

test('checkStockStatus identifies out of stock, low stock, and normal stock', () => {
  assert.equal(checkStockStatus(0, 5), 'OUT_OF_STOCK');
  assert.equal(checkStockStatus(-2, 5), 'OUT_OF_STOCK');
  assert.equal(checkStockStatus(3, 5), 'LOW_STOCK');
  assert.equal(checkStockStatus(5, 5), 'LOW_STOCK');
  assert.equal(checkStockStatus(6, 5), 'IN_STOCK');
  assert.equal(checkStockStatus(100, 5), 'IN_STOCK');
});

test('calculateProfitMargin calculates accurate gross margin percentage', () => {
  // Selling 100, Cost 60 -> Profit 40 -> 40% margin
  assert.equal(calculateProfitMargin(60, 100), 40);
  // Selling 35000, Cost 30000 -> Profit 5000 / 35000 = 14.29%
  assert.equal(calculateProfitMargin(30000, 35000), 14.29);
  // Zero selling price edge case
  assert.equal(calculateProfitMargin(50, 0), 0);
});

test('calculateInventoryMetrics aggregates multi-item portfolio metrics', () => {
  const sampleProducts: ProductItem[] = [
    {
      id: 'p1',
      organizationId: 'org1',
      name: 'Mechanical Keyboard',
      sku: 'KB-001',
      category: 'Peripherals',
      quantity: 10,
      costPrice: 50,
      sellingPrice: 80,
      lowStockLevel: 5,
    },
    {
      id: 'p2',
      organizationId: 'org1',
      name: 'Gaming Mouse',
      sku: 'MS-002',
      category: 'Peripherals',
      quantity: 3,
      costPrice: 25,
      sellingPrice: 45,
      lowStockLevel: 5, // low stock!
    },
    {
      id: 'p3',
      organizationId: 'org1',
      name: 'Desk Pad',
      sku: 'DP-003',
      category: 'Accessories',
      quantity: 0,
      costPrice: 10,
      sellingPrice: 20,
      lowStockLevel: 5, // out of stock!
    },
  ];

  const metrics = calculateInventoryMetrics(sampleProducts);
  assert.equal(metrics.totalSKUs, 3);
  assert.equal(metrics.totalUnits, 13); // 10 + 3 + 0
  assert.equal(metrics.totalCostValuation, 575); // 10*50 (500) + 3*25 (75) + 0*10 (0) = 575
  assert.equal(metrics.totalRetailValuation, 935); // 10*80 (800) + 3*45 (135) + 0*20 (0) = 935
  assert.equal(metrics.potentialProfit, 360); // 935 - 575 = 360
  assert.equal(metrics.lowStockCount, 1);
  assert.equal(metrics.outOfStockCount, 1);
});

test('validateSkuFormat checks string patterns and length', () => {
  assert.equal(validateSkuFormat('LAP-001').valid, true);
  assert.equal(validateSkuFormat('SKU_123').valid, true);
  assert.equal(validateSkuFormat('AB').valid, false); // too short
  assert.equal(validateSkuFormat('').valid, false);
  assert.equal(validateSkuFormat('INVALID!@#').valid, false);
});

test('applyStockMovement updates quantities safely and prevents negative stock', () => {
  // Stock In
  const stockInRes = applyStockMovement(10, 'STOCK_IN', 5);
  assert.equal(stockInRes.success, true);
  assert.equal(stockInRes.newQuantity, 15);

  // Stock Out - valid
  const stockOutValid = applyStockMovement(10, 'STOCK_OUT', 4);
  assert.equal(stockOutValid.success, true);
  assert.equal(stockOutValid.newQuantity, 6);

  // Stock Out - exceeds available
  const stockOutInvalid = applyStockMovement(10, 'STOCK_OUT', 15);
  assert.equal(stockOutInvalid.success, false);
  assert.equal(stockOutInvalid.newQuantity, 10);
  assert.match(stockOutInvalid.error || '', /Insufficient stock/i);

  // Direct Adjustment
  const adjustRes = applyStockMovement(10, 'ADJUSTMENT', 42);
  assert.equal(adjustRes.success, true);
  assert.equal(adjustRes.newQuantity, 42);
});

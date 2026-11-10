/**
 * Pure domain logic functions for StockFlow Inventory Calculations.
 * Decoupled from Express and React for easy unit testing.
 */

export interface ProductItem {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockLevel: number;
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

/**
 * Determines stock status based on current quantity and low stock threshold.
 */
export function checkStockStatus(quantity: number, lowStockLevel: number = 5): StockStatus {
  if (quantity <= 0) {
    return 'OUT_OF_STOCK';
  }
  if (quantity <= lowStockLevel) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
}

/**
 * Calculates gross profit margin percentage between cost and selling price.
 * Margin % = ((Selling Price - Cost Price) / Selling Price) * 100
 */
export function calculateProfitMargin(costPrice: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
  return Math.round(margin * 100) / 100;
}

/**
 * Computes inventory totals:
 * - Total Items (units count)
 * - Total Unique SKUs
 * - Total Cost Valuation
 * - Total Retail Valuation
 * - Potential Gross Profit
 * - Low Stock items count
 * - Out of Stock items count
 */
export function calculateInventoryMetrics(products: ProductItem[]) {
  let totalUnits = 0;
  let totalCostValuation = 0;
  let totalRetailValuation = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const item of products) {
    const qty = Math.max(0, item.quantity);
    totalUnits += qty;
    totalCostValuation += qty * item.costPrice;
    totalRetailValuation += qty * item.sellingPrice;

    const status = checkStockStatus(item.quantity, item.lowStockLevel);
    if (status === 'OUT_OF_STOCK') {
      outOfStockCount++;
    } else if (status === 'LOW_STOCK') {
      lowStockCount++;
    }
  }

  const potentialProfit = Math.max(0, totalRetailValuation - totalCostValuation);
  const averageMargin = totalRetailValuation > 0
    ? Math.round((potentialProfit / totalRetailValuation) * 1000) / 10
    : 0;

  return {
    totalSKUs: products.length,
    totalUnits,
    totalCostValuation: Math.round(totalCostValuation * 100) / 100,
    totalRetailValuation: Math.round(totalRetailValuation * 100) / 100,
    potentialProfit: Math.round(potentialProfit * 100) / 100,
    averageMargin,
    lowStockCount,
    outOfStockCount,
  };
}

/**
 * Validates SKU format:
 * - Must be alphanumeric and may include hyphens/underscores (e.g. LAP-001, PRD_99)
 * - Length between 3 and 20 characters
 */
export function validateSkuFormat(sku: string): { valid: boolean; reason?: string } {
  if (!sku || typeof sku !== 'string') {
    return { valid: false, reason: 'SKU is required' };
  }
  const trimmed = sku.trim().toUpperCase();
  if (trimmed.length < 3) {
    return { valid: false, reason: 'SKU must be at least 3 characters long' };
  }
  if (trimmed.length > 20) {
    return { valid: false, reason: 'SKU cannot exceed 20 characters' };
  }
  const skuRegex = /^[A-Z0-9_-]+$/;
  if (!skuRegex.test(trimmed)) {
    return { valid: false, reason: 'SKU must contain only uppercase letters, numbers, hyphens, and underscores' };
  }
  return { valid: true };
}

/**
 * Calculates new stock quantity after an adjustment (STOCK_IN, STOCK_OUT, or DIRECT_SET).
 * Prevents negative stock on STOCK_OUT.
 */
export function applyStockMovement(
  currentQuantity: number,
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT',
  delta: number
): { success: boolean; newQuantity: number; error?: string } {
  if (delta < 0) {
    return { success: false, newQuantity: currentQuantity, error: 'Adjustment amount cannot be negative' };
  }

  if (type === 'STOCK_IN') {
    return { success: true, newQuantity: currentQuantity + delta };
  }

  if (type === 'STOCK_OUT') {
    if (delta > currentQuantity) {
      return {
        success: false,
        newQuantity: currentQuantity,
        error: `Insufficient stock! Cannot remove ${delta} units when current inventory is ${currentQuantity}.`
      };
    }
    return { success: true, newQuantity: currentQuantity - delta };
  }

  if (type === 'ADJUSTMENT') {
    return { success: true, newQuantity: delta };
  }

  return { success: false, newQuantity: currentQuantity, error: 'Unknown movement type' };
}

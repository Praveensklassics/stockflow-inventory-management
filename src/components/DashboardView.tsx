import React from 'react';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  AlertCircle, 
  Boxes, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Plus, 
  ArrowLeftRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { DashboardMetrics, CategoryBreakdown, Product, InventoryTransaction, Organization } from '../types';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  categoryBreakdown: CategoryBreakdown[];
  lowStockAlerts: Product[];
  outOfStockAlerts: Product[];
  recentTransactions: InventoryTransaction[];
  organization: Organization | null;
  currencySymbol: string;
  onOpenAddProduct: () => void;
  onOpenAdjustStock: (product?: Product) => void;
  onNavigateToProducts: (filter?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  categoryBreakdown,
  lowStockAlerts,
  outOfStockAlerts,
  recentTransactions,
  organization,
  currencySymbol,
  onOpenAddProduct,
  onOpenAdjustStock,
  onNavigateToProducts,
}) => {
  const hasUrgentStockIssue = outOfStockAlerts.length > 0 || lowStockAlerts.length > 0;

  return (
    <div className="space-y-6">
      
      {/* Top Organization Header & Quick CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {organization?.name || 'Inventory Dashboard'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {organization?.industry || 'Active Organization'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time stock levels, inventory valuation, and multi-tenant ledger audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAdjustStock()}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
            Stock Movement
          </button>
          
          <button
            onClick={onOpenAddProduct}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {hasUrgentStockIssue && (
        <div className="bg-amber-950/40 border border-amber-600/40 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-200">
                Inventory Reorder Alert: {outOfStockAlerts.length} Depleted • {lowStockAlerts.length} Low Stock Items
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Current inventory levels for key SKUs have dropped below safety thresholds. Stockouts impact customer orders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToProducts('lowStock')}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg transition-colors text-center"
            >
              View Warning SKUs
            </button>
          </div>
        </div>
      )}

      {/* Key Metric Cards (FR-6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Number of Products (FR-6) */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Products (FR-6)
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {metrics.totalSKUs} <span className="text-xs font-normal text-slate-400">active SKUs</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-2">
            <span>Scoped tenant:</span>
            <span className="font-medium text-slate-300 truncate max-w-[140px]">
              {organization?.name}
            </span>
          </div>
        </div>

        {/* Sum of Quantity on Hand across all products (FR-6) */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sum of Quantity on Hand (FR-6)
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-cyan-300 tracking-tight">
              {metrics.totalUnits.toLocaleString()} <span className="text-xs font-normal text-slate-400">total units</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-2">
            <span>Average per SKU:</span>
            <span className="font-semibold text-cyan-400">
              {metrics.totalSKUs > 0 ? Math.round(metrics.totalUnits / metrics.totalSKUs) : 0} units
            </span>
          </div>
        </div>

        {/* Low Stock Items count (FR-6) */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Items (FR-6)
            </span>
            <div className={`p-2 rounded-lg ${outOfStockAlerts.length > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-amber-400 tracking-tight">
              {metrics.lowStockCount} <span className="text-xs font-normal text-amber-300">Low</span>
            </span>
            <span className="text-2xl font-bold text-rose-500 tracking-tight">
              {metrics.outOfStockCount} <span className="text-xs font-normal text-rose-400">Zero</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-2">
            <span>Threshold trigger:</span>
            <span className="font-medium text-slate-300">
              ≤ {organization?.defaultLowStockLevel || 5} units
            </span>
          </div>
        </div>

        {/* Retail Stock Value */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inventory Value
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">
              {currencySymbol}{metrics.totalRetailValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50 pt-2">
            <span>Cost basis:</span>
            <span className="font-medium text-slate-300">
              {currencySymbol}{metrics.totalCostValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>

      {/* FR-6 Dedicated Section: Low Stock Items Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Low Stock Items Table (FR-6)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Items at or below safety threshold (≤ {organization?.defaultLowStockLevel || 5} units).
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 self-start sm:self-auto">
            {lowStockAlerts.length + outOfStockAlerts.length} Action Needed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/40">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-right">Quantity on Hand</th>
                <th className="py-2.5 px-3 text-right">Low Stock Threshold</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-xs">
              {[...outOfStockAlerts, ...lowStockAlerts].map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-indigo-400">
                    {item.sku}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                    item.quantity <= 0 ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {item.quantity} units
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {item.lowStockLevel} units
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded ${
                      item.quantity <= 0 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.quantity <= 0 ? 'Depleted' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onOpenAdjustStock(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-500/30"
                    >
                      + Restock
                    </button>
                  </td>
                </tr>
              ))}

              {lowStockAlerts.length === 0 && outOfStockAlerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    ✅ All inventory levels are healthy! No items currently at or below low stock threshold.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown (1 col) */}
        <div className="lg:col-span-1 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              Category Breakdown
            </h3>
            <span className="text-xs text-slate-400">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((cat) => {
              const totalVal = metrics.totalRetailValuation > 0 ? metrics.totalRetailValuation : 1;
              const pct = Math.min(100, Math.round((cat.totalValue / totalVal) * 100));
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{cat.category}</span>
                    <span className="text-slate-400">
                      {currencySymbol}{cat.totalValue.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{cat.count} SKUs</span>
                    <span>{cat.units} units</span>
                  </div>
                </div>
              );
            })}

            {categoryBreakdown.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                No products found in catalog. Add your first item!
              </p>
            )}
          </div>
        </div>

        {/* Recent Inventory Movements Ledger (2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Recent Inventory Transactions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of receipts, orders, and count adjustments.
              </p>
            </div>
            <button
              onClick={() => onNavigateToProducts()}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              All Products <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Product & SKU</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3">Balance</th>
                  <th className="py-2.5 px-3">Reason & User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-xs">
                {recentTransactions.map((tx) => {
                  const isStockIn = tx.type === 'STOCK_IN';
                  const isStockOut = tx.type === 'STOCK_OUT';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-200 truncate max-w-[160px]">
                          {tx.productName}
                        </div>
                        <span className="text-[11px] font-mono text-indigo-400">
                          {tx.sku}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                          isStockIn 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : isStockOut 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {isStockIn ? <ArrowDownRight className="w-3 h-3 text-emerald-400" /> : isStockOut ? <ArrowUpRight className="w-3 h-3 text-amber-400" /> : <ArrowLeftRight className="w-3 h-3 text-blue-400" />}
                          {isStockIn ? 'Stock In' : isStockOut ? 'Stock Out' : 'Adjust'}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        isStockIn ? 'text-emerald-400' : isStockOut ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        {isStockIn ? `+${tx.quantityChanged}` : isStockOut ? `-${tx.quantityChanged}` : tx.quantityChanged}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono whitespace-nowrap">
                        {tx.previousQuantity} → <span className="font-bold text-white">{tx.newQuantity}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-[200px] truncate">
                        <span className="text-slate-300 block truncate">{tx.reason}</span>
                        <span className="text-[10px] text-slate-500">by {tx.userName}</span>
                      </td>
                    </tr>
                  );
                })}

                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No stock movements recorded yet. Perform a stock in/out to generate audit transactions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

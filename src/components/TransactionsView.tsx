import React, { useState } from 'react';
import { 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Search, 
  Filter, 
  ShieldCheck, 
  Boxes 
} from 'lucide-react';
import { InventoryTransaction } from '../types';

interface TransactionsViewProps {
  transactions: InventoryTransaction[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.productName.toLowerCase().includes(q) ||
        t.sku.toLowerCase().includes(q) ||
        t.reason.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalInbound = transactions
    .filter(t => t.type === 'STOCK_IN')
    .reduce((acc, t) => acc + t.quantityChanged, 0);

  const totalOutbound = transactions
    .filter(t => t.type === 'STOCK_OUT')
    .reduce((acc, t) => acc + t.quantityChanged, 0);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Inventory Movement Audit Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable double-entry log of all warehouse receipts, dispatches, and cycle-count reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Total Received:</span>
            <span className="font-bold text-emerald-400 font-mono">+{totalInbound}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Total Dispatched:</span>
            <span className="font-bold text-amber-400 font-mono">-{totalOutbound}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU, item name, or audit note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'STOCK_IN', label: '📥 Stock In' },
            { id: 'STOCK_OUT', label: '📤 Stock Out' },
            { id: 'ADJUSTMENT', label: '⚖️ Audit Sets' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id)}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                filterType === pill.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/40">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Qty Delta</th>
                <th className="py-3 px-3">Quantity Shift</th>
                <th className="py-3 px-4">Audit Note & Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-xs">
              {filtered.map((tx) => {
                const isStockIn = tx.type === 'STOCK_IN';
                const isStockOut = tx.type === 'STOCK_OUT';
                return (
                  <tr key={tx.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {tx.productName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-indigo-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                        {tx.sku}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md ${
                        isStockIn 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : isStockOut 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {isStockIn ? <ArrowDownRight className="w-3.5 h-3.5" /> : isStockOut ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
                        {isStockIn ? 'Stock In' : isStockOut ? 'Stock Out' : 'Adjustment'}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                      isStockIn ? 'text-emerald-400' : isStockOut ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {isStockIn ? `+${tx.quantityChanged}` : isStockOut ? `-${tx.quantityChanged}` : tx.quantityChanged}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {tx.previousQuantity} → <span className="font-bold text-white">{tx.newQuantity} units</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-medium text-slate-200">{tx.reason}</div>
                      <div className="text-[10px] text-slate-500">Operator: {tx.userName}</div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No transactions match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowLeftRight, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowUpDown,
  Tag,
  MapPin,
  ExternalLink,
  Minus
} from 'lucide-react';
import { Product } from '../types';
import { checkStockStatus, calculateProfitMargin } from '../utils/inventoryCalculations';

interface ProductsViewProps {
  products: Product[];
  categories: string[];
  currencySymbol: string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  stockFilter: string;
  onStockFilterChange: (filter: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onOpenAdjustModal: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onQuickStockNudge?: (product: Product, delta: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  currencySymbol,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
  sortBy,
  onSortByChange,
  onOpenAddModal,
  onOpenEditModal,
  onOpenAdjustModal,
  onDeleteProduct,
  onQuickStockNudge,
}) => {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const handleCopySku = (sku: string) => {
    navigator.clipboard?.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1500);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Product Inventory Catalog</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-tenant SKUs, pricing, stock thresholds, and physical warehouse bin locations.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Search Products by Name or SKU"
              placeholder="Search products by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 text-xs sm:text-sm text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 px-3 py-2 rounded-lg text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter by Category"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 px-3 py-2 rounded-lg text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Sort Products"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="name" className="bg-slate-900">Sort: Name (A-Z)</option>
                <option value="quantity" className="bg-slate-900">Sort: Highest Stock</option>
                <option value="price" className="bg-slate-900">Sort: Price (High-Low)</option>
                <option value="value" className="bg-slate-900">Sort: Total Valuation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Status:</span>
          {[
            { id: 'all', label: 'All Stock' },
            { id: 'lowStock', label: '⚠️ Low Stock' },
            { id: 'outOfStock', label: '⛔ Out of Stock' },
            { id: 'inStock', label: '✅ Healthy Stock' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => onStockFilterChange(pill.id)}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                stockFilter === pill.id
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {pill.label}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-auto hidden sm:inline">
            Showing {products.length} items
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/40">
                <th className="py-3 px-4">Product Info & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Cost Price</th>
                <th className="py-3 px-3">Selling Price</th>
                <th className="py-3 px-3">Margin</th>
                <th className="py-3 px-3">Total Value</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-xs">
              {products.map((product) => {
                const status = checkStockStatus(product.quantity, product.lowStockLevel);
                const margin = calculateProfitMargin(product.costPrice, product.sellingPrice);
                const totalVal = product.quantity * product.sellingPrice;
                const isCopied = copiedSku === product.sku;

                return (
                  <tr key={product.id} className="hover:bg-slate-700/25 transition-colors">
                    
                    {/* Product Name, SKU & Location */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-sm">
                        {product.name}
                      </div>
                      {product.description && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleCopySku(product.sku)}
                          title="Click to copy SKU"
                          className="inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900/80 text-indigo-400 border border-slate-700 hover:border-indigo-500 transition-colors"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                          {product.sku}
                        </button>
                        {product.location && (
                          <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {product.location}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-700/50 text-slate-300 border border-slate-600/40">
                        {product.category}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-sm font-mono font-bold ${
                            status === 'OUT_OF_STOCK' ? 'text-rose-400' : status === 'LOW_STOCK' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {product.quantity}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            (min: {product.lowStockLevel})
                          </span>
                        </div>

                        {onQuickStockNudge && (
                          <div className="flex items-center gap-0.5 bg-slate-900/90 rounded-md border border-slate-700/80 p-0.5 shadow-xs">
                            <button
                              onClick={() => onQuickStockNudge(product, -1)}
                              disabled={product.quantity <= 0}
                              title="Quick dispatch: -1 unit (FR-5 inline)"
                              aria-label={`Reduce stock for ${product.name} by 1`}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => onQuickStockNudge(product, 1)}
                              title="Quick receive: +1 unit (FR-5 inline)"
                              aria-label={`Increase stock for ${product.name} by 1`}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Cost Price */}
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {currencySymbol}{product.costPrice.toFixed(2)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3 px-3 font-mono font-semibold text-white whitespace-nowrap">
                      {currencySymbol}{product.sellingPrice.toFixed(2)}
                    </td>

                    {/* Margin */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`font-mono text-[11px] font-semibold ${
                        margin > 30 ? 'text-emerald-400' : margin > 10 ? 'text-cyan-400' : 'text-amber-400'
                      }`}>
                        +{margin}%
                      </span>
                    </td>

                    {/* Total Value */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-200 whitespace-nowrap">
                      {currencySymbol}{totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {status === 'OUT_OF_STOCK' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      ) : status === 'LOW_STOCK' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenAdjustModal(product)}
                          title="Record Stock In / Stock Out"
                          className="px-2 py-1 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/30 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                          <span>Adjust</span>
                        </button>
                        
                        <button
                          onClick={() => onOpenEditModal(product)}
                          title="Edit Product Details"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => onDeleteProduct(product)}
                          title="Delete Product"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-white">No matching products found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search query, clear filters, or add a new SKU to this organization.
                      </p>
                      <button
                        onClick={onOpenAddModal}
                        className="mt-2 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition-colors"
                      >
                        + Create Product
                      </button>
                    </div>
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

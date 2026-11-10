import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  ArrowLeftRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle, 
  Trash2, 
  Check, 
  DollarSign, 
  Tag, 
  Hash, 
  MapPin 
} from 'lucide-react';
import { Product } from '../types';
import { validateSkuFormat } from '../utils/inventoryCalculations';

// --- ADD PRODUCT MODAL ---
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  categories: string[];
  currencySymbol: string;
  defaultLowStock: number;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  currencySymbol,
  defaultLowStock,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(categories[0] || 'General');
  const [newCategory, setNewCategory] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [costPrice, setCostPrice] = useState('20.00');
  const [sellingPrice, setSellingPrice] = useState('45.00');
  const [lowStockLevel, setLowStockLevel] = useState(defaultLowStock.toString());
  const [location, setLocation] = useState('Aisle 1, Bin A1');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    const skuCheck = validateSkuFormat(sku);
    if (!skuCheck.valid) {
      setError(skuCheck.reason || 'Invalid SKU format');
      return;
    }

    const finalCategory = newCategory.trim() ? newCategory.trim() : category;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        category: finalCategory,
        quantity: parseInt(quantity, 10) || 0,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        lowStockLevel: parseInt(lowStockLevel, 10) || defaultLowStock,
        location: location.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Inventory SKU</h3>
              <p className="text-xs text-slate-400">Scoped exclusively to your active organization tenant.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ergonomic Office Chair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock Keeping Unit (SKU) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CHR-ERG-01"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Unique barcode identifier</span>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
                <option value="NEW" className="bg-slate-900">+ Add New Category...</option>
              </select>
              {category === 'NEW' && (
                <input
                  type="text"
                  placeholder="Type new category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1.5 w-full bg-slate-800/80 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                />
              )}
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cost Price ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">COGS / Supplier cost</span>
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Selling Price ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Customer retail price</span>
            </div>

            {/* Initial Stock Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Initial Stock Intake
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Low Stock Warning Threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={lowStockLevel}
                onChange={(e) => setLowStockLevel(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Warehouse Bin / Location (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Aisle 3, Shelf B, Bin 4"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Description (Optional - FR-3) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Description (Optional - FR-3)
              </label>
              <textarea
                rows={2}
                placeholder="Item specifications, model notes, details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving SKU...' : 'Create SKU'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

// --- EDIT PRODUCT MODAL ---
interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Product>) => Promise<void>;
  currencySymbol: string;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
  currencySymbol,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [lowStockLevel, setLowStockLevel] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setDescription(product.description || '');
      setCategory(product.category);
      setCostPrice(product.costPrice.toString());
      setSellingPrice(product.sellingPrice.toString());
      setLowStockLevel(product.lowStockLevel.toString());
      setLocation(product.location || '');
      setError(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const skuCheck = validateSkuFormat(sku);
    if (!skuCheck.valid) {
      setError(skuCheck.reason || 'Invalid SKU format');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(product.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        category: category.trim(),
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        lowStockLevel: parseInt(lowStockLevel, 10) || 5,
        location: location.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Edit Product</h3>
            <p className="text-xs text-slate-400">Current stock: {product.quantity} units (use Stock Movement to adjust)</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SKU</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cost ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Retail ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Low Stock Limit</label>
                <input
                  type="number"
                  required
                  value={lowStockLevel}
                  onChange={(e) => setLowStockLevel(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Bin</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional - FR-3)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product specs, notes, description..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- STOCK ADJUSTMENT MODAL (Stock In / Stock Out / Audit) ---
interface AdjustStockModalProps {
  product: Product | null;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productId: string, movement: { type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'; amount: number; reason: string }) => Promise<void>;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  product,
  products,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [movementType, setMovementType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'>('STOCK_IN');
  const [amount, setAmount] = useState('10');
  const [reason, setReason] = useState('Vendor shipment receipt');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedProductId(product.id);
    } else if (products.length > 0) {
      setSelectedProductId(products[0].id);
    }
    setError(null);
  }, [product, products, isOpen]);

  // Adjust default reason based on movement type
  useEffect(() => {
    if (movementType === 'STOCK_IN') {
      setReason('Vendor shipment receipt / PO fulfillment');
    } else if (movementType === 'STOCK_OUT') {
      setReason('Customer order shipment / Outbound sale');
    } else {
      setReason('Physical warehouse cycle-count reconciliation');
    }
  }, [movementType]);

  if (!isOpen) return null;

  const activeProduct = products.find(p => p.id === selectedProductId) || product;
  const currentQty = activeProduct?.quantity ?? 0;
  const parsedAmt = parseInt(amount, 10) || 0;

  let calculatedNewQty = currentQty;
  if (movementType === 'STOCK_IN') {
    calculatedNewQty = currentQty + parsedAmt;
  } else if (movementType === 'STOCK_OUT') {
    calculatedNewQty = currentQty - parsedAmt;
  } else if (movementType === 'ADJUSTMENT') {
    calculatedNewQty = parsedAmt;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }

    if (parsedAmt <= 0 && movementType !== 'ADJUSTMENT') {
      setError('Movement quantity must be greater than zero');
      return;
    }

    if (movementType === 'STOCK_OUT' && parsedAmt > currentQty) {
      setError(`Cannot deduct ${parsedAmt} units when only ${currentQty} are available on hand.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedProductId, {
        type: movementType,
        amount: parsedAmt,
        reason: reason.trim() || 'Inventory movement',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply stock movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Stock Movement</h3>
              <p className="text-xs text-slate-400">Updates inventory count and writes audit transaction ledger.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Product SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name} [{p.sku}] • Stock: {p.quantity}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Movement Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('STOCK_IN')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                  movementType === 'STOCK_IN'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                <span>Stock In (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('STOCK_OUT')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                  movementType === 'STOCK_OUT'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>Stock Out (-)</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('ADJUSTMENT')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                  movementType === 'ADJUSTMENT'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                <span>Audit (Set)</span>
              </button>
            </div>
          </div>

          {/* Quantity Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {movementType === 'ADJUSTMENT' ? 'New Exact Count' : 'Quantity Units'}
            </label>
            <input
              type="number"
              min={movementType === 'ADJUSTMENT' ? '0' : '1'}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Real-time Calculation Preview */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Projected Balance:</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">{currentQty}</span>
              <span className="text-slate-500">→</span>
              <span className={`font-bold ${
                calculatedNewQty < 0 ? 'text-rose-400' : calculatedNewQty <= (activeProduct?.lowStockLevel ?? 5) ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {calculatedNewQty} units
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Audit Note / Reason
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Supplier PO #4092 or Damaged box"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || calculatedNewQty < 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Ledger...' : 'Commit Movement'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

// --- DELETE CONFIRMATION MODAL ---
interface DeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm overflow-hidden p-6 space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-white">Delete Product SKU?</h3>
          <p className="text-xs text-slate-400">
            Are you sure you want to permanently remove <span className="font-semibold text-white">"{product.name}"</span> ({product.sku}) from this organization?
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

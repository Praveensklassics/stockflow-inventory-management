import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  Sliders, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Database
} from 'lucide-react';
import { Organization } from '../types';

interface SettingsViewProps {
  organization: Organization | null;
  onUpdateSettings: (settings: Partial<Organization>) => Promise<void>;
  onResetSeed: () => void;
  isResetting: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  organization,
  onUpdateSettings,
  onResetSeed,
  isResetting,
}) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [defaultLowStockLevel, setDefaultLowStockLevel] = useState('5');
  const [taxRate, setTaxRate] = useState('8.5');
  const [industry, setIndustry] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setCurrency(organization.currency);
      setDefaultLowStockLevel(organization.defaultLowStockLevel.toString());
      setTaxRate(organization.taxRate.toString());
      setIndustry(organization.industry || '');
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onUpdateSettings({
        name: name.trim(),
        currency,
        defaultLowStockLevel: parseInt(defaultLowStockLevel, 10) || 5,
        taxRate: parseFloat(taxRate) || 0,
        industry: industry.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Organization & Warehouse Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure business profile, inventory low-stock thresholds, and multi-tenant parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Organization settings updated successfully and persisted to database.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 space-y-5">
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Company & Tenant Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Consumer Electronics or Groceries"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Operating Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Inventory Reorder Thresholds
          </h3>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default Low Stock Warning Level
            </label>
            <input
              type="number"
              min="1"
              required
              value={defaultLowStockLevel}
              onChange={(e) => setDefaultLowStockLevel(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Triggers dashboard warnings when available inventory reaches or drops below this count.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Tenant ID: <span className="font-mono text-indigo-400 font-bold">{organization?.id}</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>

      {/* Database Reset & Multi-Tenant Diagnostics */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          Developer & Demo Seed Control
        </h3>
        <p className="text-xs text-slate-400">
          Restore initial pristine multi-tenant seed records across Apex Electronics, GreenLeaf Organics, and Velvet Atelier.
        </p>

        <button
          onClick={onResetSeed}
          disabled={isResetting}
          className="px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting Database...' : 'Restore Factory Demo Data'}</span>
        </button>
      </div>

    </div>
  );
};

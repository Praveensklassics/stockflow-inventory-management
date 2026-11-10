import React from 'react';
import { 
  Boxes, 
  Layers, 
  BookOpen, 
  Code2, 
  Terminal, 
  Building2, 
  RefreshCw, 
  Download, 
  CheckCircle2,
  DollarSign,
  LogOut,
  FileCheck,
  User as UserIcon
} from 'lucide-react';
import { Organization, User } from '../types';

interface HeaderProps {
  currentOrg: Organization | null;
  currentUser: User | null;
  organizations: (Organization & { productCount: number })[];
  onSelectOrg: (orgId: string) => void;
  activeTab: 'app' | 'masterclass' | 'code' | 'api';
  onSelectTab: (tab: 'app' | 'masterclass' | 'code' | 'api') => void;
  currency: string;
  onChangeCurrency: (c: string) => void;
  onResetSeed: () => void;
  onExportCsv: () => void;
  onLogout: () => void;
  onOpenAssessment: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentOrg,
  currentUser,
  organizations,
  onSelectOrg,
  activeTab,
  onSelectTab,
  currency,
  onChangeCurrency,
  onResetSeed,
  onExportCsv,
  onLogout,
  onOpenAssessment,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner with System & Tenant Context */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Boxes className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">StockFlow</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  6-Hr MVP v0.1
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Express :3000
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                SaaS Inventory Management System • Scope-Reduced MVP
              </p>
            </div>
          </div>

          {/* Right Controls: Tenant Switcher, Currency, Assessment, Seed & Logout */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Multi-tenant Switcher (FR-2) */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="text-xs">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold leading-none mb-0.5">
                  Tenant Org
                </span>
                <select
                  aria-label="Select Organization Tenant"
                  value={currentOrg?.id || ''}
                  onChange={(e) => onSelectOrg(e.target.value)}
                  className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-2"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-slate-900 text-white">
                      {org.name} ({org.productCount || 0} SKUs)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 px-2 py-1.5 rounded-lg border border-slate-700">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="USD" className="bg-slate-900">USD ($)</option>
                <option value="EUR" className="bg-slate-900">EUR (€)</option>
                <option value="GBP" className="bg-slate-900">GBP (£)</option>
                <option value="INR" className="bg-slate-900">INR (₹)</option>
              </select>
            </div>

            {/* Assessment Guide Button */}
            <button
              onClick={onOpenAssessment}
              title="Open Technical Assessment Submission Checklist"
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Assessment Guide</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={onExportCsv}
              title="Download CSV for current organization"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Reset / Seed Demo Data */}
            <button
              onClick={onResetSeed}
              disabled={isResetting}
              title="Reset database to initial multi-tenant seed"
              className="px-2 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>

            {/* User Session & Logout (FR-1) */}
            <button
              onClick={onLogout}
              title="Sign out of current organization account"
              className="px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSelectTab('app')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'app'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Live Inventory App
          </button>

          <button
            onClick={() => onSelectTab('masterclass')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'masterclass'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            6-Hour PRD & Interview Prep
          </button>

          <button
            onClick={() => onSelectTab('code')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Source Code Explorer (18 Files)
          </button>

          <button
            onClick={() => onSelectTab('api')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'api'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            REST API Sandbox
          </button>
        </div>
      </div>
    </header>
  );
};

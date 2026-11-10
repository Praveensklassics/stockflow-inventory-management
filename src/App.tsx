import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { TransactionsView } from './components/TransactionsView';
import { SettingsView } from './components/SettingsView';
import { MasterclassView } from './components/MasterclassView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { ApiSandboxView } from './components/ApiSandboxView';
import { AuthView } from './components/AuthView';
import { TechnicalAssessmentModal } from './components/TechnicalAssessmentModal';
import { 
  AddProductModal, 
  EditProductModal, 
  AdjustStockModal, 
  DeleteModal 
} from './components/Modals';
import { 
  getOrganizations, 
  getDashboard, 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  adjustStock, 
  getTransactions, 
  updateSettings, 
  seedDatabase,
  API_BASE
} from './api';
import { Organization, User, Product, InventoryTransaction, DashboardMetrics, CategoryBreakdown } from './types';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Settings, 
  Plus, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function App() {
  // Authentication State (FR-1)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-1',
    name: 'Alex Mercer (Apex Admin)',
    email: 'alex@apexelectronics.io',
    role: 'ADMIN',
    organizationId: 'org-apex',
  });

  // Top Level Navigation Tab
  const [activeTab, setActiveTab] = useState<'app' | 'masterclass' | 'code' | 'api'>('app');
  
  // App Subview (when in 'app' tab)
  const [appView, setAppView] = useState<'dashboard' | 'products' | 'transactions' | 'settings'>('dashboard');

  // Multi-Tenant State (FR-2)
  const [organizations, setOrganizations] = useState<(Organization & { productCount: number })[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>('org-apex');
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currency, setCurrency] = useState<string>('USD');

  // Dashboard Data (FR-6)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSKUs: 0,
    totalUnits: 0,
    totalCostValuation: 0,
    totalRetailValuation: 0,
    potentialProfit: 0,
    averageMargin: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<Product[]>([]);
  const [outOfStockAlerts, setOutOfStockAlerts] = useState<Product[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<InventoryTransaction[]>([]);

  // Products Data & Filters (FR-3, FR-4)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Transactions Data (FR-5)
  const [allTransactions, setAllTransactions] = useState<InventoryTransaction[]>([]);

  // Modals State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  // Status & Feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Currency Symbol helper
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';

  // 1. Initial Load: Organizations
  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await getOrganizations();
        setOrganizations(res.organizations);
        if (res.organizations.length > 0 && !currentOrg) {
          const defaultOrg = res.organizations[0];
          setCurrentOrgId(defaultOrg.id);
          setCurrentOrg(defaultOrg);
          setCurrency(defaultOrg.currency || 'USD');
        }
      } catch (err) {
        console.error('Failed to load organizations:', err);
      }
    }
    loadOrgs();
  }, []);

  // 2. Fetch Tenant Data on Org Change or Mutation
  const refreshTenantData = useCallback(async () => {
    if (!currentOrgId || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const [dash, prodData, txData, orgList] = await Promise.all([
        getDashboard(currentOrgId),
        getProducts(currentOrgId, {
          search: searchTerm,
          category: selectedCategory,
          filter: stockFilter,
          sortBy,
        }),
        getTransactions(currentOrgId),
        getOrganizations(),
      ]);

      setCurrentOrg(dash.organization);
      setCurrency(dash.organization.currency || 'USD');
      setMetrics(dash.metrics);
      setCategoryBreakdown(dash.categoryBreakdown);
      setLowStockAlerts(dash.lowStockAlerts);
      setOutOfStockAlerts(dash.outOfStockAlerts);
      setRecentTransactions(dash.recentTransactions);

      setProducts(prodData.products);
      setCategories(prodData.categories);
      setAllTransactions(txData.transactions);
      setOrganizations(orgList.organizations);
    } catch (err: any) {
      console.error('Error refreshing tenant data:', err);
      showToast(err.message || 'Failed to sync with backend', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrgId, isAuthenticated, searchTerm, selectedCategory, stockFilter, sortBy]);

  useEffect(() => {
    refreshTenantData();
  }, [refreshTenantData]);

  // Handle Authentication Success (FR-1 & FR-2)
  const handleAuthSuccess = (session: { token: string; user: User; organization: Organization }) => {
    setIsAuthenticated(true);
    setCurrentUser(session.user);
    setCurrentOrg(session.organization);
    setCurrentOrgId(session.organization.id);
    setCurrency(session.organization.currency || 'USD');
    showToast(`Welcome, ${session.user.name}! Logged into ${session.organization.name}`);
    setActiveTab('app');
    setAppView('dashboard');
  };

  // Handle Org Switch
  const handleSelectOrg = (orgId: string) => {
    setCurrentOrgId(orgId);
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      setCurrency(org.currency);
      showToast(`Switched active tenant to: ${org.name}`);
    }
  };

  // Product Actions
  const handleCreateProduct = async (data: Partial<Product>) => {
    const res = await createProduct(currentOrgId, data);
    showToast(res.message);
    await refreshTenantData();
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    const res = await updateProduct(currentOrgId, id, data);
    showToast(res.message);
    await refreshTenantData();
  };

  const handleDeleteProduct = async () => {
    if (!targetProduct) return;
    const res = await deleteProduct(currentOrgId, targetProduct.id);
    showToast(res.message);
    setTargetProduct(null);
    await refreshTenantData();
  };

  const handleAdjustStock = async (productId: string, movement: { type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'; amount: number; reason: string }) => {
    const res = await adjustStock(currentOrgId, productId, movement);
    showToast(res.message);
    await refreshTenantData();
  };

  const handleQuickStockNudge = async (product: Product, delta: number) => {
    if (product.quantity + delta < 0) {
      showToast('Cannot reduce stock below zero', 'error');
      return;
    }
    const type = delta > 0 ? 'STOCK_IN' : 'STOCK_OUT';
    const amount = Math.abs(delta);
    const reason = delta > 0 ? `Quick stock intake (+${amount} unit)` : `Quick stock dispatch (-${amount} unit)`;
    try {
      const res = await adjustStock(currentOrgId, product.id, { type, amount, reason });
      showToast(res.message);
      await refreshTenantData();
    } catch (err: any) {
      showToast(err.message || 'Quick adjustment failed', 'error');
    }
  };

  const handleUpdateSettings = async (settings: Partial<Organization>) => {
    const res = await updateSettings(currentOrgId, settings);
    showToast(res.message);
    await refreshTenantData();
  };

  const handleResetSeed = async () => {
    setIsResetting(true);
    try {
      const res = await seedDatabase();
      showToast(res.message);
      await refreshTenantData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset seed data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = `${API_BASE}/export-csv?orgId=${currentOrgId}`;
    showToast('Inventory CSV file download started');
  };

  // If unauthenticated, render FR-1 Auth Screen
  if (!isAuthenticated) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${
          toastMessage.type === 'error'
            ? 'bg-rose-900/95 text-rose-200 border border-rose-600'
            : 'bg-emerald-900/95 text-emerald-200 border border-emerald-600'
        }`}>
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentOrg={currentOrg}
        currentUser={currentUser}
        organizations={organizations}
        onSelectOrg={handleSelectOrg}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currency={currency}
        onChangeCurrency={setCurrency}
        onResetSeed={handleResetSeed}
        onExportCsv={handleExportCsv}
        onLogout={() => {
          setIsAuthenticated(false);
          showToast('Signed out successfully');
        }}
        onOpenAssessment={() => setIsAssessmentOpen(true)}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: LIVE INVENTORY APPLICATION */}
        {activeTab === 'app' && (
          <div className="space-y-6">
            
            {/* Sub-View Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAppView('dashboard')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                    appView === 'dashboard'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard (FR-6)
                </button>

                <button
                  onClick={() => setAppView('products')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                    appView === 'products'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Catalog ({products.length} SKUs) (FR-4)
                </button>

                <button
                  onClick={() => setAppView('transactions')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                    appView === 'transactions'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Audit Ledger (FR-5)
                </button>

                <button
                  onClick={() => setAppView('settings')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                    appView === 'settings'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings (FR-7)
                </button>
              </div>

              {/* Quick Actions Right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTargetProduct(null);
                    setIsAdjustOpen(true);
                  }}
                  className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg items-center gap-1.5 transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3 text-indigo-400" />
                  Adjust Stock
                </button>

                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  Add SKU
                </button>
              </div>
            </div>

            {/* Sub-View Content */}
            {appView === 'dashboard' && (
              <DashboardView
                metrics={metrics}
                categoryBreakdown={categoryBreakdown}
                lowStockAlerts={lowStockAlerts}
                outOfStockAlerts={outOfStockAlerts}
                recentTransactions={recentTransactions}
                organization={currentOrg}
                currencySymbol={currencySymbol}
                onOpenAddProduct={() => setIsAddOpen(true)}
                onOpenAdjustStock={(prod) => {
                  setTargetProduct(prod || null);
                  setIsAdjustOpen(true);
                }}
                onNavigateToProducts={(filter) => {
                  if (filter) setStockFilter(filter);
                  setAppView('products');
                }}
              />
            )}

            {appView === 'products' && (
              <ProductsView
                products={products}
                categories={categories}
                currencySymbol={currencySymbol}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                stockFilter={stockFilter}
                onStockFilterChange={setStockFilter}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                onOpenAddModal={() => setIsAddOpen(true)}
                onOpenEditModal={(prod) => {
                  setTargetProduct(prod);
                  setIsEditOpen(true);
                }}
                onOpenAdjustModal={(prod) => {
                  setTargetProduct(prod);
                  setIsAdjustOpen(true);
                }}
                onDeleteProduct={(prod) => {
                  setTargetProduct(prod);
                  setIsDeleteOpen(true);
                }}
                onQuickStockNudge={handleQuickStockNudge}
              />
            )}

            {appView === 'transactions' && (
              <TransactionsView transactions={allTransactions} />
            )}

            {appView === 'settings' && (
              <SettingsView
                organization={currentOrg}
                onUpdateSettings={handleUpdateSettings}
                onResetSeed={handleResetSeed}
                isResetting={isResetting}
              />
            )}

          </div>
        )}

        {/* TAB 2: PRD & 6-HOUR MASTERCLASS */}
        {activeTab === 'masterclass' && <MasterclassView />}

        {/* TAB 3: SOURCE CODE EXPLORER */}
        {activeTab === 'code' && <CodeExplorerView />}

        {/* TAB 4: API SANDBOX */}
        {activeTab === 'api' && <ApiSandboxView currentOrg={currentOrg} />}

      </main>

      {/* --- MODALS --- */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateProduct}
        categories={categories}
        currencySymbol={currencySymbol}
        defaultLowStock={currentOrg?.defaultLowStockLevel || 5}
      />

      <EditProductModal
        product={targetProduct}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setTargetProduct(null);
        }}
        onSubmit={handleUpdateProduct}
        currencySymbol={currencySymbol}
      />

      <AdjustStockModal
        product={targetProduct}
        products={products}
        isOpen={isAdjustOpen}
        onClose={() => {
          setIsAdjustOpen(false);
          setTargetProduct(null);
        }}
        onSubmit={handleAdjustStock}
      />

      <DeleteModal
        product={targetProduct}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setTargetProduct(null);
        }}
        onConfirm={handleDeleteProduct}
      />

      <TechnicalAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        appUrl={window.location.origin}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <p>StockFlow MVP (6-Hour Build) • PRD v0.1 • Single-Region Express :3000 • Multi-Tenant Isolation</p>
      </footer>

    </div>
  );
}

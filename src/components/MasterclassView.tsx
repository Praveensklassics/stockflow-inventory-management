import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Layers, 
  Database, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Code, 
  ChevronDown, 
  ChevronUp,
  Boxes,
  Share2
} from 'lucide-react';
import { SIX_HOUR_PLAN, INTERVIEW_QUESTIONS } from '../data/projectExplanation';

export const MasterclassView: React.FC = () => {
  const [subTab, setSubTab] = useState<'plan' | 'architecture' | 'schema' | 'interview'>('plan');
  const [expandedQA, setExpandedQA] = useState<string | null>('q1');
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({
    'h1-m0': true,
    'h1-m1': true,
    'h1-m2': true,
    'h1-m3': true,
    'h2-m0': true,
    'h2-m1': true,
    'h3-m0': true,
  });

  const toggleMilestone = (key: string) => {
    setCompletedMilestones(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            StockFlow 6-Hour PRD & Architectural Masterclass
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learn Multi-Tenant SaaS Inventory From Ground Zero
          </h1>
          <p className="text-sm text-slate-300">
            A complete senior-engineer guide covering the real-world inventory lifecycle: relational schema design, 
            tenant data isolation, race conditions prevention, atomic ledger movements, and technical interview mastery.
          </p>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setSubTab('plan')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              subTab === 'plan'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            6-Hour Hourly Plan
          </button>

          <button
            onClick={() => setSubTab('architecture')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              subTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Architecture & Data Flow
          </button>

          <button
            onClick={() => setSubTab('schema')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              subTab === 'schema'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Database Schema & Multi-Tenancy
          </button>

          <button
            onClick={() => setSubTab('interview')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              subTab === 'interview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Interview Preparation (15 Q&As)
          </button>
        </div>
      </div>

      {/* --- SUBTAB 1: 6-HOUR PLAN --- */}
      {subTab === 'plan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Hour-by-Hour Implementation Blueprint
            </h2>
            <span className="text-xs text-slate-400">
              Follow this sequence to build any production-grade SaaS in a single day
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SIX_HOUR_PLAN.map((plan) => (
              <div 
                key={plan.hour} 
                className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-4 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-extrabold flex items-center justify-center text-sm border border-indigo-500/30">
                      H{plan.hour}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{plan.title}</h3>
                      <span className="text-xs font-mono text-indigo-400">{plan.timeEstimate}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {plan.summary}
                </p>

                {/* Key Concept Box */}
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Core Mental Model
                  </span>
                  <p className="text-slate-200 text-xs">
                    {plan.keyConcept}
                  </p>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Execution Milestones:
                  </span>
                  <div className="space-y-1.5">
                    {plan.milestones.map((m, idx) => {
                      const mKey = `h${plan.hour}-m${idx}`;
                      const isDone = completedMilestones[mKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleMilestone(mKey)}
                          className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer group select-none"
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isDone 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-slate-600 group-hover:border-slate-500'
                          }`}>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className={isDone ? 'line-through text-slate-500' : 'text-slate-300'}>
                            {m}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pitfall Box */}
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-semibold text-rose-200">Watch out: </span>
                    {plan.pitfallsToAvoid}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: ARCHITECTURE & DATA FLOW --- */}
      {subTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                End-to-End Request Lifecycle & Multi-Tenancy Isolation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing how a warehouse user action flows through the React SPA, Express backend, JWT auth middleware, and database layers.
              </p>
            </div>

            {/* Interactive Dataflow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              
              {/* Step 1: User Action */}
              <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="text-xs font-bold text-white">Client Trigger (React)</h4>
                <p className="text-[11px] text-slate-400">
                  User clicks "Stock In (+20 units)" or adds a new product SKU.
                </p>
                <div className="bg-slate-800 p-2 rounded text-[10px] font-mono text-indigo-300">
                  onClick → adjustStock(sku, 20)
                </div>
              </div>

              {/* Step 2: HTTP Client */}
              <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="text-xs font-bold text-white">API Client & JWT</h4>
                <p className="text-[11px] text-slate-400">
                  Fetches token from storage, signs headers with Authorization: Bearer.
                </p>
                <div className="bg-slate-800 p-2 rounded text-[10px] font-mono text-cyan-300">
                  POST /api/products/:id/adjust
                  Authorization: Bearer org-apex
                </div>
              </div>

              {/* Step 3: Auth Middleware */}
              <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="text-xs font-bold text-emerald-300">Auth Gatekeeper</h4>
                <p className="text-[11px] text-slate-400">
                  Verifies token, extracts verified organizationId, binds to req.user.
                </p>
                <div className="bg-slate-800 p-2 rounded text-[10px] font-mono text-emerald-300">
                  req.organizationId = "org-apex"
                </div>
              </div>

              {/* Step 4: Tenant Filtered Query */}
              <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                  4
                </div>
                <h4 className="text-xs font-bold text-white">Isolated DB Query</h4>
                <p className="text-[11px] text-slate-400">
                  Enforces tenant isolation: updates product AND appends audit transaction.
                </p>
                <div className="bg-slate-800 p-2 rounded text-[10px] font-mono text-amber-300">
                  WHERE id = :id AND orgId = req.orgId
                </div>
              </div>

              {/* Step 5: JSON Response */}
              <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                  5
                </div>
                <h4 className="text-xs font-bold text-white">Client UI Update</h4>
                <p className="text-[11px] text-slate-400">
                  React state updates optimistically; table and KPI cards refresh instantly.
                </p>
                <div className="bg-slate-800 p-2 rounded text-[10px] font-mono text-emerald-300">
                  status: 200 OK
                  newQuantity: 38
                </div>
              </div>

            </div>

            {/* Why Multi-Tenancy Matters */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                The Core Principle: Why Tenant A Never Sees Tenant B's Data
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                In a SaaS application, all tenants share the same server and database. If an engineer accidentally writes:
                <code className="text-rose-400 bg-slate-800 px-1.5 py-0.5 rounded mx-1 font-mono">SELECT * FROM Product WHERE id = :id</code>
                without scoping to <code className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded mx-1 font-mono">WHERE organizationId = req.user.organizationId</code>,
                a malicious user from Apex Electronics could view or delete products belonging to GreenLeaf Organics!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <span className="font-bold block mb-1">❌ Fatal Security Flaw:</span>
                  <code className="font-mono text-[11px] text-rose-200">
                    prisma.product.findUnique(&#123; where: &#123; id &#125; &#125;)
                  </code>
                  <p className="text-[11px] mt-1 text-slate-400">Allows any authenticated user to fetch any other company's inventory by guessing the ID.</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="font-bold block mb-1">✅ Tenant-Safe Implementation:</span>
                  <code className="font-mono text-[11px] text-emerald-200">
                    prisma.product.findFirst(&#123; where: &#123; id, organizationId: req.organizationId &#125; &#125;)
                  </code>
                  <p className="text-[11px] mt-1 text-slate-400">Guarantees query will return null if the product does not belong to the caller's organization.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SUBTAB 3: DATABASE SCHEMA --- */}
      {subTab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Entity-Relationship (ER) Architecture
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                The 4 relational tables powering StockFlow. Designed to run on SQLite locally and scale to PostgreSQL or MySQL.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Table 1: Organization */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-indigo-950/60 px-4 py-2.5 border-b border-indigo-900/60 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-300">Table: Organization</span>
                  <span className="text-[10px] text-slate-400 font-mono">Tenant Root</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-indigo-400 font-bold">
                    <span>id (PK)</span>
                    <span className="text-slate-500">UUID / String</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>name</span>
                    <span className="text-slate-500">String</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>currency</span>
                    <span className="text-slate-500">USD, EUR, GBP, INR</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>defaultLowStockLevel</span>
                    <span className="text-slate-500">Int (default 5)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>taxRate</span>
                    <span className="text-slate-500">Float</span>
                  </div>
                </div>
              </div>

              {/* Table 2: User */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-indigo-950/60 px-4 py-2.5 border-b border-indigo-900/60 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-300">Table: User</span>
                  <span className="text-[10px] text-slate-400 font-mono">Auth & RBAC</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-indigo-400 font-bold">
                    <span>id (PK)</span>
                    <span className="text-slate-500">UUID / String</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>organizationId (FK)</span>
                    <span className="text-slate-500">→ Organization.id</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>email (UNIQUE)</span>
                    <span className="text-slate-500">String</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>passwordHash</span>
                    <span className="text-slate-500">bcrypt hash</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>role</span>
                    <span className="text-slate-500">ADMIN, MANAGER, STAFF</span>
                  </div>
                </div>
              </div>

              {/* Table 3: Product */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-indigo-950/60 px-4 py-2.5 border-b border-indigo-900/60 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-300">Table: Product</span>
                  <span className="text-[10px] text-slate-400 font-mono">Catalog Items</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-indigo-400 font-bold">
                    <span>id (PK)</span>
                    <span className="text-slate-500">UUID / String</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>organizationId (FK)</span>
                    <span className="text-slate-500">→ Organization.id</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>sku [INDEX]</span>
                    <span className="text-slate-500">UNIQUE(orgId, sku)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>name</span>
                    <span className="text-slate-500">String</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>quantity</span>
                    <span className="text-slate-500">Int (≥ 0)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>costPrice / sellingPrice</span>
                    <span className="text-slate-500">Float</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>lowStockLevel</span>
                    <span className="text-slate-500">Int (reorder trigger)</span>
                  </div>
                </div>
              </div>

              {/* Table 4: Transaction */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-indigo-950/60 px-4 py-2.5 border-b border-indigo-900/60 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-300">Table: Transaction</span>
                  <span className="text-[10px] text-slate-400 font-mono">Immutable Audit Ledger</span>
                </div>
                <div className="p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-indigo-400 font-bold">
                    <span>id (PK)</span>
                    <span className="text-slate-500">UUID / String</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>organizationId (FK)</span>
                    <span className="text-slate-500">→ Organization.id</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>productId (FK)</span>
                    <span className="text-slate-500">→ Product.id</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>type</span>
                    <span className="text-slate-500">STOCK_IN / STOCK_OUT / ADJUST</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>previousQty → newQty</span>
                    <span className="text-slate-500">Balance tracking</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>reason & userName</span>
                    <span className="text-slate-500">Audit trail details</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- SUBTAB 4: INTERVIEW PREP --- */}
      {subTab === 'interview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              SaaS Inventory Technical Interview Masterclass
            </h2>
            <span className="text-xs text-slate-400">
              Top questions interviewers ask about supply chain and SaaS backends
            </span>
          </div>

          <div className="space-y-3">
            {INTERVIEW_QUESTIONS.map((qa) => {
              const isOpen = expandedQA === qa.id;
              return (
                <div
                  key={qa.id}
                  className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedQA(isOpen ? null : qa.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-700/20"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
                        {qa.category}
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        {qa.question}
                      </h3>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 space-y-3 text-xs text-slate-300 border-t border-slate-700/40">
                      <p className="leading-relaxed text-slate-200">
                        {qa.answer}
                      </p>

                      {qa.codeSnippet && (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-x-auto">
                          <pre className="text-[11px] font-mono text-cyan-300 whitespace-pre">
                            {qa.codeSnippet}
                          </pre>
                        </div>
                      )}

                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-emerald-200">Senior Engineer Interview Tip: </span>
                          {qa.proTip}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

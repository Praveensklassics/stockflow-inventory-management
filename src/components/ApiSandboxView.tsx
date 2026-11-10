import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Code
} from 'lucide-react';
import { Organization } from '../types';

interface ApiSandboxViewProps {
  currentOrg: Organization | null;
}

interface EndpointConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultBody?: string;
  defaultParams?: string;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    method: 'GET',
    path: '/api/dashboard',
    description: 'Fetch real-time inventory KPIs, valuations, warnings, and distribution for current tenant.',
  },
  {
    method: 'GET',
    path: '/api/products',
    description: 'List all products for the tenant with optional search, category and stock status filters.',
    defaultParams: 'filter=lowStock',
  },
  {
    method: 'GET',
    path: '/api/transactions',
    description: 'Fetch immutable stock movement audit ledger for current organization.',
    defaultParams: 'limit=10',
  },
  {
    method: 'POST',
    path: '/api/products',
    description: 'Create a new product SKU in this tenant catalog.',
    defaultBody: JSON.stringify({
      name: 'USB-C Fast Charger 65W',
      sku: 'APX-CHG-65W',
      category: 'Accessories',
      quantity: 50,
      costPrice: 14.50,
      sellingPrice: 39.99,
      lowStockLevel: 10,
      location: 'Aisle 2, Bin D1'
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/auth/organizations',
    description: 'List all multi-tenant organizations in the database.',
  },
  {
    method: 'GET',
    path: '/api/settings',
    description: 'Retrieve current organization profile, default low stock threshold, and tax rate.',
  },
];

export const ApiSandboxView: React.FC<ApiSandboxViewProps> = ({ currentOrg }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [params, setParams] = useState(selectedEndpoint.defaultParams || '');
  const [requestBody, setRequestBody] = useState(selectedEndpoint.defaultBody || '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setParams(ep.defaultParams || '');
    setRequestBody(ep.defaultBody || '');
    setResponseStatus(null);
    setResponseJson(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const url = `${selectedEndpoint.path}${params ? `?${params}` : ''}`;
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-Id': currentOrg?.id || 'org-apex',
          'Authorization': `Bearer ${currentOrg?.id || 'org-apex'}`,
        },
      };

      if (selectedEndpoint.method !== 'GET' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - start);
      setResponseStatus(res.status);
      setResponseTime(elapsed);

      const data = await res.json().catch(() => ({}));
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseJson(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const curlCommand = `curl -X ${selectedEndpoint.method} "http://localhost:3000${selectedEndpoint.path}${params ? `?${params}` : ''}" \\
  -H "Content-Type: application/json" \\
  -H "X-Organization-Id: ${currentOrg?.id || 'org-apex'}" \\
  -H "Authorization: Bearer ${currentOrg?.id || 'org-apex'}"${
    selectedEndpoint.method !== 'GET' && requestBody.trim() ? ` \\\n  -d '${requestBody.replace(/\n/g, '')}'` : ''
  }`;

  const copyCurl = () => {
    navigator.clipboard?.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Express REST API Sandbox
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Express Node.js Server
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch live HTTP requests directly against your running Node.js server. Inspect headers, response payloads, and copyable curl scripts.
          </p>
        </div>

        <button
          onClick={handleExecute}
          disabled={isLoading}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isLoading ? 'Executing...' : 'Execute Request'}</span>
        </button>
      </div>

      {/* Main Grid: Endpoint List & Execution Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Endpoints Catalog (4 cols) */}
        <div className="lg:col-span-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block px-2 pb-2 border-b border-slate-700/60">
            Available Endpoints
          </span>

          <div className="space-y-1.5">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-700/30 text-slate-300 border border-transparent'
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {ep.method}
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-mono font-semibold block truncate">
                      {ep.path}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {ep.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Request Composer & Live Response (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Request Header Bar */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                selectedEndpoint.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {selectedEndpoint.method}
              </span>
              <span className="text-sm font-mono text-white flex-1 font-semibold">
                {selectedEndpoint.path}
              </span>
            </div>

            {/* Query Parameters Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Query Parameters (?search=...&filter=...)
              </label>
              <input
                type="text"
                placeholder="key=value&foo=bar"
                value={params}
                onChange={(e) => setParams(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Request Body (for POST/PUT) */}
            {selectedEndpoint.method !== 'GET' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  JSON Request Body
                </label>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* cURL Command Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Equivalent cURL Command
              </span>
              <button
                onClick={copyCurl}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCurl ? 'Copied' : 'Copy cURL'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300/90 overflow-x-auto bg-slate-950 p-2.5 rounded-lg">
              {curlCommand}
            </pre>
          </div>

          {/* Response Viewer */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Live Response Payload</span>
                {responseStatus && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    responseStatus >= 200 && responseStatus < 300 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 201 ? 'CREATED' : 'STATUS'}
                  </span>
                )}
                {responseTime && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {responseTime}ms
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 max-h-[350px] overflow-y-auto">
              {responseJson ? (
                <pre className="text-xs font-mono text-emerald-300 whitespace-pre leading-relaxed">
                  {responseJson}
                </pre>
              ) : (
                <div className="py-10 text-center text-slate-500 text-xs">
                  Click "Execute Request" above to test this REST API endpoint live.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

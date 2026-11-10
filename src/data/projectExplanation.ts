export interface ProjectFile {
  name: string;
  path: string;
  category: 'backend' | 'frontend' | 'config' | 'database';
  purpose: string;
  thinkingClearExplanation: string;
  interviewInsight: string;
  code: string;
}

export interface HourPlan {
  hour: number;
  title: string;
  timeEstimate: string;
  summary: string;
  milestones: string[];
  keyConcept: string;
  pitfallsToAvoid: string;
}

export interface InterviewQA {
  id: string;
  category: string;
  question: string;
  answer: string;
  proTip: string;
  codeSnippet?: string;
}

export const SIX_HOUR_PLAN: HourPlan[] = [
  {
    hour: 1,
    title: 'Project Architecture, Database Schema & Multi-Tenancy Design',
    timeEstimate: '00:00 - 01:00',
    summary: 'Design the relational entity model and establish the multi-tenant isolation strategy.',
    milestones: [
      'Initialize Git repo, Node.js environment, Express & Prisma ORM',
      'Create Organization, User, Product, and Transaction tables in SQLite / PostgreSQL',
      'Establish foreign key relations: every Product and User points to an organizationId',
      'Add composite unique index on (organizationId, sku) so SKUs are unique per business',
    ],
    keyConcept: 'Logical Multi-Tenancy: Shared database with tenant discriminator column (organizationId). It saves infrastructure cost while guaranteeing strict tenant separation when queries are filtered.',
    pitfallsToAvoid: 'Never allow products or transactions without an organizationId. Always make organizationId NOT NULL.',
  },
  {
    hour: 2,
    title: 'Authentication, Security & Tenant Context Middleware',
    timeEstimate: '01:00 - 02:00',
    summary: 'Implement user signup, login with bcrypt password hashing, and JWT token authentication.',
    milestones: [
      'POST /api/auth/signup: Create user and their new Organization in a single atomic transaction',
      'POST /api/auth/login: Verify password hash with bcrypt and generate signed JWT with userId and organizationId',
      'Build authMiddleware: Intercept Bearer tokens, verify JWT, attach req.user and req.organizationId',
      'Secure protected routes so unauthenticated requests receive immediate 401 Unauthorized',
    ],
    keyConcept: 'Token Claims: Storing organizationId directly in the JWT payload means backend middleware can scope every database operation without making an extra database lookup.',
    pitfallsToAvoid: 'Never trust tenant ID supplied in the request body from the client! Always use the tenant ID extracted from the verified JWT.',
  },
  {
    hour: 3,
    title: 'Product Catalog CRUD APIs & Inventory Ledger Logic',
    timeEstimate: '02:00 - 03:00',
    summary: 'Build complete REST endpoints for products with input validation and audit logging.',
    milestones: [
      'GET /api/products: Fetch products with search, category filtering, and stock-status filters',
      'POST /api/products: Create product with SKU validation and initial stock count',
      'PUT /api/products/:id: Update product details with duplicate SKU prevention',
      'DELETE /api/products/:id: Safe removal of discontinued items',
      'POST /api/products/:id/adjust: Atomic Stock In / Stock Out with non-negative validation',
    ],
    keyConcept: 'Double-Entry Inventory Ledger: Do not just mutate `product.quantity`. Record an `InventoryTransaction` record so businesses can track who added or deducted stock and why.',
    pitfallsToAvoid: 'Race conditions: Two users subtracting 5 items simultaneously from a stock of 6 could drop inventory to -4. Use atomic decrements or database transactions.',
  },
  {
    hour: 4,
    title: 'React Single Page App & Product Management UI',
    timeEstimate: '03:00 - 04:00',
    summary: 'Develop the responsive frontend using React, Tailwind CSS, Lucide icons, and modern state hooks.',
    milestones: [
      'Set up clean layout with sticky sidebar, header with tenant badge, and view router',
      'Build searchable, sortable Products table with category filters and stock badges',
      'Build Add & Edit Product modals with live validation (SKU check, positive pricing)',
      'Build quick Stock Adjustment modal for receiving deliveries and shipping orders',
      'Integrate toast notifications and optimistic state updates for lightning responsiveness',
    ],
    keyConcept: 'Single Source of Truth: Centralized API client (`api.ts`) that automatically attaches the Authorization Bearer token to all outbound fetch requests.',
    pitfallsToAvoid: 'Avoid passing prop drilling down 5 levels; use modular components with clear callbacks or custom hooks.',
  },
  {
    hour: 5,
    title: 'Dashboard Analytics, Visual Charts & Low-Stock Alerts',
    timeEstimate: '04:00 - 05:00',
    summary: 'Build high-impact executive dashboard summarizing inventory value, profit margins, and urgent alerts.',
    milestones: [
      'GET /api/dashboard: Server-side aggregation of retail value, cost value, and gross margin',
      'Design KPI summary cards: Total SKUs, Total Units on Hand, Inventory Valuation, Out of Stock',
      'Urgent Low-Stock alert banner highlighting items needing immediate supplier reorders',
      'Category distribution breakdown showing stock concentration by department',
      'Recent stock movement activity timeline with Stock In / Stock Out badges',
    ],
    keyConcept: 'Server-Side Aggregations: For large inventories with 50,000 SKUs, calculating totals in the browser will crash mobile devices. Express/Prisma executes SQL SUM and COUNT in milliseconds.',
    pitfallsToAvoid: 'Never calculate financial values using floating point without rounding or decimal precision to avoid $0.0000000000001 rounding errors.',
  },
  {
    hour: 6,
    title: 'Organization Settings, CSV Export/Import & Production Hardening',
    timeEstimate: '05:00 - 06:00',
    summary: 'Multi-tenant organization switcher, CSV reporting, comprehensive testing, and deployment readiness.',
    milestones: [
      'Settings panel: Manage Organization Name, default low stock threshold, currency symbol',
      'CSV Export: Stream inventory data to downloadable spreadsheets for accounting',
      'Database seed scripts: Instant reset to clean multi-tenant demo data',
      'Unit testing: Pure inventory calculation unit tests and edge cases',
      'Cross-tenant isolation audit: Verify Tenant A cannot read or mutate Tenant B records',
    ],
    keyConcept: 'Defensive Programming: Even if the frontend UI restricts actions, the backend REST API must reject unauthorized tenant modifications with 403 Forbidden or 404 Not Found.',
    pitfallsToAvoid: 'Forgetting to sanitize CSV outputs to prevent CSV injection (formula injection starting with =, +, -, @).',
  },
];

export const INTERVIEW_QUESTIONS: InterviewQA[] = [
  {
    id: 'q1',
    category: 'Architecture & Multi-Tenancy',
    question: 'How do you guarantee that Tenant A can never view or modify Tenant B’s inventory data in a shared database?',
    answer: 'We implement "Logical Multi-Tenancy via Tenant Discriminator". Every table (Product, Transaction, User) has an `organizationId` foreign key. We enforce this through two layers: 1) Auth Middleware extracts and verifies `organizationId` from the cryptographically signed JWT, never from user query params or client body; 2) Every ORM query or SQL statement automatically includes `WHERE organizationId = req.user.organizationId`. In production, this can also be reinforced using PostgreSQL Row-Level Security (RLS) as a database-level safety net.',
    proTip: 'Mention Row-Level Security (RLS) in PostgreSQL as an extra defense-in-depth layer during senior interviews.',
    codeSnippet: `// Express Route Handler:
app.get('/api/products', authMiddleware, async (req, res) => {
  // organizationId comes from verified JWT token:
  const orgId = req.user.organizationId;
  const products = await prisma.product.findMany({
    where: { organizationId: orgId }
  });
  res.json(products);
});`
  },
  {
    id: 'q2',
    category: 'Concurrency & Stock Depletion',
    question: 'What happens if two warehouse workers attempt to ship the last 5 units of a product at the exact same millisecond? How do you prevent negative stock?',
    answer: 'This is a classic "Lost Update" or race condition. If both read `quantity = 5` and then execute `UPDATE quantity = 5 - 5 = 0`, both orders succeed and 10 items are shipped from 5 in stock! To solve this: 1) Use an atomic database decrement with a WHERE condition: `UPDATE Product SET quantity = quantity - 5 WHERE id = :id AND organizationId = :orgId AND quantity >= 5`. If rows affected is 0, the transaction failed due to insufficient stock; or 2) In Prisma, wrap in an interactive transaction with optimistic concurrency control using a `version` field.',
    proTip: 'Explain the difference between optimistic concurrency (version checking) and pessimistic locking (`SELECT FOR UPDATE`).',
    codeSnippet: `// Atomic SQL check prevents race condition:
const result = await prisma.$executeRaw\`
  UPDATE "Product"
  SET "quantity" = "quantity" - \${qty}
  WHERE "id" = \${productId} 
    AND "organizationId" = \${orgId} 
    AND "quantity" >= \${qty};
\`;
if (result === 0) throw new Error('Insufficient stock or item concurrent change');`
  },
  {
    id: 'q3',
    category: 'Database Design',
    question: 'Why should an inventory system maintain an `InventoryTransaction` ledger instead of merely updating `product.quantity` in place?',
    answer: 'Directly updating `product.quantity` destroys historical context. You cannot answer: "Why did our stock decrease by 40 on Tuesday? Was it a sale, a customer return, theft/shrinkage, or a warehouse transfer? And who performed the action?". By appending an immutable `InventoryTransaction` record (event sourcing / double-entry ledger), businesses obtain a tamper-proof audit trail for tax audits, loss prevention, and supplier dispute resolution.',
    proTip: 'Highlight GAAP accounting compliance and supply chain auditability.',
  },
  {
    id: 'q4',
    category: 'Database Indexing',
    question: 'What database indexes are critical for an inventory system as the product catalog scales to millions of records?',
    answer: '1) Composite unique index on `(organizationId, sku)`. This allows fast O(log N) lookup by barcode/SKU while ensuring two different stores can both have a product called "LAP-001" without collision. 2) Composite index on `(organizationId, quantity, lowStockLevel)` for lightning-fast low-stock dashboard queries without full table scans. 3) Index on `(organizationId, createdAt)` on the transaction table for pagination of audit logs.',
    proTip: 'Always mention that in multi-tenant SaaS, tenant discriminator (`organizationId`) should be the first column in composite indexes.',
  },
  {
    id: 'q5',
    category: 'Cost Accounting',
    question: 'Why do we store both `costPrice` and `sellingPrice` on each product, and how does inventory valuation work?',
    answer: '`costPrice` is what the business paid the supplier or manufacturer (COGS - Cost of Goods Sold), whereas `sellingPrice` is the retail price charged to customers. Total inventory value on the balance sheet is calculated as `SUM(quantity * costPrice)`. Potential gross profit is `SUM(quantity * (sellingPrice - costPrice))`. In advanced ERPs, we implement FIFO (First-In, First-Out) or Weighted Average Cost (WAC) to handle fluctuating supplier batch costs.',
    proTip: 'Mentioning FIFO vs Average Costing instantly signals senior business acumen.',
  },
  {
    id: 'q6',
    category: 'API Design & Idempotency',
    question: 'Why should stock adjustment endpoints support idempotency keys?',
    answer: 'If warehouse staff clicks "Confirm Stock In (+50 items)" on a slow mobile connection, a network hiccup might cause the browser or retry client to send the POST request twice. Without idempotency, +50 becomes +100 items! By sending a unique `Idempotency-Key: uuid` header with the request, the Express server checks a cache or database table; if the key was already processed, it returns the cached response instead of double-crediting inventory.',
    proTip: 'Standard in payment gateways (Stripe) and critical for enterprise supply chain systems.',
  },
];

export const SOURCE_CODE_FILES: ProjectFile[] = [
  {
    name: 'schema.prisma',
    path: 'backend/prisma/schema.prisma',
    category: 'database',
    purpose: 'Defines database models, relationships, and multi-tenant constraints for Prisma ORM.',
    thinkingClearExplanation: 'Notice how every model has `organizationId`. We create a composite unique constraint `@@unique([organizationId, sku])` which enforces that within Organization A, SKU "LAP-001" is unique, but Organization B can also have SKU "LAP-001" without conflicting!',
    interviewInsight: 'Interviewers look for composite unique indexes to verify you understand multi-tenant data structures.',
    code: `datasource db {
  provider = "sqlite" // Easily swapped to "postgresql" or "mysql" in production
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Organization {
  id                   String        @id @default(uuid())
  name                 String
  currency             String        @default("USD")
  defaultLowStockLevel Int           @default(5)
  taxRate              Float         @default(0.0)
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  users                User[]
  products             Product[]
  transactions         Transaction[]
}

model User {
  id             String       @id @default(uuid())
  email          String       @unique
  name           String
  passwordHash   String
  role           String       @default("ADMIN") // ADMIN, MANAGER, STAFF
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())
}

model Product {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  sku            String
  category       String       @default("General")
  quantity       Int          @default(0)
  costPrice      Float        @default(0.0)
  sellingPrice   Float        @default(0.0)
  lowStockLevel  Int          @default(5)
  location       String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  transactions   Transaction[]

  @@unique([organizationId, sku]) // SKU unique PER organization!
  @@index([organizationId, quantity])
}

model Transaction {
  id               String       @id @default(uuid())
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  productId        String
  product          Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  type             String       // "STOCK_IN", "STOCK_OUT", "ADJUSTMENT"
  quantityChanged  Int
  previousQuantity Int
  newQuantity      Int
  reason           String?
  userName         String
  createdAt        DateTime     @default(now())

  @@index([organizationId, createdAt])
}`
  },
  {
    name: 'auth.js (Middleware)',
    path: 'backend/src/middleware/auth.js',
    category: 'backend',
    purpose: 'Validates JWT Bearer tokens and injects verified tenant context (req.user & req.organizationId) into the request.',
    thinkingClearExplanation: 'This is the security gatekeeper of the SaaS. If a user tries to access `/api/products` without a valid token, this middleware returns 401 immediately. Most importantly, it extracts `organizationId` from the verified token signature—preventing any client from impersonating another tenant.',
    interviewInsight: 'Explain why `organizationId` must NEVER come from user-controlled body parameters.',
    code: `import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stockflow-secret-key-3000');
    
    // Attach verified user and tenant organizationId to request object
    req.user = decoded;
    req.organizationId = decoded.organizationId;

    next(); // Pass control to next route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};`
  },
  {
    name: 'products.js (Routes)',
    path: 'backend/src/routes/products.js',
    category: 'backend',
    purpose: 'Complete CRUD, search, filter, and atomic stock adjustment routes scoped strictly to the current tenant.',
    thinkingClearExplanation: 'Look at line 14: `where: { organizationId: req.organizationId }`. Every query is strictly isolated. When adjusting stock in `POST /:id/adjust`, we check that `amount > 0` and that stock cannot drop below 0 if deducting, then log an immutable transaction audit record.',
    interviewInsight: 'Discuss handling transactional integrity using Prisma `$transaction` so product quantity and transaction log update together atomically.',
    code: `import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware); // Protect all product endpoints

// 1. GET ALL PRODUCTS (Scoped to tenant with search & filter)
router.get('/', async (req, res) => {
  const { search, category, filter } = req.query;
  const where = { organizationId: req.organizationId };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } }
    ];
  }
  if (category && category !== 'All') {
    where.category = category;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: 'asc' }
  });

  res.json({ products });
});

// 2. CREATE PRODUCT (Enforce unique SKU per organization)
router.post('/', async (req, res) => {
  const { name, sku, category, quantity, costPrice, sellingPrice, lowStockLevel } = req.body;
  
  if (!name || !sku) {
    return res.status(400).json({ error: 'Name and SKU are required' });
  }

  const existing = await prisma.product.findUnique({
    where: {
      organizationId_sku: {
        organizationId: req.organizationId,
        sku: sku.toUpperCase()
      }
    }
  });

  if (existing) {
    return res.status(409).json({ error: 'SKU already exists in your organization' });
  }

  const product = await prisma.product.create({
    data: {
      organizationId: req.organizationId,
      name,
      sku: sku.toUpperCase(),
      category: category || 'General',
      quantity: Math.max(0, parseInt(quantity) || 0),
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      lowStockLevel: parseInt(lowStockLevel) || 5,
    }
  });

  res.status(201).json(product);
});

// 3. STOCK ADJUSTMENT (Stock In / Stock Out / Audit)
router.post('/:id/adjust', async (req, res) => {
  const { id } = req.params;
  const { type, amount, reason } = req.body; // "STOCK_IN" or "STOCK_OUT"

  const product = await prisma.product.findFirst({
    where: { id, organizationId: req.organizationId }
  });

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const qty = parseInt(amount, 10);
  if (type === 'STOCK_OUT' && qty > product.quantity) {
    return res.status(400).json({ error: 'Cannot remove more stock than available on hand' });
  }

  const newQuantity = type === 'STOCK_IN' ? product.quantity + qty : product.quantity - qty;

  // Atomic database transaction updates product AND writes transaction ledger
  const [updatedProduct, transaction] = await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { quantity: newQuantity }
    }),
    prisma.transaction.create({
      data: {
        organizationId: req.organizationId,
        productId: id,
        type,
        quantityChanged: qty,
        previousQuantity: product.quantity,
        newQuantity,
        reason: reason || 'Manual adjustment',
        userName: req.user.name || 'Admin User'
      }
    })
  ]);

  res.json({ product: updatedProduct, transaction });
});

export default router;`
  },
  {
    name: 'dashboard.js (Routes)',
    path: 'backend/src/routes/dashboard.js',
    category: 'backend',
    purpose: 'Aggregates tenant business metrics: inventory valuation, profit margins, low stock alerts, and recent activity.',
    thinkingClearExplanation: 'Instead of shipping 10,000 product rows over the network to the frontend to sum them up, we calculate inventory valuation, total units, out of stock items, and low stock warnings right inside Node.js / database queries. This keeps the frontend snappy and lightning fast.',
    interviewInsight: 'Explain the difference between client-side computation and server-side aggregations for large datasets.',
    code: `import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const orgId = req.organizationId;

  const products = await prisma.product.findMany({
    where: { organizationId: orgId }
  });

  let totalUnits = 0;
  let totalCostValue = 0;
  let totalRetailValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const p of products) {
    totalUnits += p.quantity;
    totalCostValue += p.quantity * p.costPrice;
    totalRetailValue += p.quantity * p.sellingPrice;

    if (p.quantity <= 0) {
      outOfStockCount++;
    } else if (p.quantity <= p.lowStockLevel) {
      lowStockCount++;
    }
  }

  const recentTransactions = await prisma.transaction.findMany({
    where: { organizationId: orgId },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true, sku: true } } }
  });

  res.json({
    metrics: {
      totalSKUs: products.length,
      totalUnits,
      totalCostValue: Math.round(totalCostValue * 100) / 100,
      totalRetailValue: Math.round(totalRetailValue * 100) / 100,
      potentialProfit: Math.round((totalRetailValue - totalCostValue) * 100) / 100,
      lowStockCount,
      outOfStockCount
    },
    recentTransactions
  });
});

export default router;`
  },
  {
    name: 'api.js (Frontend Client)',
    path: 'frontend/src/api.js',
    category: 'frontend',
    purpose: 'Centralized HTTP client that handles JWT Bearer tokens and request formatting.',
    thinkingClearExplanation: 'Whenever the user logs in, we save the token in `localStorage`. This utility function automatically retrieves that token and injects `Authorization: Bearer <token>` on every API call. If the token expires (401), it redirects to login.',
    interviewInsight: 'Discuss HTTP interceptors vs custom wrapper functions for client-side API calls.',
    code: `const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('stockflow_token');
  const orgId = localStorage.getItem('stockflow_org_id');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
    ...(orgId ? { 'X-Organization-Id': orgId } : {}),
    ...options.headers,
  };

  const response = await fetch(\`\${API_BASE}\${endpoint}\`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized session
    console.warn('Session expired or unauthorized');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || \`HTTP error! status: \${response.status}\`);
  }

  return data;
}`
  },
];

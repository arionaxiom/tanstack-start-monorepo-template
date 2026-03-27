# Backend Rules

This document defines how backend logic must be structured in this project. **Read this before doing any backend work.**

## Core Principle: Domain-Owned Services

Even though this project is built as a monolith, backend logic must be organized into **domain services** with clear ownership boundaries. Each service owns a specific business domain and is the sole authority over its data.

This gives us the modularity of microservices without the operational complexity — and makes future extraction trivial if a service ever needs to scale independently.

## Rules

### 1. Each service owns its data

A service is the **single owner** of the database tables (or collections, or KV namespaces) that belong to its domain. No other service may read from or write to those tables directly.

```
services/
  auth/         # owns: users, sessions, api_keys
  billing/      # owns: invoices, payments, subscriptions
  inventory/    # owns: products, stock_levels, warehouses
```

If a table doesn't have a clear owner, that's a design smell — resolve it before writing code.

### 2. Writes always go through the owning service

If the billing service needs to check a user's role before processing a payment, it calls `auth.getUserRole(userId)` — it does **not** query the users table directly. If auth needs to log a billing event, it calls `billing.recordEvent(...)`.

This is non-negotiable. Direct cross-domain writes create hidden coupling that becomes impossible to reason about as the codebase grows.

### 3. Reads go through the owning service

Cross-domain reads must also go through the owning service's public API (exported functions). The owning service exposes **query functions** that return the data other services need. This keeps the data contract explicit and lets the owner change its schema without breaking consumers.

For performance-critical read paths, the owning service may expose optimized read functions (e.g., batch lookups, projections). But the caller never constructs queries against another service's tables.

### 4. Services expose a public API, hide internals

Each service exports a clear set of functions that other services can call. Internal helpers, schema details, and implementation logic stay private.

```typescript
// auth/index.ts — public API
export {
  createUser,
  getUserById,
  getUserRole,
  validateSession,
} from "./actions";

// auth/actions.ts — implementation (calls auth's own DB layer)
// auth/db.ts — direct database access (NEVER imported outside auth/)
// auth/types.ts — can be shared if other services need the types
```

### 5. One service, one responsibility

A service should encapsulate all logic for its domain: validation, business rules, data access, and side effects. If you find a service doing work that belongs to another domain, delegate to the other service's public API.

Bad: billing service directly updates the user's `lastPaymentAt` field.
Good: billing calls `auth.updateUserActivity(userId, "payment")`.

### 6. Shared types are fine, shared logic is not

Services may import types from other services (or from `packages/types`). But business logic must not be shared between services — if two services need similar logic, either one delegates to the other, or the shared part is extracted to a domain-agnostic utility in `packages/utils`.

### 7. Where services live

Services are backend-only packages in the monorepo. Depending on scale:

- **Small projects**: A single `packages/backend/src/` directory with subdirectories per domain
- **Growing projects**: Individual packages like `packages/auth/`, `packages/billing/`, etc.

Either way, the boundary rules above apply identically.

## Checklist for new backend work

Before writing backend code, verify:

- [ ] Which service owns this data?
- [ ] Am I only accessing tables owned by my service?
- [ ] If I need data from another domain, am I calling its public API?
- [ ] Does my service expose only what other services need (no leaking internals)?
- [ ] Are my types defined in the service or in `packages/types` if shared?

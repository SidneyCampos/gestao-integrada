# AGENTS.md - AI Coding Assistant Guide

## Project Overview
**Prefeitura Hub** is a municipal ERP PWA built as a full-stack application. Frontend uses React (Vite, Tailwind CSS v4, Axios, React Router) for mobile-first responsive UI. Backend uses Node.js (Express, Prisma ORM, PostgreSQL) with modular architecture organized by municipal sectors (e.g., Almoxarifado, TI).

## Architecture & Data Flow
- **Frontend**: Single-page app served from `/frontend/dist`, routes protected by `RotaProtegida` component using `hasPermission()` utility
- **Backend**: API endpoints under `/api`, JWT authentication via `authMiddleware`, sector-based access via `sectorMiddleware`
- **Database**: Prisma schema defines models (Usuario, Setor, Ferramenta, Emprestimo) with relations; migrations handled by Prisma
- **Communication**: Axios calls to `/api/*` with Bearer tokens; interceptors handle token expiry (401/403 → logout)
- **Modular Structure**: Backend modules in `/backend/src/modulos/` (e.g., `almoxarifado/`), frontend pages in `/frontend/src/pages/` by sector

## Critical Developer Workflows
- **Local Development**: Run `npm run dev` in `/backend` (Node --watch) and `/frontend` (Vite dev server) simultaneously
- **Build & Deploy**: `npm run build` in frontend creates `/frontend/dist`; backend serves static files and API
- **Database Setup**: Use `popular_banco.bat` or `prisma db push`; seed with `prisma db seed`
- **Debugging**: Backend logs errors with `[ERRO]` tags; frontend uses browser dev tools; check network tab for API calls
- **Testing**: No automated tests configured; manual testing via UI and API endpoints

## Project-Specific Conventions
- **Controllers**: Static async methods (`criar`, `listar`, `deletar`) with try-catch blocks and `console.error()` logging
- **Routes**: Defined in `rotas.js` per module, using Express Router; apply `authMiddleware` and `sectorMiddleware` as needed
- **Frontend Pages**: Use hooks (`useState`, `useEffect`) for state; `axios.get/post` for API; loading states (`carregando`, `salvando`)
- **UI Patterns**: Mobile-first tables transform to stacked cards on small screens; reuse `Modal` component for forms
- **Permissions**: `hasPermission(usuario, setorExigido)` checks admin or sector membership; routes use `RotaProtegida`
- **Styling**: Tailwind CSS v4 with utility classes; responsive design (`md:`, `lg:` breakpoints); Lucide React icons
- **Error Handling**: Frontend shows alerts on API errors; backend returns `{ erro: "message" }` with appropriate status codes
- **File Naming**: PascalCase for components (e.g., `Ferramentas.jsx`), camelCase for utilities (e.g., `auth.js`)

## Design & UX Rules (Non-Negotiable)
1. **Mobile-First**: Design must be planned for small screens first, then scale up
2. **Data-Dense UI**: Desktop uses compact tables; mobile transforms rows into stacked cards (easy to tap)
3. **Error Prevention**: Always prevent user mistakes (e.g., disable save buttons during loading, confirm destructive actions)
4. **Sortable & Filterable Tables (Standard)**: EVERY table in the system MUST use `useTabelaOrdenavel` (hook in `src/hooks/useTabelaOrdenavel.js`) and `HeaderOrdenavel` (component in `src/components/HeaderOrdenavel.jsx`) so columns can be sorted (ASC/DESC) upon clicking column headers.


## Code Generation Rules
1. **Complete Code Blocks**: Never use placeholders like `// ... rest of code`. Always provide full, functional blocks that can be copy-pasted
2. **Specificity**: Be explicit about which file and which line should be changed
3. **Clean Code**: Break large components into smaller ones when it makes sense
4. **Route Alignment**: Keep frontend routes aligned with sector-based protections (Route Guards via `RotaProtegida`)

## Key Files & Patterns
- **App.jsx**: Router setup with protected routes; persistent login via localStorage
- **Layout.jsx**: Dynamic sidebar/menu based on user permissions; mobile bottom nav
- **prisma/schema.prisma**: Database models with relations (many-to-many Usuario-Setor)
- **authMiddleware.js**: JWT verification; attaches `req.usuario`
- **sectorMiddleware.js**: Checks sector access; admins bypass
- **Ferramentas.jsx**: Example page with tabs, responsive table/cards, modals for CRUD
- **Modal.jsx**: Reusable modal component with variants (blue, etc.)

## Integration Points
- **External APIs**: None; all internal
- **Dependencies**: PostgreSQL (via Prisma), JWT for auth
- **Cross-Component**: `hasPermission` utility used in Layout and App; axios configured globally with token
- **Build Tools**: Vite for frontend bundling; Prisma for DB schema/migrations

## Common Patterns to Follow
- Add new sectors: Create `/modulos/sector/` with `Controller.js`, `rotas.js`; add to `App.jsx` and `Layout.jsx` modulosDisponiveis
- CRUD Operations: Follow FerramentaController pattern (async/await, Prisma queries, error responses)
- UI Components: Extend existing patterns; ensure mobile responsiveness with Tailwind responsive utilities
- Security: Always apply appropriate middleware; frontend permissions are client-side only (backend revalidates)</content>
<parameter name="filePath">C:\Users\sidne\WebstormProjects\gestao-integrada\AGENTS.md

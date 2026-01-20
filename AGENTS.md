# AGENTS.md

## Build, Lint, and Test Commands

### Frontend (Root Directory)
- `npm run dev` - Start development server (Vite, port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (backend/ Directory)
- `npm start` - Start production server (Express, port 3001)
- `npm run dev` - Start development server with file watching

### Testing
No test framework is currently configured. When adding tests, use a framework compatible with React (Jest, Vitest) for frontend and Node.js (Jest, Mocha) for backend.

## Code Style Guidelines

### Imports
- Use absolute imports with `@/*` alias for root directory files
- Named imports preferred: `import { useState, useEffect } from 'react'`
- Separate third-party, internal module, and type imports with blank lines
- Backend uses ES6 imports: `import express from 'express'`

### TypeScript
- Explicit typing required: `const [data, setData] = useState<string>('')`
- Interface definitions for props and data structures: `interface PriceChartProps { ... }`
- Use `React.FC<Type>` for functional components
- Enums for constants: `export enum TimeRange { DAY = '1', ... }`
- Type annotations on all function parameters and return types

### Naming Conventions
- Components: PascalCase (`PriceChart`, `AdminDashboard`)
- Functions/Methods: camelCase (`fetchHistoricalData`, `loadData`)
- Variables: camelCase (`displayHistory`, `isPlaybackActive`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `EN_NEWS`)
- Types/Interfaces: PascalCase (`MarketStats`, `PriceDataPoint`)
- Files: PascalCase for components (`PriceChart.tsx`), camelCase for services (`cryptoService.ts`)

### Error Handling
- Always use try/catch blocks for async operations
- Validate required parameters before processing
- Return specific error messages: `throw new Error('Not authenticated')`
- Console.error for debugging: `console.error('Login error:', error)`
- Frontend: Show user-friendly error messages in UI
- Backend: Return appropriate HTTP status codes (400, 401, 500) with JSON error objects

### React Patterns
- Functional components with hooks (useState, useEffect, useCallback, useRef)
- Explicit dependency arrays in useEffect and useCallback
- Clean up side effects (intervals, subscriptions) in useEffect cleanup functions
- Prop interfaces defined above component
- Conditional rendering with ternary operators for simple cases
- Avoid inline functions in JSX - memoize with useCallback for performance

### Backend Patterns
- Express.js with ES6 modules (.js files)
- Modular structure: routes → controllers → database
- Use connection pooling (MySQL2/promise pool)
- Async functions with try/catch blocks
- Validate request body: `if (!username || !password) return res.status(400).json(...)`
- Return JSON responses: `res.json({ success: true, data: ... })`
- Environment variables: `const PORT = process.env.PORT || 3001`

### File Organization
- `components/` - React components (`.tsx`)
- `services/` - API calls and business logic (`.ts`)
- `backend/` - Express.js API
  - `controllers/` - Route handlers
  - `routes/` - Express route definitions
  - `config/` - Database configuration
- `types.ts` - Shared TypeScript interfaces and enums
- Root: Main app files (App.tsx, index.tsx, vite.config.ts)

### Code Quality
- Keep functions focused and under 100 lines when possible
- Use descriptive variable and function names
- Add comments only for complex logic, not obvious code
- Maintain consistent spacing and indentation (2 spaces)
- Remove commented-out code before committing

### Authentication
- Token-based auth with localStorage (frontend)
- Session tokens stored in database (backend)
- Always verify tokens before protected operations
- API routes: `/api/auth/*` for authentication
- Helper function: `getToken()` retrieves from localStorage

### API Integration
- Base URL constant: `const API_BASE_URL = 'http://localhost:3001/api'`
- Fetch API with async/await pattern
- JSON content-type headers
- Check response.ok before processing data
- Throw errors with descriptive messages

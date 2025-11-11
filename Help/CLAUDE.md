# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Traczi Web Interface** (based on Traccar), a GPS tracking platform frontend. It's a React-based Progressive Web App (PWA) that connects to the Traccar backend for tracking devices, displaying real-time positions on maps, and generating reports.

**Tech Stack:**
- React 19 with React Router
- Redux Toolkit for state management
- Material UI (MUI) for UI components
- MapLibre GL for map rendering (with support for Google Maps, MapTiler, Bing, etc.)
- Vite for build tooling
- ESLint with Airbnb config

## Development Commands

### Starting Development Server
```bash
npm start
```
Runs dev server on port 3000 with hot reload. Proxies API calls and WebSocket to `https://api.traczi.com`.

### Building for Production
```bash
npm run build
```
Outputs to `build/` directory.

### Linting
```bash
npm run lint        # Check for lint errors
npm run lint:fix    # Auto-fix lint errors
```

### PWA Assets Generation
```bash
npm run generate-pwa-assets
```
Generates PWA icons from `public/logo.svg`.

## Architecture

### Application Bootstrap
1. **Entry point:** `src/index.jsx` - Sets up React root with providers
2. **Provider hierarchy:**
   - `ErrorBoundary` - Catches React errors
   - Redux `Provider` - State management
   - `LocalizationProvider` - i18n support
   - `AppThemeProvider` - Theme customization
   - `ServerProvider` - Server config
   - `Navigation` - React Router routing

### Core Controllers
- **SocketController** (`src/SocketController.jsx`): Manages WebSocket connection to backend for real-time device updates, positions, and events. Handles reconnection, visibility changes, and online/offline states.
- **CachingController** (`src/CachingController.js`): Manages client-side data caching
- **UpdateController** (`src/UpdateController.jsx`): Handles app update detection and notifications

### State Management (Redux)
Store located in `src/store/`. Combines multiple reducers:
- `session` - User session, server config, positions, socket status
- `devices` - Device list and selection state
- `events` - Real-time events from devices
- `geofences`, `groups`, `drivers`, `maintenances`, `calendars` - Domain entities
- `errors` - Global error handling

Custom middleware: `throttleMiddleware` for performance optimization.

### Routing Structure
Defined in `src/Navigation.jsx`:
- `/login`, `/register`, `/reset-password`, `/change-server` - Authentication pages
- `/` - Main app (requires auth)
  - `/` - Main tracking page with device list and map
  - `/replay` - Historical playback
  - `/geofences` - Geofence management
  - `/settings/*` - Device, user, notification, group, driver, calendar, computed attribute, maintenance, command settings
  - `/reports/*` - Various reports (combined, chart, events, route, stops, summary, trips, scheduled, statistics, audit, logs)
  - `/position/:id`, `/event/:id`, `/network/:positionId` - Detail pages

### Map System
Located in `src/map/`:
- **MapView** (`src/map/core/MapView.jsx`): Main MapLibre GL wrapper component. Singleton map instance shared across app.
- **useMapStyles** (`src/map/core/useMapStyles.js`): Provides map styles (OpenStreetMap, Google, Bing, MapTiler, LocationIQ, etc.). Handles API keys from user preferences.
- **Map structure:**
  - `core/` - Core map initialization and utilities
  - `main/` - Main map view with device markers
  - `draw/` - Drawing tools for geofences
  - `geocoder/` - Address search
  - `legend/`, `notification/`, `overlay/`, `switcher/` - UI overlays

### Common Utilities
Located in `src/common/util/`:
- **fetchOrThrow** - Wrapper for fetch API with error handling
- **reactHelper.js** - Custom hooks:
  - `useEffectAsync` - useEffect with async support and error handling
  - `useCatch` - Wraps async functions with Redux error dispatch
  - `useCatchCallback` - Combination of useCatch and useCallback
  - `usePrevious` - Gets previous value of a prop/state
- **preferences.js** - Hooks for user/server preferences
- **formatter.js** - Formatting utilities for dates, distances, speeds
- **converter.js** - Unit conversions
- **permissions.js** - Permission checking utilities
- **exportExcel.js** - Excel export functionality using ExcelJS

### API Integration
- Base URL: `/api` (proxied to backend in dev, relative in production)
- WebSocket: `/api/socket` for real-time updates
- Authentication via session cookies
- All API calls should use `fetchOrThrow` utility for consistent error handling

### Localization
- Translation files in `src/resources/l10n/`
- Use `useTranslation()` hook from `LocalizationProvider`
- Supports multiple languages with dynamic loading

## Code Style Guidelines

### ESLint Configuration
- Based on Airbnb style guide with customizations:
  - `max-len` disabled (no line length limit)
  - `no-shadow`, `no-return-assign`, `no-param-reassign` disabled
  - Arrow functions required for React components
  - Prop-types disabled (project doesn't use them)

### React Patterns
- Use arrow function components (not `function Component()`)
- Use hooks for state and side effects
- For async effects, use `useEffectAsync` from `reactHelper.js`
- For async callbacks that need error handling, use `useCatchCallback`
- Use `makeStyles` from `tss-react/mui` for component styling
- Redux: Use hooks (`useSelector`, `useDispatch`), not `connect` (except in legacy code)

### File Organization
- Components in PascalCase (e.g., `DeviceList.jsx`)
- Utilities in camelCase (e.g., `fetchOrThrow.js`)
- Group related files by feature (e.g., `settings/`, `reports/`, `map/`)
- Shared components/utilities in `common/`

## Proxy Configuration

Development proxy in `vite.config.js`:
- WebSocket: `wss://api.traczi.com`
- API: `https://api.traczi.com`

Update these if connecting to a different backend server.

## Important Notes

- **Map instance is a singleton** - Import `map` from `src/map/core/MapView.jsx`, don't create new instances
- **Real-time updates via WebSocket** - Device positions, events, and status updates come through `SocketController`
- **Authentication state** - Checked in `App.jsx`, redirects to `/login` if not authenticated
- **Media queries** - Use MUI's `useMediaQuery(theme.breakpoints.up('md'))` for desktop vs mobile detection
- **Native app integration** - Code includes hooks for React Native WebView (`NativeInterface`)
- **PWA support** - Configured with Workbox, excludes `/api` routes from caching

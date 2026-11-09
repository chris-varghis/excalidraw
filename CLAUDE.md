# CLAUDE.md

## Project Structure

Excalidraw is a **monorepo** with a clear separation between the core library and the application:

- **`packages/excalidraw/`** - Main React component library published to npm as `@excalidraw/excalidraw`
- **`excalidraw-app/`** - Offline-only app that uses the library; it is the frontend of the desktop build (see "Desktop (offline) fork" below)
- **`packages/`** - Core packages: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`
- **`examples/`** - Integration examples (NextJS, browser script)
- **`src-tauri/`** - Tauri v2 desktop shell (Rust) that wraps `excalidraw-app`

## Development Workflow

1. **Package Development**: Work in `packages/*` for editor features
2. **App Development**: Work in `excalidraw-app/` for app-specific features
3. **Testing**: Always run `yarn test:update` before committing
4. **Type Safety**: Use `yarn test:typecheck` to verify TypeScript

## Development Commands

```bash
yarn test:typecheck  # TypeScript type checking
yarn test:update     # Run all tests (with snapshot updates)
yarn fix             # Auto-fix formatting and linting issues
yarn desktop:dev     # Run the desktop app (Tauri) with hot reload
yarn desktop:build   # Build the desktop app (add `--bundles app` to skip the .dmg)
```

## Architecture Notes

### Package System

- Uses Yarn workspaces for monorepo management
- Internal packages use path aliases (see `vitest.config.mts`)
- Build system uses esbuild for packages, Vite for the app
- TypeScript throughout with strict configuration

### Desktop (offline) fork

- `excalidraw-app` is **offline-only**: collaboration, Firebase, share links, AI, Excalidraw+, Sentry/analytics and the PWA/service worker have been removed. Do not reintroduce network calls; the Tauri CSP (`src-tauri/tauri.conf.json`) blocks them (`connect-src 'self'`).
- The Mermaid → Excalidraw dialog is kept via `<TTDDialog __fallback />` (no AI backend).
- Desktop builds use `vite build --mode desktop` (`.env.desktop`). In that mode `scripts/woff2/woff2-vite-plugins.js` bundles fonts locally instead of using the CDN.
- Tauri requires Rust (`rustup`). The dev server must stay on port 3001 (`strictPort`, matches `devUrl`).

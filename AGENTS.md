# Agent Guidelines for Konung

## Commands

- **Build**: `deno task build`
- **Dev server**: `deno task dev`
- **Lint/check**: `deno task check` (formats, lints, and type-checks)
- **Start production**: `deno task start`
- **Single test**: No test framework configured yet

## Code Style

- **Language**: TypeScript with Preact JSX
- **Framework**: Fresh (define.page for routes, islands for interactivity)
- **Imports**: Use `import type` for type-only imports; relative paths with .tsx
  extensions
- **Naming**: PascalCase for components, camelCase for props/variables/functions
- **Types**: Define interfaces for component props
- **State**: Use @preact/signals (useSignal hook)
- **Styling**: Tailwind CSS utility classes
- **Formatting**: Deno formatter (auto-applied via `deno task check`)
- **Error handling**: Standard try/catch; avoid console.log in production code

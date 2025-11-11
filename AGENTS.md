# Agent Guidelines for Konung

## Commands

- Build: `deno task build`
- Dev: `deno task dev`
- Check (lint/format/type): `deno task check`
- Start: `deno task start`
- Test: No framework configured

## Code Style

- Language: TypeScript + Preact JSX
- Framework: Fresh (routes: define.page, interactivity: islands)
- Imports: `import type` for types; @/ alias; relative .tsx paths
- Naming: PascalCase components, camelCase props/vars/functions
- Types: Interfaces for component props
- State: @preact/signals (useSignal hook)
- Styling: Tailwind CSS classes
- Formatting: Deno fmt (auto via check)
- Error handling: try/catch; avoid console.log in production

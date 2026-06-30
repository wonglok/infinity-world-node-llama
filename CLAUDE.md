# Project Architecture Study

## Overview

This is an Electron + Vite desktop app that runs LLMs locally via `node-llama-cpp`. It has a React frontend (renderer process) and a Node.js backend (Electron main process). The two processes communicate through bi-directional RPC (birpc) over Electron IPC.

## Folder Structure

```
project-root/
├── src/                          # Renderer process (React frontend)
│   ├── index.tsx                 # Entry point - mounts React app
│   ├── index.html                # HTML shell
│   ├── index.css                 # Global styles + Tailwind CSS import
│   ├── App/                      # Root React component
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── components/           # UI components (nested by feature)
│   │       ├── Header/           #   Top bar: model load, reset, version badge
│   │       │   ├── Header.tsx
│   │       │   ├── Header.css
│   │       │   └── components/   #   Header sub-components
│   │       │       └── UpdateBadge/
│   │       ├── ChatHistory/      #   Chat message list
│   │       │   ├── ChatHistory.tsx
│   │       │   ├── ChatHistory.css
│   │       │   └── components/   #   Sub-components for each message type
│   │       │       ├── ModelMessage/
│   │       │       │   ├── ModelMessage.tsx
│   │       │       │   ├── ModelMessage.css
│   │       │       │   └── components/
│   │       │       │       └── ModelMessageCopyButton/
│   │       │       ├── ModelResponseComment/
│   │       │       ├── ModelResponseThought/
│   │       │       └── UserMessage/
│   │       ├── InputRow/         #   Text input with autocomplete
│   │       ├── FixedDivWithSpacer/ # Layout utility
│   │       ├── MessageMarkdown/  #   Markdown rendering
│   │       └── MarkdownContent/  #   Markdown content display
│   ├── state/                    # Renderer-side state mirror
│   │   └── llmState.ts           #   Mirrors electron/state/llmState.ts
│   ├── rpc/                      # RPC client (calls electron functions)
│   │   └── llmRpc.ts             #   Defines renderer functions + creates birpc
│   ├── hooks/                    # React hooks
│   │   └── useExternalState.ts   #   Subscribe to lifecycle-utils State in React
│   ├── stores/                   # Zustand stores (React state management)
│   │   └── <domain>Store.ts      #   One store per domain concern
│   ├── utils/                    # Renderer utilities
│   │   └── createRendererSideBirpc.ts  # birpc factory (IPC → renderer)
│   └── icons/                    # SVG icon components (*IconSVG.tsx)
│
├── electron/                     # Main process (Electron/Node.js backend)
│   ├── index.ts                  # Entry point - creates BrowserWindow, registers RPC
│   ├── preload.ts                # Context bridge - exposes ipcRenderer to renderer
│   ├── llm/                      # LLM-related logic
│   │   └── modelFunctions.ts     #   AI tool functions (getDate, getTime, getWeather)
│   ├── state/                    # Central state (source of truth)
│   │   └── llmState.ts           #   State type + LLM lifecycle (load, prompt, etc.)
│   ├── rpc/                      # RPC server (handles renderer calls)
│   │   └── llmRpc.ts             #   ElectronLlmRpc class: electron functions + state sync
│   └── utils/                    # Electron utilities
│       └── createElectronSideBirpc.ts  # birpc factory (IPC ↔ renderer)
│
├── public/                       # Static assets
├── models/                       # Local GGUF model files
├── dist-electron/                # Build output for electron
├── dist/                         # Build output for renderer
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── electron-builder.ts
```

## Architecture Patterns

### 1. Mirror Architecture

The `src/` and `electron/` directories mirror each other:

- `src/state/` mirrors `electron/state/`
- `src/rpc/` mirrors `electron/rpc/`
- `src/utils/` mirrors `electron/utils/`

**Rule:** For every backend module in `electron/<category>/`, there is a corresponding frontend module in `src/<category>/`.

### 2. State Management (Zustand)

The renderer (React frontend) uses **Zustand** for state management. Zustand stores are defined in `src/stores/` and consumed by components via hooks.

**Rules for Zustand stores:**

- One store per domain concern (e.g., `useChatStore`, `useModelStore`).
- Store files go in `src/stores/` with the pattern `<domain>Store.ts`.
- State received from the electron main process (via birpc) is written into the Zustand store, which triggers React re-renders.
- Components never mutate electron-side state directly — they call RPC functions which update electron state, and the electron side pushes updated state back, which then updates the Zustand store.

### 3. State Flow (One-Way)

```
electron/state/llmState.ts  ──push──>  src/state/llmState.ts
       ↑                                    │
  (source of truth)                   (mirror + React subscriptions)
```

- The **electron side** owns the state — it defines the `LlmState` type and creates the canonical `State` object.
- State is pushed from electron to renderer via `birpc`: `electron → rendererLlmRpc.updateState(state) → llmState.state = state`
- The **renderer side** imports the `LlmState` type and creates its own `State` object initialized with defaults. It never mutates state directly — it only receives updates from electron.
- React components subscribe via `useExternalState(llmState)` which uses `state.createChangeListener()`.

### 4. RPC Pattern (bi-directional via birpc)

Two birpc channels are created, both named `"llmRpc"`:

| Direction           | Factory                                        | Transport                             |
| ------------------- | ---------------------------------------------- | ------------------------------------- |
| Renderer → Electron | `createElectronSideBirpc` in `electron/utils/` | `ipcMain.on` / `webContents.send`     |
| Electron → Renderer | `createRendererSideBirpc` in `src/utils/`      | `ipcRenderer.send` / `ipcRenderer.on` |

**Naming convention for the RPC function types:**

- `ElectronFunctions` — functions the renderer can call on the electron side (defined in `electron/rpc/llmRpc.ts`)
- `RenderedFunctions` — functions the electron side can call on the renderer (defined in `src/rpc/llmRpc.ts`)

The only renderer function is `updateState(state)` — everything else flows renderer→electron.

### 5. Component Organization

Each UI component gets its own folder under `src/App/components/`:

```
ComponentName/
├── ComponentName.tsx    # Component code
├── ComponentName.css    # Component styles
└── components/          # Sub-components (recursive pattern)
    └── SubComponent/
```

- Components that belong exclusively to a parent live inside that parent's `components/` folder.
- Shared/generic components go directly in `src/App/components/`.
- Icons are kept flat in `src/icons/` as self-contained SVG wrappers.

### 6. Styling (Tailwind CSS)

The project uses **Tailwind CSS v4** with the `@tailwindcss/vite` Vite plugin. It is imported in `src/index.css` via `@import "tailwindcss"`.

**Styling conventions:**

- Prefer Tailwind utility classes in JSX over writing custom CSS. Use `className` with Tailwind tokens for layout, spacing, typography, colors, borders, etc.
- Component-specific `.css` files are still allowed for complex styles that Tailwind can't express cleanly (e.g., CSS custom properties/theming, intricate pseudo-selectors, animations). But they are the exception, not the default.
- New components should start with Tailwind classes first; only create a `.css` file if Tailwind proves insufficient.
- The global `index.css` contains CSS custom property definitions (design tokens) and base element styles (body, a, code, button). Keep these global — do not scatter new design tokens across component `.css` files.
- When existing `.css` files contain styles that Tailwind utilities can replace, prefer refactoring to Tailwind classes and deleting the redundant CSS.

### 7. HuggingFace Model Downloads

The app uses `node-llama-cpp` to run GGUF models locally. Model download links appear in the UI when no model is loaded. The electron main process handles:

1. `loadLlama()` — initializes the llama runtime
2. `loadModel(path)` — loads a GGUF file with progress
3. `createContext()` — creates inference context
4. `createContextSequence()` — gets a context sequence
5. `chatSession.createChatSession()` — sets up the chat session with model functions

All operations use `withLock()` from `lifecycle-utils` to prevent concurrent mutations.

### 8. Type Sharing

Types flow from electron to src:

- `electron/state/llmState.ts` exports `LlmState`, `SimplifiedChatItem`, etc.
- `src/state/llmState.ts` imports these types
- `electron/rpc/llmRpc.ts` exports `ElectronFunctions`
- `src/rpc/llmRpc.ts` imports `ElectronFunctions` and exports `RenderedFunctions`

## Where to Write New Code

| What you're adding                                  | Where to put it                                                                                    |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| New AI tool function (e.g., `searchWeb`)            | `electron/llm/modelFunctions.ts`                                                                   |
| New LLM lifecycle step (e.g., `loadLora`)           | `electron/state/llmState.ts` — add to `llmFunctions` and update `LlmState` type                    |
| New renderer-callable function (e.g., `exportChat`) | `electron/rpc/llmRpc.ts` — add to `ElectronLlmRpc.functions`, then update `ElectronFunctions` type |
| New renderer-side handler (rare)                    | `src/rpc/llmRpc.ts` — add to `renderedFunctions`, update `RenderedFunctions` type                  |
| New UI component                                    | `src/App/components/<ComponentName>/<ComponentName>.tsx`                                           |
| New component sub-component                         | `src/App/components/<Parent>/components/<SubComponent>/`                                           |
| New React hook                                      | `src/hooks/`                                                                                       |
| New Zustand store                                   | `src/stores/<domain>Store.ts`                                                                      |
| New icon                                            | `src/icons/`                                                                                       |
| New state property                                  | `electron/state/llmState.ts` — add to `LlmState` type and initialize in `llmState`                 |
| New utility (either side)                           | `src/utils/` or `electron/utils/`                                                                  |
| New LLM capability folder                           | `electron/llm/` (e.g., `electron/llm/embeddings.ts`)                                               |

## Key Libraries

| Library           | Purpose                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `node-llama-cpp`  | Local LLM inference via llama.cpp bindings                                 |
| `birpc`           | Type-safe bi-directional RPC between Electron processes                    |
| `lifecycle-utils` | Observable state (`State<T>`) with change listeners and locks (`withLock`) |
| `electron-vite`   | Vite-based build tooling for Electron                                      |
| `zustand`         | Lightweight React state management for the renderer                        |
| `React`           | UI framework (renderer process only)                                       |
| `tailwindcss`     | Utility-first CSS framework (v4, via `@tailwindcss/vite` Vite plugin)      |
| `classnames`      | Conditional CSS class joining                                              |

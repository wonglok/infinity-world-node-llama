# Project Architecture Study

## Overview

This is an Electron + Vite desktop app that runs LLMs locally via `node-llama-cpp`. It has a React frontend (renderer process) and a Node.js backend (Electron main process). The two processes communicate through bi-directional RPC (birpc) over Electron IPC.

## Folder Structure

```
project-root/
├── src/                          # Renderer process (React frontend)
│   ├── index.tsx                 # Entry point - mounts React app with AppRouter
│   ├── index.html                # HTML shell
│   ├── index.css                 # Global styles + Tailwind CSS import
│   ├── Router/                   # React Router configuration
│   │   └── router.tsx            #   HashRouter with all route definitions
│   ├── App/                      # Root React component (chat page)
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
│   │       ├── MarkdownContent/  #   Markdown content display
│   │       └── SetupHome/        #   Setup page: model download/selection
│   │           └── SetupHome.tsx
│   ├── state/                    # Renderer-side state mirror
│   │   └── llmState.ts           #   Mirrors electron/state/llmState.ts
│   ├── rpc/                      # RPC client (calls electron functions)
│   │   └── llmRpc.ts             #   Defines renderer functions + creates birpc
│   ├── hooks/                    # React hooks
│   │   └── useExternalState.ts   #   Subscribe to lifecycle-utils State in React
│   ├── stores/                   # Zustand stores (React state management)
│   │   └── <domain>Store.ts      #   One store per domain concern
│   ├── utils/                    # Renderer utilities
│   │   └── createRendererSideBirpc.ts  # birpc factory (IPC -> renderer)
│   └── icons/                    # SVG icon components (*IconSVG.tsx)
│
├── electron/                     # Main process (Electron/Node.js backend)
│   ├── index.ts                  # Entry point - creates BrowserWindow, registers RPC
│   ├── preload.ts                # Context bridge - exposes ipcRenderer to renderer
│   ├── llm/                      # LLM-related logic
│   │   └── modelFunctions.ts     #   AI tool functions (getDate, getTime, getWeather)
│   ├── state/                    # Central state (source of truth)
│   │   └── llmState.ts           #   State type + LLM lifecycle (load, prompt, pull, etc.)
│   ├── rpc/                      # RPC server (handles renderer calls)
│   │   └── llmRpc.ts             #   ElectronLlmRpc class: electron functions + state sync
│   └── utils/                    # Electron utilities
│       └── createElectronSideBirpc.ts  # birpc factory (IPC <-> renderer)
│
├── public/                       # Static assets
├── models/                       # Local GGUF model files (download destination)
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
electron/state/llmState.ts  --push-->  src/state/llmState.ts
       ^                                    |
  (source of truth)                   (mirror + React subscriptions)
```

- The **electron side** owns the state — it defines the `LlmState` type and creates the canonical `State` object.
- State is pushed from electron to renderer via `birpc`: `electron -> rendererLlmRpc.updateState(state) -> llmState.state = state`
- The **renderer side** imports the `LlmState` type and creates its own `State` object initialized with defaults. It never mutates state directly — it only receives updates from electron.
- React components subscribe via `useExternalState(llmState)` which uses `state.createChangeListener()`.

### 4. RPC Pattern (bi-directional via birpc)

Two birpc channels are created, both named `"llmRpc"`:

| Direction           | Factory                                        | Transport                             |
| ------------------- | ---------------------------------------------- | ------------------------------------- |
| Renderer -> Electron | `createElectronSideBirpc` in `electron/utils/` | `ipcMain.on` / `webContents.send`     |
| Electron -> Renderer | `createRendererSideBirpc` in `src/utils/`      | `ipcRenderer.send` / `ipcRenderer.on` |

**Naming convention for the RPC function types:**

- `ElectronFunctions` — functions the renderer can call on the electron side (defined in `electron/rpc/llmRpc.ts`)
- `RenderedFunctions` — functions the electron side can call on the renderer (defined in `src/rpc/llmRpc.ts`)

The only renderer function is `updateState(state)` — everything else flows renderer->electron.

### 5. Routing (React Router HashRouter)

The app uses `react-router-dom` with `HashRouter` (required for Electron since the renderer loads via `file://` protocol, which doesn't support HTML5 history API). Routes are defined in `src/Router/router.tsx`:

| Route    | Component    | Purpose                                |
| -------- | ------------ | -------------------------------------- |
| `/`      | `SetupHome`  | Model download and selection           |
| `/chat`  | `App`        | Main chat interface                    |

Navigation flows:
- First launch -> `/` (SetupHome) to choose/download a model
- Model loaded -> auto-navigate to `/chat`
- No model loaded in `/chat` -> shows "Back to Setup" button
- Header "Load" button still allows manual local file selection at any time

### 6. Component Organization

Each UI component gets its own folder under `src/App/components/`:

```
ComponentName/
├── ComponentName.tsx    # Component code
├── ComponentName.css    # Component styles (optional — Tailwind-first)
└── components/          # Sub-components (recursive pattern)
    └── SubComponent/
```

- Components that belong exclusively to a parent live inside that parent's `components/` folder.
- Shared/generic components go directly in `src/App/components/`.
- Icons are kept flat in `src/icons/` as self-contained SVG wrappers.

### 7. Styling (Tailwind CSS)

The project uses **Tailwind CSS v4** with the `@tailwindcss/vite` Vite plugin. It is imported in `src/index.css` via `@import "tailwindcss"`.

**Styling conventions:**
- Prefer Tailwind utility classes in JSX over writing custom CSS. Use `className` with Tailwind tokens for layout, spacing, typography, colors, borders, etc.
- Component-specific `.css` files are still allowed for complex styles that Tailwind can't express cleanly (e.g., CSS custom properties/theming, intricate pseudo-selectors, animations). But they are the exception, not the default.
- New components should start with Tailwind classes first; only create a `.css` file if Tailwind proves insufficient.
- The global `index.css` contains CSS custom property definitions (design tokens) and base element styles (body, a, code, button). Keep these global — do not scatter new design tokens across component `.css` files.
- When existing `.css` files contain styles that Tailwind utilities can replace, prefer refactoring to Tailwind classes and deleting the redundant CSS.

### 8. Model Download Flow

The app supports two ways to load a model:

**A. Download via URI (SetupHome page):**
1. User picks a model URI from the SetupHome page (e.g., `hf:giladgd/gemma-4-E2B-it-GGUF:Q8_0`)
2. Models are downloaded to the directory in `llmState.modelsDirectory` (defaults to `<appData>/infinity-world/models`). User can change this via the "Change directory" button.
3. Renderer calls `electronLlmRpc.pullModel(uri)`
4. Electron uses `resolveModelFile()` from `node-llama-cpp` to download the model to the configured directory
5. Download progress is tracked in `llmState.state.modelDownload` (totalSize, downloadedSize)
6. Once downloaded, the model is automatically loaded (loadLlama -> loadModel -> createContext -> createContextSequence -> createChatSession)
7. SetupHome detects `state.model.loaded` and navigates to `/chat`

**B. Open local file (Header button):**
1. User clicks the load button in the Header
2. Electron opens a native file dialog filtered to `.gguf` files, defaulting to `modelsDirectory`
3. Selected file path is set as `selectedModelFilePath`, then the model load chain runs

### 9. Type Sharing

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
| New route/page                                       | `src/Router/router.tsx` — add `<Route>`, create page component in `src/App/components/`             |
| New UI component                                    | `src/App/components/<ComponentName>/<ComponentName>.tsx`                                           |
| New component sub-component                         | `src/App/components/<Parent>/components/<SubComponent>/`                                           |
| New React hook                                      | `src/hooks/`                                                                                       |
| New Zustand store                                   | `src/stores/<domain>Store.ts`                                                                      |
| New icon                                            | `src/icons/`                                                                                       |
| New state property                                  | `electron/state/llmState.ts` — add to `LlmState` type and initialize in `llmState`; mirror in `src/state/llmState.ts` |
| New utility (either side)                           | `src/utils/` or `electron/utils/`                                                                  |
| New LLM capability folder                           | `electron/llm/` (e.g., `electron/llm/embeddings.ts`)                                               |

## Key Libraries

| Library            | Purpose                                                                   |
| ------------------ | ------------------------------------------------------------------------- |
| `node-llama-cpp`   | Local LLM inference via llama.cpp bindings                                |
| `birpc`            | Type-safe bi-directional RPC between Electron processes                   |
| `lifecycle-utils`  | Observable state (`State<T>`) with change listeners and locks (`withLock`)|
| `electron-vite`    | Vite-based build tooling for Electron                                     |
| `react-router-dom` | Client-side routing (HashRouter for Electron file:// compatibility)       |
| `zustand`          | Lightweight React state management for the renderer                       |
| `tailwindcss`      | Utility-first CSS framework (v4, via `@tailwindcss/vite` Vite plugin)     |
| `React`            | UI framework (renderer process only)                                      |
| `classnames`       | Conditional CSS class joining                                             |

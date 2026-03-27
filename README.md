# Timetable Admin (Next.js)

This project is a timetable management app built with Next.js (App Router), React, and TypeScript.
It helps you:

- Manage teachers, subjects, grades, and course mappings
- Build timetables manually (drag/drop and click)
- Auto-allocate lessons using rule-aware heuristics
- Review conflicts and export schedule data
- Sync one shared workspace (when Redis env vars are configured)

## How The Project Works

### Main pages

- `src/app/builder/page.tsx`: Timetable builder UI
- `src/app/teachers/page.tsx`: Teacher read-only schedule view
- `src/app/course-mapping/page.tsx`: Course-to-grade/teacher mapping
- `src/app/conflicts/page.tsx`: Conflict visibility
- `src/app/settings/page.tsx`: Rules and data operations
- `src/app/export/page.tsx`: Export flows

### State and domain

- `src/state/AppStateProvider.tsx`: Global app state provider
- `src/state/reducer.ts`: Reducer handling all state actions
- `src/state/types.ts`: Core types (`AppState`, `Entry`, actions)
- `src/state/storage.ts`: localStorage persistence helpers
- `src/domain/validate.ts`: Placement validation rules
- `src/domain/autoAllocate.ts`: Auto-allocation logic
- `src/domain/conflicts.ts`: Conflict detection

### Rules currently enforced during placement

- Cannot place into locked/break/lunch slots
- Teacher cannot be double-booked in the same day+time
- Mapping required periods cannot be exceeded
- Teacher max weekly hours cannot be exceeded

### Shared workspace (Redis)

If Redis env vars are present, the app uses server sync through `src/app/api/workspace/route.ts` so all users share the same workspace.

Supported env names:

- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- or integration-prefixed vars:
  - `timetable_shared_workspace_v1_KV_REST_API_URL`
  - `timetable_shared_workspace_v1_KV_REST_API_TOKEN`

If not configured, the app falls back to local browser storage only.

## Local Development

### Install dependencies

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Quality checks

```bash
npm run test
npm run lint
npm run build
```

## Save Changes, Commit, And Push To Origin

Use this workflow every time you finish a task.

### 1) Save your files

- In Cursor/VS Code: `Ctrl + S` on changed files
- Optional: `File > Save All`

### 2) Review what changed

```bash
git status
git diff
```

### 3) Stage files

```bash
git add .
```

Or stage specific files:

```bash
git add src/app/builder/BuilderClient.tsx src/domain/autoAllocate.ts
```

### 4) Commit

```bash
git commit -m "Add auto allocation and draggable timetable correction"
```

### 5) Push to origin

If branch is already connected:

```bash
git push
```

If this is the first push for the branch:

```bash
git push -u origin <your-branch-name>
```

### 6) Verify remote

```bash
git status
git branch -vv
```

You should see your branch up to date with `origin/<branch>`.

## Deploy

Push to your deployment branch (for example `main`) and let Vercel build/deploy.
Make sure production env vars are set in Vercel before expecting shared workspace sync.

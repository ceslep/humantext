# AGENTS.md

## Quick Start

```bash
npm install
# Create .env.local with GEMINI_API_KEY
npm run dev
```

App runs at http://localhost:3000

## Commands

- `npm run dev` - Start Vite dev server (port 3000)
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Configuration

- Environment variables loaded from `.env.local` at runtime
- `vite.config.ts` exposes `OPENROUTER_API_KEY` to client via `process.env.OPENROUTER_API_KEY`
- Create `.env.local` with: `OPENROUTER_API_KEY=your_key_here`

## Project Structure

- **App.tsx** - Main application component
- **components/** - UI components (TextArea, Button)
- **services/geminiService.ts** - Google Gemini API integration
- **types.ts** - TypeScript type definitions

## Notes

- No test framework configured
- No lint/typecheck scripts
- Tailwind CSS loaded via CDN (not npm package)
- React and @google/genai loaded via import maps from aistudiocdn.com
- Language is Spanish (UI labels, error messages)
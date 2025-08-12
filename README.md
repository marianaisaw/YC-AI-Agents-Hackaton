# React + Vite

I am write:

{active === 'profile' && (
<div className="glass rounded-2xl p-6 md:p-8">
<div className="text-xl mb-4" style={{fontFamily:'Space Grotesk, ui-sans-serif, system-ui'}}>Startup profile</div>
<div className="grid md:grid-cols-2 gap-4 text-sm">
<Field label="Startup name" value={profile.startupName || '—'} />
<Field label="Brand tone" value={profile.brandTone || '—'} />
<Field label="LinkedIn" value={profile.linkedin || '—'} />
<Field label="Problem" value={profile.problem || '—'} />
<Field label="Solution" value={profile.solution || '—'} />
<Field label="Launch timeframe" value={profile.launchWeeks ? `${profile.launchWeeks} weeks` : '—'} />
<Field label="Milestones" value={profile.milestones || '—'} full />
<Field label="Extra notes" value={profile.notes || '—'} full />
</div>
</div>
)}

Guys, this is general information about the tech stack for the frontend:

### Tech stack overview

- **Runtime/UI**: React 19 (`react`, `react-dom`) with `StrictMode`
- **Routing**: React Router v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Build tool**: Vite 7 with `@vitejs/plugin-react` (fast dev server, ESM, HMR)
- **Styling**: Tailwind CSS v4 (utility-first) + PostCSS; custom design tokens in `src/index.css`
- **Animation**: Framer Motion (available; integrate in components as needed)





## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

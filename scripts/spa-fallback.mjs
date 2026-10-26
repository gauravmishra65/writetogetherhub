// GitHub Pages has no server-side rewrites, so a React Router site would 404 on a
// refresh or a direct link to /about, /reset-password?token_hash=… and so on.
// Fix: after `vite build`, give every known route its own index.html (served with
// a normal 200) and publish 404.html for the rest (e.g. /feedback-corner/:id),
// which Pages serves for any unknown path.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const index = join(dist, 'index.html');
if (!existsSync(index)) {
  throw new Error('dist/index.html not found - run `npm run build` first');
}

// Keep in step with the <Route path="…"> list in src/App.tsx.
const routes = [
  'about',
  'start-here',
  'writer-forum',
  'feedback-corner',
  'publishing-help',
  'free-resources',
  'weekly-challenges',
  'community-rules',
  'join',
  'contact',
  'register',
  'login',
  'member',
  'reset-password',
  'admin',
  'admin/login',
  'admin/approvals',
  'admin/members',
  'admin/logins',
  'admin/testimonials',
];

copyFileSync(index, join(dist, '404.html'));
for (const route of routes) {
  const dir = join(dist, route);
  mkdirSync(dir, { recursive: true });
  copyFileSync(index, join(dir, 'index.html'));
}
console.log(`spa-fallback: wrote 404.html and ${routes.length} route pages`);

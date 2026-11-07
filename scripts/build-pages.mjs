import { cp, mkdir, writeFile } from 'node:fs/promises';

// Keep the root build usable and publish a real directory for the shared URL.
await mkdir('dist/huadiweilao', { recursive: true });
await cp('dist/index.html', 'dist/huadiweilao/index.html');
await cp('dist/assets', 'dist/huadiweilao/assets', { recursive: true });
await writeFile('dist/_redirects', '/huadiweilao /huadiweilao/ 301\n', 'utf8');

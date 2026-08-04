import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve('dist');
const files = [];

const walk = async (directory) => {
  for (const entry of await readdir(directory)) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) await walk(path);
    else files.push(path);
  }
};

await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const problems = [];

const checkLocalTarget = async (file, target) => {
  if (!target.startsWith('/') || target.startsWith('//')) return;
  const local = target.endsWith('/') ? join(root, target, 'index.html') : join(root, target);
  try {
    await stat(local);
  } catch {
    problems.push(`${file.replace(root, '')}: ${target}`);
  }
};

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    await checkLocalTarget(file, match[1]);
  }
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const target = candidate.trim().split(/\s+/)[0];
      await checkLocalTarget(file, target);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${htmlFiles.length}ページの内部リンクと画像参照を確認しました。`);
}

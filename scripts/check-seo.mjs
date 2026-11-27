import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const origin = 'https://mimosusogawa.com';
const requiredPaths = [
  '/', '/park-guide/', '/history/', '/access/', '/itineraries/',
  '/kanmon-tunnel/', '/food/', '/photo-spots/', '/faq/'
];

const errors = [];
const forbiddenMixedLanguageText = [
  '同步自 Google', '谷歌地图用户评价', '评分与评价数',
  '点击查看谷歌', '版权归原作者', '連絡船で闭环',
  '亲子家庭', '摄影自然', '低体力无障碍', '访客のために',
  '同步时间', '資料来源'
];

const read = async (file) => {
  try {
    return await readFile(file, 'utf8');
  } catch {
    errors.push(`ファイルがありません: ${file}`);
    return '';
  }
};

const sitemap = await read(join('dist', 'sitemap.xml'));
const robots = await read(join('dist', 'robots.txt'));

for (const path of requiredPaths) {
  const relative = path === '/' ? '' : path.slice(1);
  const html = await read(join('dist', relative, 'index.html'));
  if (!html) continue;

  const expectedCanonical = `${origin}${path}`;
  const canonicalTags = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => /\brel=["']canonical["']/i.test(tag));
  const canonical = canonicalTags[0]?.match(/\bhref=["']([^"']+)["']/i)?.[1];

  if (canonicalTags.length !== 1 || canonical !== expectedCanonical) {
    errors.push(`${path}: canonical が不正です (${canonical ?? 'なし'})`);
  }
  if (!/<html\b[^>]*\blang=["']ja["']/i.test(html)) {
    errors.push(`${path}: <html lang="ja"> がありません`);
  }
  if (!/<title>[^<]+<\/title>/i.test(html)) {
    errors.push(`${path}: title がありません`);
  }
  if (!/<meta\b[^>]*\bname=["']description["']/i.test(html)) {
    errors.push(`${path}: meta description がありません`);
  }
  if ([...html.matchAll(/<h1\b/gi)].length !== 1) {
    errors.push(`${path}: h1 は一つ必要です`);
  }
  if (/<meta\b[^>]*\bcontent=["'][^"']*noindex/i.test(html)) {
    errors.push(`${path}: noindex が検出されました`);
  }
  for (const phrase of forbiddenMixedLanguageText) {
    if (html.includes(phrase)) {
      errors.push(`${path}: 日本語ページに中国語が混在しています (${phrase})`);
    }
  }
  if (!sitemap.includes(`<loc>${expectedCanonical}</loc>`)) {
    errors.push(`${path}: sitemap.xml に URL がありません`);
  }
}

const notFoundHtml = await read(join('dist', '404.html'));
if (!/<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(notFoundHtml)) {
  errors.push('404.html: robots noindex がありません');
}
if (/<link\b[^>]*\brel=["']canonical["']/i.test(notFoundHtml)) {
  errors.push('404.html: エラーページに canonical は不要です');
}

if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) {
  errors.push('robots.txt に正規サイトマップ URL がありません');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`SEO 検証完了: ${requiredPaths.length} ページの canonical、title、言語、sitemap、robots を確認しました。`);
}


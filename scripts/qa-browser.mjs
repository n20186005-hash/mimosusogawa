const endpoint = process.env.MIMOSUSOGAWA_CDP || 'http://127.0.0.1:9223';
const pages = await fetch(`${endpoint}/json/list`).then((response) => response.json());
const page = pages.find((item) => item.type === 'page');

if (!page) throw new Error('確認対象のページが見つかりません。');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++commandId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return result.result.value;
};

await send('Runtime.enable');
await send('Page.enable');
const targetUrl = process.env.MIMOSUSOGAWA_PAGE_URL;
if (targetUrl) {
  await send('Page.navigate', { url: targetUrl });
}
if (process.env.MIMOSUSOGAWA_VIEWPORT_WIDTH) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: Number(process.env.MIMOSUSOGAWA_VIEWPORT_WIDTH),
    height: Number(process.env.MIMOSUSOGAWA_VIEWPORT_HEIGHT || 844),
    deviceScaleFactor: 1,
    mobile: Number(process.env.MIMOSUSOGAWA_VIEWPORT_WIDTH) <= 720
  });
  await send('Page.reload', { ignoreCache: true });
}
let pageReady = false;
for (let attempt = 0; attempt < 150; attempt += 1) {
  const state = await evaluate(`({
    ready: document.readyState === 'complete',
    hasHeader: Boolean(document.querySelector('[data-header]')),
    targetMatches: ${targetUrl ? `location.href.startsWith(${JSON.stringify(targetUrl)})` : 'true'}
  })`);
  if (state.ready && state.hasHeader && state.targetMatches) {
    pageReady = true;
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
}
if (!pageReady) throw new Error('対象ページの読み込み完了を確認できませんでした。');
const initial = await evaluate(`(() => {
  const menu = document.querySelector('[data-menu-toggle]');
  const title = document.querySelector('.home-hero h1');
  const heroImage = document.querySelector('.home-hero__image, .page-hero > img');
  return {
    viewport: [innerWidth, innerHeight],
    documentWidth: document.documentElement.scrollWidth,
    menu: menu ? {
      display: getComputedStyle(menu).display,
      color: getComputedStyle(menu).color,
      rect: menu.getBoundingClientRect().toJSON()
    } : null,
    title: title ? title.getBoundingClientRect().toJSON() : null,
    heroImage: heroImage ? {
      currentSrc: heroImage.currentSrc,
      naturalWidth: heroImage.naturalWidth,
      naturalHeight: heroImage.naturalHeight
    } : null,
    pageTitle: document.title,
    japaneseLang: document.documentElement.lang === 'ja'
  };
})()`);

const interactions = await evaluate(`(async () => {
  const menu = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-menu]');
  const canOpenMenu = Boolean(menu && getComputedStyle(menu).display !== 'none');
  if (canOpenMenu) menu.click();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const menuOpened = Boolean(panel && !panel.hidden && menu.getAttribute('aria-expanded') === 'true');
  const menuFocusMoved = Boolean(panel && panel.contains(document.activeElement));
  const backgroundInert = Boolean(document.querySelector('main')?.inert);
  if (menuOpened) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  const plannerButton = document.querySelector('[data-plan-button="standard"]');
  if (plannerButton) plannerButton.click();
  return {
    menuOpened,
    menuFocusMoved,
    backgroundInert,
    menuClosed: canOpenMenu ? Boolean(panel && panel.hidden && menu.getAttribute('aria-expanded') === 'false') : true,
    menuFocusReturned: canOpenMenu ? document.activeElement === menu : true,
    plannerChanged: document.querySelector('[data-plan-time]')?.textContent === '90分',
    plannerPressed: plannerButton?.getAttribute('aria-pressed') === 'true'
  };
})()`);

if (process.env.MIMOSUSOGAWA_SCREENSHOT) {
  if (process.env.MIMOSUSOGAWA_KEEP_MENU) {
    await evaluate('document.querySelector("[data-menu-toggle]")?.click()');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (process.env.MIMOSUSOGAWA_SCROLL_Y) {
    await evaluate(`scrollTo(0, ${Number(process.env.MIMOSUSOGAWA_SCROLL_Y)})`);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  const capture = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const { writeFile } = await import('node:fs/promises');
  await writeFile(process.env.MIMOSUSOGAWA_SCREENSHOT, Buffer.from(capture.data, 'base64'));
}

console.log(JSON.stringify({ initial, interactions }, null, 2));
socket.close();

import { beijingDate, publishedEntries } from './logic.mjs';

const app = document.querySelector('#app');
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const saveIcon = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>';
const copyIcon = '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="13" rx="1"/><path d="M15 8V3H3v13h5"/></svg>';
let entries = [];
let toastTimer;
let displayedDate = beijingDate();
let momentCleanup;

function toast(message) {
  const node = document.querySelector('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('visible'), 4000);
}

function weekday(date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' })
    .format(new Date(date + 'T00:00:00Z'));
}

function photo(entry, lazy = false) {
  return '<img src="' + escape(entry.image) + '" alt="' + escape(entry.imageAlt) +
    '" width="1200" height="800" data-source="library-057" data-subject="landscape" style="object-position:' +
    escape(entry.imageFocus || '50% 50%') + '" decoding="async" ' +
    (lazy ? 'loading="lazy"' : 'fetchpriority="high"') + '>';
}

function renderArchive(published) {
  document.title = 'Past notes · Daily Glimmer';
  app.innerHTML = '<section class="wrap archive"><div class="page-title"><h1>Past notes</h1><p>' +
    published.length + ' days of words and landscapes</p></div><div class="archive-grid">' +
    published.map(entry => '<a class="entry" href="#/day/' + entry.id +
      '"><div class="entry-photo">' + photo(entry, true) + '</div><div class="entry-meta"><time>' +
      entry.publishDate + '</time><span>' + escape(entry.theme) + '</span></div><p>' +
      escape(entry.quote) + '</p></a>').join('') + '</div></section>';
}

function renderCredits() {
  const unique = [...new Map(entries.map(entry => [entry.image, entry])).values()];
  document.title = 'Photo credits & licenses · Daily Glimmer';
  app.innerHTML = '<section class="wrap credits"><h1>Photo credits & licenses</h1>' +
    '<p>Photographs sourced from Wikimedia Commons and bundled with Taste Skill. Images are cropped for display; each image and its crop follow the original license. Credits and source links are listed below.</p>' +
    unique.map(entry => '<article><h2>' + escape(entry.imageAlt) + '</h2><p>Photo by ' +
      escape(entry.imageAuthor) + ' · ' + escape(entry.imageLicense) +
      '</p><div class="license-links"><a href="' + escape(entry.imageSourceUrl) +
      '" target="_blank" rel="noopener">Original photo</a><a href="' + escape(entry.imageLicenseUrl) +
      '" target="_blank" rel="noopener">License terms</a><a href="' + escape(entry.image) +
      '" target="_blank">Local image</a></div></article>').join('') +
    '<p>Quotes are original, AI-assisted writing. Sample content is subject to editorial review.</p></section>';
}

function renderDaily(entry, published, detail) {
  const [year, month, day] = entry.publishDate.split('-');
  const index = published.findIndex(item => item.id === entry.id);
  const older = published[index + 1];
  const newer = published[index - 1];
  document.title = entry.publishDate + ' · Daily Glimmer';
  app.innerHTML = '<section class="wrap daily hero" data-enter><div class="edition"><div class="edition-kicker">A LITTLE LIGHT FOR TODAY</div><time datetime="' + entry.publishDate + '">' +
    new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(entry.publishDate+'T00:00:00Z')) + '</time></div><div class="daily-grid">' +
    '<div class="reading"><div class="date-block"><span class="date-day">' + day +
    '</span><div class="date-month">' + weekday(entry.publishDate) + '<br>' +
    new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(entry.publishDate+'T00:00:00Z')) + '</div></div><p class="theme">' + escape(entry.theme) +
    '</p><blockquote class="quote">' + escape(entry.quote) +
    '</blockquote><p class="text-source">' + escape(entry.textSource) +
    '</p><div class="btn-row"><button class="btn btn--primary" id="save">' + saveIcon +
    'Save this note</button><button class="btn btn--secondary" id="copy">' + copyIcon +
    'Copy quote</button></div></div><figure class="photo-frame" data-moment="picture-develops" data-moment-opts=\'{"look":"film"}\'>' +
    photo(entry) + '</figure></div><div class="action-row"><h2>A small thing to try</h2><p>' +
    escape(entry.action) + '</p></div><nav class="day-nav" aria-label="More daily notes">' +
    (older ? '<a href="#/day/' + older.id + '">← Earlier · ' + older.publishDate.slice(5).replace('-', ' / ') + '</a>' : '<span>You’re at the first note</span>') +
    '<a href="#/archive">Browse past notes</a>' +
    (newer ? '<a href="#/day/' + newer.id + '">Later · ' + newer.publishDate.slice(5).replace('-', ' / ') + '</a>' : '<span>A little light, every day</span>') +
    '</nav></section>';
  document.querySelector('#copy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(entry.quote + '\n— Daily Glimmer');
      toast('Copied to clipboard');
    } catch {
      toast('Couldn’t copy. Please select and copy the quote manually.');
    }
  };
  document.querySelector('#save').onclick = () => savePoster(entry);
  const frame = app.querySelector('[data-moment]');
  import('./assets/moments/moments.js').then(async module => {
    if (!frame.isConnected) return;
    await module.mountAll(frame.parentElement);
    momentCleanup = () => module.unmountAll(frame.parentElement || frame);
  }).catch(() => { frame.classList.add('mo-safe'); });
}

function render() {
  if (momentCleanup) { momentCleanup(); momentCleanup = null; }
  const published = publishedEntries(entries, beijingDate());
  const route = location.hash.slice(1).split('/').filter(Boolean).join('/');
  for (const [id, selected] of [['todayNav', !route || route === 'content'], ['archiveNav', route === 'archive']]) {
    const link = document.getElementById(id);
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (route === 'archive') renderArchive(published);
  else if (route === 'credits') renderCredits();
  else {
    const detail = route.startsWith('day/');
    const entry = detail ? published.find(item => item.id === route.slice(4)) :
      ((!route || route === 'content') ? published[0] : null);
    if (entry) renderDaily(entry, published, detail);
    else app.innerHTML = '<div class="wrap empty"><h1>This note isn’t available yet.</h1><a href="#/">Back to today</a></div>';
  }
  app.querySelectorAll('img').forEach(img => {
    const fail = () => { img.style.visibility = 'hidden'; img.parentElement.setAttribute('aria-label', 'Landscape image unavailable'); };
      img.addEventListener('error', fail, { once: true });
    if (img.complete && !img.naturalWidth) fail();
  });
}

function linesFor(ctx, text, width) {
  const lines = [];
  let line = '';
  for (const character of text) {
    if (line && ctx.measureText(line + character).width > width) { lines.push(line); line = character; }
    else line += character;
  }
  if (line) lines.push(line);
  return lines;
}

async function savePoster(entry) {
  const button = document.querySelector('#save');
  button.disabled = true;
  button.textContent = 'Creating…';
  try {
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    const ctx = canvas.getContext('2d');
    ctx.font = '44px "Newsreader", "SimSun", serif';
    const quoteLines = linesFor(ctx, entry.quote, 920);
    ctx.font = '20px sans-serif';
    const creditLines = linesFor(ctx, 'Photo: ' + entry.imageAuthor + ' / ' + entry.imageLicense + ' / cropped', 920);
    const sourceLines = linesFor(ctx, entry.imageSourceUrl, 920);
    const licenseLines = linesFor(ctx, entry.imageLicenseUrl, 920);
    canvas.height = 1050 + quoteLines.length * 76 + (creditLines.length + sourceLines.length + licenseLines.length) * 27;
    ctx.fillStyle = '#efe9e0'; ctx.fillRect(0, 0, 1080, canvas.height);
    ctx.fillStyle = '#22261f'; ctx.font = '30px "Newsreader", serif'; ctx.fillText('Daily Glimmer', 64, 70);
    ctx.font = '22px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(entry.publishDate + ' · ' + weekday(entry.publishDate), 1016, 70); ctx.textAlign = 'left';
    const gradient = ctx.createLinearGradient(64, 110, 1016, 750);
    gradient.addColorStop(0, '#b8c3b3'); gradient.addColorStop(1, '#ded3bf');
    ctx.fillStyle = gradient; ctx.fillRect(64, 110, 952, 640);
    try {
      const img = new Image(); img.src = entry.image; await img.decode();
      const scale = Math.max(952 / img.naturalWidth, 640 / img.naturalHeight);
      const width = img.naturalWidth * scale, height = img.naturalHeight * scale;
      ctx.save(); ctx.beginPath(); ctx.rect(64, 110, 952, 640); ctx.clip();
      ctx.drawImage(img, 64 + (952 - width) / 2, 110 + (640 - height) / 2, width, height); ctx.restore();
    } catch { /* The same gradient fallback is available in the downloaded poster. */ }
    ctx.fillStyle = '#2e5b44'; ctx.font = '24px sans-serif'; ctx.fillText(entry.theme, 80, 810);
    ctx.fillStyle = '#22261f'; ctx.font = '44px "Newsreader", "SimSun", serif';
    quoteLines.forEach((line, index) => ctx.fillText(line, 80, 885 + index * 76));
    let y = 925 + quoteLines.length * 76;
    ctx.fillStyle = '#5a5c53'; ctx.font = '23px sans-serif'; ctx.fillText('Original writing · AI-assisted', 80, y);
    y += 45; ctx.font = '20px sans-serif';
    for (const line of [...creditLines, ...sourceLines, ...licenseLines]) { ctx.fillText(line, 80, y); y += 27; }
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('PNG export failed');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'daily-glimmer-' + entry.publishDate + '.png';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('Your note is ready to download');
  } catch { toast('Couldn’t save the image. Please try again.'); }
  finally { button.disabled = false; button.innerHTML = saveIcon + 'Save this note'; }
}

try {
  const response = await fetch('./content.json');
  if (!response.ok) throw new Error('Content unavailable');
  entries = await response.json();
  render();
  import('./assets/motion/motion.js').catch(() => {});
} catch { app.innerHTML = '<p class="empty">Couldn’t load today’s note. Please refresh and try again.</p>'; }
addEventListener('hashchange', () => { render(); if (location.hash !== '#content') scrollTo(0, 0); });
setInterval(() => {
  const date = beijingDate();
  if (date !== displayedDate) { displayedDate = date; render(); }
}, 10000);

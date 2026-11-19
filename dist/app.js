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

const posterPrefs = (() => {
  try { return JSON.parse(localStorage.getItem('daily-glimmer-poster') || '{}'); } catch { return {}; }
})();
const posterPalettes = {
  paper:{label:'Warm paper',bg:'#efe9e0',ink:'#22261f',accent:'#2e5b44',photo:'#b8c3b3'},
  ocean:{label:'Coastal blue',bg:'#e5eef0',ink:'#17323c',accent:'#287b83',photo:'#adc9cf'},
  sunset:{label:'Soft terracotta',bg:'#f2e3d5',ink:'#482d28',accent:'#bd5a3c',photo:'#d8aa8e'},
  night:{label:'Deep forest',bg:'#172723',ink:'#f3f0e8',accent:'#d5a86d',photo:'#314b42'}
};
const posterLayouts = {
  photo:{label:'Photo first',mode:'photo'},
  quote:{label:'Quote first',mode:'quote'},
  full:{label:'Full-bleed image',mode:'full'}
};
const posterElements = {image:true,quote:true,date:true,theme:true,action:true,brand:true,credit:true};

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
    '</blockquote><div class="btn-row"><button class="btn btn--primary" id="save">' + saveIcon +
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
  document.querySelector('#save').onclick = () => openPosterEditor(entry);
  const frame = app.querySelector('[data-moment]');
  import('./assets/moments/moments.js').then(async module => {
    if (!frame.isConnected) return;
    await module.mountAll(frame.parentElement);
    momentCleanup = () => module.unmountAll(frame.parentElement || frame);
  }).catch(() => { frame.classList.add('mo-safe'); });
}

function openPosterEditor(entry) {
  document.querySelector('.poster-editor')?.remove();
  const editor=document.createElement('section');
  editor.className='poster-editor wrap';
  const palette=posterPrefs.palette||'paper', layout=posterLayouts[posterPrefs.layout]?posterPrefs.layout:'photo';
  editor.innerHTML='<div class="poster-editor-head"><div><span>YOUR POSTER</span><h2>Make it yours</h2><p>Your choices are saved in this browser.</p></div><button class="poster-editor-close" aria-label="Close editor">×</button></div>'+
    '<div class="poster-editor-grid"><div class="poster-controls"><fieldset><legend>Layout</legend><div class="poster-choice-row">'+Object.entries(posterLayouts).map(([id,o])=>'<button type="button" class="poster-choice '+(id===layout?'selected':'')+'" data-layout="'+id+'"><span class="layout-thumb layout-thumb--'+id+'"><i></i><b></b></span><strong>'+o.label+'</strong></button>').join('')+'</div></fieldset>'+
    '<fieldset class="palette-fieldset"><legend>Color palette</legend><div class="palette-row">'+Object.entries(posterPalettes).map(([id,o])=>'<button type="button" class="palette-choice '+(id===palette?'selected':'')+'" data-palette="'+id+'"><i style="background:'+o.bg+';--swatch:'+o.accent+'"></i>'+o.label+'</button>').join('')+'</div></fieldset>'+
    '<button class="btn btn--primary poster-download">'+saveIcon+'Download PNG</button></div><div class="poster-preview"><canvas width="420" height="560" aria-label="Live poster preview"></canvas></div></div>';
  app.append(editor);
  const canvas=editor.querySelector('canvas');
  const syncPaletteAvailability=()=>{
    const disabled=posterPrefs.layout==='full';
    editor.querySelector('.palette-fieldset').hidden=disabled;
  };
  const paint=()=>drawPoster(canvas,entry,posterPrefs.palette||'paper',posterLayouts[posterPrefs.layout]?posterPrefs.layout:'photo');
  editor.querySelector('.poster-editor-close').onclick=()=>editor.remove();
  editor.querySelectorAll('[data-palette]').forEach(b=>b.onclick=()=>{posterPrefs.palette=b.dataset.palette;localStorage.setItem('daily-glimmer-poster',JSON.stringify(posterPrefs));editor.querySelectorAll('[data-palette]').forEach(x=>x.classList.toggle('selected',x===b));paint()});
  editor.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{posterPrefs.layout=b.dataset.layout;localStorage.setItem('daily-glimmer-poster',JSON.stringify(posterPrefs));editor.querySelectorAll('[data-layout]').forEach(x=>x.classList.toggle('selected',x===b));syncPaletteAvailability();paint()});
  editor.querySelector('.poster-download').onclick=()=>savePoster(entry,posterPrefs.palette||'paper',posterLayouts[posterPrefs.layout]?posterPrefs.layout:'photo');
  syncPaletteAvailability();
  paint(); editor.scrollIntoView({behavior:'smooth',block:'center'});
}

function drawPoster(canvas,entry,paletteId,layoutId,elements=posterElements) {
  const scale=canvas.width/1080,ctx=canvas.getContext('2d'),theme=posterPalettes[paletteId]||posterPalettes.paper,layout=posterLayouts[layoutId]||posterLayouts.photo;
  const full=layout.mode==='full',quoteFirst=layout.mode==='quote',hasPhoto=elements.image,photoH=hasPhoto?canvas.height*(full?1:quoteFirst?.43:.52):0,photoY=quoteFirst?canvas.height-photoH:0,pad=64*scale;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=theme.bg;ctx.fillRect(0,0,canvas.width,canvas.height);
  return new Promise(resolve=>{const paintText=()=>{drawText();resolve()};if(!hasPhoto){paintText();return}const img=new Image();img.onload=()=>{const s=Math.max(canvas.width/img.width,photoH/img.height),w=img.width*s,h=img.height*s;ctx.save();ctx.beginPath();ctx.rect(0,photoY,canvas.width,photoH);ctx.clip();ctx.drawImage(img,(canvas.width-w)/2,photoY+(photoH-h)/2,w,h);ctx.restore();paintText()};img.onerror=()=>{ctx.fillStyle=theme.photo;ctx.fillRect(0,photoY,canvas.width,photoH);paintText()};img.src=entry.image;
  function drawText(){
    const date=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(entry.publishDate+'T00:00:00Z'));
    const ink=full?(hasPhoto?'#fff':theme.ink):theme.ink,accent=full?'#f2b885':theme.accent;
    if(full&&hasPhoto){const veil=ctx.createLinearGradient(0,canvas.height*.35,0,canvas.height);veil.addColorStop(0,'rgba(12,20,18,0)');veil.addColorStop(.42,'rgba(12,20,18,.72)');veil.addColorStop(1,'rgba(12,20,18,.92)');ctx.fillStyle=veil;ctx.fillRect(0,0,canvas.width,canvas.height)}
    ctx.fillStyle=ink;
    if(full&&hasPhoto){let y=canvas.height-44*scale;const credit=elements.credit?'Photo: '+entry.imageAuthor+' · '+entry.imageLicense:'';if(credit){ctx.font=(15*scale)+'px "DM Sans",sans-serif';ctx.fillText(credit,pad,y);y-=50*scale}if(elements.action){ctx.font=(17*scale)+'px "DM Sans",sans-serif';const lines=linesFor(ctx,entry.action,canvas.width-2*pad).slice(0,2);lines.reverse().forEach(line=>{ctx.fillText(line,pad,y);y-=25*scale});y-=12*scale}if(elements.quote){ctx.font=(50*scale)+'px "Newsreader",Georgia,serif';const lines=linesFor(ctx,entry.quote,canvas.width-2*pad);lines.reverse().forEach(line=>{ctx.fillText(line,pad,y);y-=58*scale});y-=10*scale}if(elements.theme){ctx.fillStyle=accent;ctx.font='600 '+(19*scale)+'px "DM Sans",sans-serif';ctx.fillText(entry.theme.toUpperCase(),pad,y);y-=48*scale}if(elements.brand||elements.date){ctx.fillStyle=ink;if(elements.brand){ctx.textAlign='left';ctx.font='600 '+(32*scale)+'px "DM Sans",sans-serif';ctx.fillText('DAILY GLIMMER',pad,y)}if(elements.date){ctx.textAlign='right';ctx.font=(19*scale)+'px "DM Sans",sans-serif';ctx.fillText(date,canvas.width-pad,y)}ctx.textAlign='left'}return}
    let y=(quoteFirst?52:hasPhoto?photoH/scale+48:76)*scale;
    if(!hasPhoto){let block=0;if(elements.brand||elements.date)block+=55*scale;if(elements.theme)block+=57*scale;if(elements.quote){ctx.font=(quoteFirst?49:47)*scale+'px "Newsreader",Georgia,serif';block+=linesFor(ctx,entry.quote,canvas.width-2*pad).length*55*scale+15*scale}if(elements.action){ctx.font=(17*scale)+'px "DM Sans",sans-serif';block+=Math.min(2,linesFor(ctx,entry.action,canvas.width-2*pad).length)*25*scale}y=Math.max(pad,(canvas.height-block)/2)}
    if(elements.brand||elements.date){ctx.fillStyle=ink;if(elements.brand){ctx.textAlign='left';ctx.font='600 '+(29*scale)+'px "DM Sans",sans-serif';ctx.fillText('DAILY GLIMMER',pad,y)}if(elements.date){ctx.textAlign='right';ctx.font=(19*scale)+'px "DM Sans",sans-serif';ctx.fillText(date,canvas.width-pad,y)}ctx.textAlign='left';y+=55*scale}
    if(elements.theme){ctx.fillStyle=accent;ctx.font='600 '+(19*scale)+'px "DM Sans",sans-serif';ctx.fillText(entry.theme.toUpperCase(),pad,y);y+=57*scale}
    if(elements.quote){ctx.fillStyle=ink;ctx.font=(quoteFirst?49:47)*scale+'px "Newsreader",Georgia,serif';const lines=linesFor(ctx,entry.quote,canvas.width-2*pad);lines.forEach(line=>{ctx.fillText(line,pad,y);y+=55*scale});y+=15*scale}
    if(elements.action){ctx.fillStyle=ink;ctx.font=(17*scale)+'px "DM Sans",sans-serif';linesFor(ctx,entry.action,canvas.width-2*pad).slice(0,2).forEach(line=>{ctx.fillText(line,pad,y);y+=25*scale})}
    if(elements.credit){ctx.fillStyle=ink;ctx.font=(15*scale)+'px "DM Sans",sans-serif';ctx.fillText('Photo: '+entry.imageAuthor+' · '+entry.imageLicense,pad,canvas.height-30*scale)}
  }});
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

async function savePoster(entry, palette='paper', layout='photo', elements=posterElements) {
  const button = document.querySelector('.poster-download') || document.querySelector('#save');
  button.disabled = true;
  button.textContent = 'Creating…';
  try {
    await document.fonts.ready;
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;
    await drawPoster(canvas,entry,palette,layout,elements);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('PNG export failed');
    const fileName = 'daily-glimmer-' + layout + '-' + palette + '-' + entry.publishDate + '.png';
    const file = new File([blob], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      await navigator.share({ files: [file], title: 'Daily Glimmer' });
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = fileName;
      link.style.display = 'none'; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    toast('Your poster is ready to save');
  } catch { toast('Couldn’t save the image. Please try again.'); }
  finally { button.disabled = false; button.innerHTML = saveIcon + 'Download PNG'; }
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

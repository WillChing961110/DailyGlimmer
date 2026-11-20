import { utcDate, publishedEntries } from './logic.mjs';

const app = document.querySelector('#app');
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const saveIcon = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>';
const copyIcon = '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="13" rx="1"/><path d="M15 8V3H3v13h5"/></svg>';
let entries = [];
let toastTimer;
let displayedDate = utcDate();
let momentCleanup;

const requestedLocale = new URLSearchParams(location.search).get('lang');
const locale = ['zh','zh-TW'].includes(requestedLocale) ? requestedLocale : 'en';
const isChinese = locale !== 'en';
const strings = {
  en: {today:'Today',archive:'Past notes',language:'Language',pastTitle:'Past notes',pastSubtitle:'{count} days of words and landscapes',
    save:'Save this note',copy:'Copy quote',smallThing:'A small thing to try',earlier:'Earlier',later:'Later',browse:'Browse past notes',
    first:'You’re at the first note',everyDay:'A little light, every day',notAvailable:'This note isn’t available yet.',back:'Back to today',
    copied:'Copied to clipboard',copyFail:'Couldn’t copy. Please select and copy the quote manually.',creating:'Creating…',saved:'Your poster is ready to save',saveFail:'Couldn’t save the image. Please try again.',
    original:'Daily Glimmer',translation:'Translation by Daily Glimmer',source:'Original source',credit:'Photo by',
    notes:'notes',todayKicker:'A LITTLE LIGHT FOR TODAY',navLabel:'More daily notes',posterKicker:'YOUR POSTER',posterTitle:'Make it yours',posterPrefs:'Your choices are saved in this browser.',layout:'Layout',palette:'Color palette',download:'Download PNG',preview:'Live poster preview',close:'Close editor',
    photoFirst:'Photo first',quoteFirst:'Quote first',fullBleed:'Full-bleed image',warmPaper:'Warm paper',coastalBlue:'Coastal blue',terracotta:'Soft terracotta',deepForest:'Deep forest',photoLabel:'Photo:'},
  zh: {today:'今日',archive:'往期',language:'语言',pastTitle:'往期日签',pastSubtitle:'{count} 天的文字与风景',
    save:'保存日签',copy:'复制语录',smallThing:'今日小行动',earlier:'更早',later:'更新',browse:'浏览往期',
    first:'这是第一篇日签',everyDay:'每天一束微光',notAvailable:'这篇日签暂不可用。',back:'返回今日',
    copied:'已复制到剪贴板',copyFail:'复制失败，请手动选择并复制文字。',creating:'正在生成…',saved:'日签已准备好，可以保存了',saveFail:'保存失败，请重试。',
    original:'今日微光原创',translation:'本站译文',source:'原作出处',credit:'摄影',
    notes:'篇日签',todayKicker:'今日的一束微光',navLabel:'更多每日语录',posterKicker:'你的日签',posterTitle:'设计你的日签',posterPrefs:'你的选择会保存在此浏览器中。',layout:'布局',palette:'配色',download:'下载 PNG',preview:'日签实时预览',close:'关闭编辑器',
    photoFirst:'图片优先',quoteFirst:'文字优先',fullBleed:'满版图片',warmPaper:'暖纸色',coastalBlue:'海岸蓝',terracotta:'柔和陶土色',deepForest:'深林绿',photoLabel:'摄影：'},
  'zh-TW': {today:'今日',archive:'過往日簽',language:'語言',pastTitle:'過往日簽',pastSubtitle:'{count} 天的文字與風景',
    save:'儲存日簽',copy:'複製語錄',smallThing:'今日小行動',earlier:'較早',later:'較新',browse:'瀏覽過往日簽',
    first:'這是第一篇日簽',everyDay:'每天一束微光',notAvailable:'這篇日簽目前無法使用。',back:'返回今日',
    copied:'已複製到剪貼簿',copyFail:'複製失敗，請手動選取並複製文字。',creating:'正在製作…',saved:'日簽已準備好，可以儲存了',saveFail:'儲存失敗，請再試一次。',
    original:'今日微光原創',translation:'本站譯文',source:'原文出處',credit:'攝影者',
    notes:'篇日簽',todayKicker:'今日的一束微光',navLabel:'更多每日語錄',posterKicker:'你的日簽',posterTitle:'設計你的日簽',posterPrefs:'你的選擇會儲存在這個瀏覽器中。',layout:'版面配置',palette:'配色',download:'下載 PNG',preview:'日簽即時預覽',close:'關閉編輯器',
    photoFirst:'圖片優先',quoteFirst:'文字優先',fullBleed:'滿版圖片',warmPaper:'暖紙色',coastalBlue:'海岸藍',terracotta:'柔和陶土色',deepForest:'深林綠',photoLabel:'攝影：'}
};
const t = key => strings[locale][key] || strings.en[key] || key;
function localizedHref(hash) { return (locale === 'en' ? '' : '?lang=' + locale) + hash; }
function localized(entry, field) { return entry.translations?.[locale]?.[field] || entry[field] || ''; }
document.documentElement.lang = locale === 'zh-TW' ? 'zh-TW' : locale === 'zh' ? 'zh-CN' : 'en';
document.title = isChinese ? '今日微光 — 每天一束微光' : 'Daily Glimmer — A little light for today';
const description = document.querySelector('meta[name="description"]');
const ogTitle = document.querySelector('meta[property="og:title"]');
const ogDescription = document.querySelector('meta[property="og:description"]');
if (isChinese) {
  if (description) description.content = locale === 'zh-TW' ? '每日一句值得細讀的話、一幅靜謐的風景，以及一個可以嘗試的小行動。' : '每日一句值得细读的话，一幅安静的风景，以及一个可以尝试的小行动。';
  if (ogTitle) ogTitle.content = document.title;
  if (ogDescription) ogDescription.content = description.content;
}
const languageSelect = document.querySelector('#languageSelect');
if (languageSelect) { languageSelect.value = locale; languageSelect.onchange = () => { const hash = location.hash || '#/'; location.href = (languageSelect.value === 'en' ? '/' : '/?lang=' + languageSelect.value) + hash; }; }
languageSelect?.setAttribute('aria-label', t('language'));
document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
document.querySelector('.brand small').textContent = isChinese ? '每天一束微光' : 'A little light for today';
document.querySelector('.brand').setAttribute('aria-label', isChinese ? (locale === 'zh-TW' ? '今日微光首頁' : '今日微光首页') : 'Daily Glimmer home');
document.querySelector('.nav nav').setAttribute('aria-label', locale === 'zh-TW' ? '主選單' : isChinese ? '主导航' : 'Main navigation');
document.querySelector('.skip-link').textContent = locale === 'zh-TW' ? '跳至主要內容' : isChinese ? '跳至正文' : 'Skip to content';
document.querySelector('.footer').lastElementChild.textContent = locale === 'zh-TW' ? '圖片來源與授權' : isChinese ? '图片鸣谢与许可' : 'Photo credits & licenses';

function toast(message) {
  const node = document.querySelector('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('visible'), 4000);
}

function weekday(date) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, { timeZone: 'UTC', weekday: 'long' })
    .format(new Date(date + 'T00:00:00Z'));
}

const posterPrefs = (() => {
  try { return JSON.parse(localStorage.getItem('daily-glimmer-poster') || '{}'); } catch { return {}; }
})();
const posterPalettes = {
  paper:{label:t('warmPaper'),bg:'#efe9e0',ink:'#22261f',accent:'#2e5b44',photo:'#b8c3b3'},
  ocean:{label:t('coastalBlue'),bg:'#e5eef0',ink:'#17323c',accent:'#287b83',photo:'#adc9cf'},
  sunset:{label:t('terracotta'),bg:'#f2e3d5',ink:'#482d28',accent:'#bd5a3c',photo:'#d8aa8e'},
  night:{label:t('deepForest'),bg:'#172723',ink:'#f3f0e8',accent:'#d5a86d',photo:'#314b42'}
};
const posterLayouts = {
  photo:{label:t('photoFirst'),mode:'photo'},
  quote:{label:t('quoteFirst'),mode:'quote'},
  full:{label:t('fullBleed'),mode:'full'}
};
const posterElements = {image:true,quote:true,date:true,theme:true,action:true,brand:true,credit:true};

function photo(entry, lazy = false) {
  return '<img src="' + escape(entry.image) + '" alt="' + escape(localized(entry,'imageAlt')) +
    '" width="1200" height="800" data-source="library-057" data-subject="landscape" style="object-position:' +
    escape(entry.imageFocus || '50% 50%') + '" decoding="async" ' +
    (lazy ? 'loading="lazy"' : 'fetchpriority="high"') + '>';
}

function renderArchive(published) {
  document.title = isChinese ? (locale === 'zh-TW' ? '過往日簽 · 今日微光' : '往期日签 · 今日微光') : 'Past notes · Daily Glimmer';
  app.innerHTML = '<section class="wrap archive"><div class="page-title"><h1>' + t('pastTitle') + '</h1><p>' +
    t('pastSubtitle').replace('{count}', published.length) + '</p></div><div class="archive-grid">' +
    published.map(entry => '<a class="entry" href="' + localizedHref('#/day/' + entry.id) +
      '"><div class="entry-photo">' + photo(entry, true) + '</div><div class="entry-meta"><time>' +
      entry.publishDate + '</time><span>' + escape(localized(entry,'theme')) + '</span></div><p>' +
      escape(localized(entry,'quote')) + '</p></a>').join('') + '</div></section>';
}

function renderCredits() {
  const unique = [...new Map(entries.map(entry => [entry.image, entry])).values()];
  document.title = isChinese ? (locale === 'zh-TW' ? '圖片來源與授權 · 今日微光' : '图片鸣谢与许可 · 今日微光') : 'Photo credits & licenses · Daily Glimmer';
  app.innerHTML = '<section class="wrap credits"><h1>' + (isChinese ? (locale === 'zh-TW' ? '圖片來源與授權' : '图片鸣谢与许可') : 'Photo credits & licenses') + '</h1>' +
    '<p>' + (isChinese ? (locale === 'zh-TW' ? '圖片來自 Wikimedia Commons，並隨 Taste Skill 素材提供。頁面展示時會裁切圖片；每張圖片及其裁切版本均遵循原始授權。下方列出攝影者、來源與授權連結。' : '图片来自 Wikimedia Commons 并随 Taste Skill 素材提供。页面展示会裁切图片；每张图片和裁切版本均遵循原始许可。下方列出摄影者、来源和许可链接。') : 'Photographs sourced from Wikimedia Commons and bundled with Taste Skill. Images are cropped for display; each image and its crop follow the original license. Credits and source links are listed below.') + '</p>' +
  unique.map(entry => '<article><h2>' + escape(localized(entry,'imageAlt')) + '</h2><p>' + t('credit') + ' ' +
      escape(entry.imageAuthor) + ' · ' + escape(entry.imageLicense) +
      '</p><div class="license-links"><a href="' + escape(entry.imageSourceUrl) +
      '" target="_blank" rel="noopener">' + (isChinese ? (locale === 'zh-TW' ? '原始圖片' : '原始图片') : 'Original photo') + '</a><a href="' + escape(entry.imageLicenseUrl) +
      '" target="_blank" rel="noopener">' + (isChinese ? (locale === 'zh-TW' ? '授權條款' : '许可条款') : 'License terms') + '</a><a href="' + escape(entry.image) +
      '" target="_blank">' + (isChinese ? (locale === 'zh-TW' ? '本機圖片' : '本地图片') : 'Local image') + '</a></div></article>').join('') +
    '<p>' + (isChinese ? (locale === 'zh-TW' ? '原創日簽由今日微光撰寫；名言均附原作出處，繁體中文為本站譯文。' : '原创日签由今日微光创作；名言均附原作出处，中文为本站译文。') : 'Original notes are written by Daily Glimmer. Quotations include links to their source works.') + '</p></section>';
}

function renderDaily(entry, published, detail) {
  const [year, month, day] = entry.publishDate.split('-');
  const index = published.findIndex(item => item.id === entry.id);
  const older = published[index + 1];
  const newer = published[index - 1];
  const quote = localized(entry,'quote'), theme = localized(entry,'theme'), action = localized(entry,'action');
  const dateLocale = locale === 'en' ? 'en-US' : locale;
  const attribution = entry.quoteType === 'quotation'
    ? '<p class="quote-attribution">— ' + escape(entry.quoteAuthor) + ' · <cite>' + escape(entry.quoteWork) + '</cite> · <a href="' + escape(entry.quoteSourceUrl) + '" target="_blank" rel="noopener">' + t('source') + '</a>' + (isChinese ? ' <span>（' + t('translation') + '）</span>' : '') + '</p>'
    : '<p class="quote-attribution">— ' + t('original') + '</p>';
  document.title = isChinese ? entry.publishDate + ' · 今日微光' : entry.publishDate + ' · Daily Glimmer';
  app.innerHTML = '<section class="wrap daily hero" data-enter><div class="edition"><div class="edition-kicker">' + t('todayKicker') + '</div><time datetime="' + entry.publishDate + '">' +
    new Intl.DateTimeFormat(dateLocale,{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(entry.publishDate+'T00:00:00Z')) + '</time></div><div class="daily-grid">' +
    '<div class="reading"><div class="date-block"><span class="date-day">' + day +
    '</span><div class="date-month">' + weekday(entry.publishDate) + '<br>' +
    new Intl.DateTimeFormat(dateLocale,{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(entry.publishDate+'T00:00:00Z')) + '</div></div><p class="theme">' + escape(theme) +
    '</p><blockquote class="quote">' + escape(quote) +
    '</blockquote>' + attribution + '<div class="btn-row"><button class="btn btn--primary" id="save">' + saveIcon +
    t('save') + '</button><button class="btn btn--secondary" id="copy">' + copyIcon +
    t('copy') + '</button></div></div><figure class="photo-frame" data-moment="picture-develops" data-moment-opts=\'{"look":"film"}\'>' +
    photo(entry) + '</figure></div><div class="action-row"><h2>' + t('smallThing') + '</h2><p>' +
    escape(action) + '</p></div><nav class="day-nav" aria-label="' + t('navLabel') + '">' +
    (older ? '<a href="' + localizedHref('#/day/' + older.id) + '">← ' + t('earlier') + ' · ' + older.publishDate.slice(5).replace('-', ' / ') + '</a>' : '<span>' + t('first') + '</span>') +
    '<a href="' + localizedHref('#/archive') + '">' + t('browse') + '</a>' +
    (newer ? '<a href="' + localizedHref('#/day/' + newer.id) + '">' + t('later') + ' · ' + newer.publishDate.slice(5).replace('-', ' / ') + '</a>' : '<span>' + t('everyDay') + '</span>') +
    '</nav></section>';
  document.querySelector('#copy').onclick = async () => {
    try {
      const copiedText = entry.quoteType === 'quotation'
        ? quote + '\n— ' + entry.quoteAuthor + ', ' + entry.quoteWork + (isChinese ? '（' + t('translation') + '）' : '') + '\n' + entry.quoteSourceUrl
        : quote + '\n— ' + (locale === 'zh-TW' ? '今日微光原創' : locale === 'zh' ? '今日微光原创' : 'Daily Glimmer');
      await navigator.clipboard.writeText(copiedText);
      toast(t('copied'));
    } catch {
      toast(t('copyFail'));
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
  entry = {...entry, quote:localized(entry,'quote'), theme:localized(entry,'theme'), action:localized(entry,'action')};
  document.querySelector('.poster-editor')?.remove();
  const editor=document.createElement('section');
  editor.className='poster-editor wrap';
  const palette=posterPrefs.palette||'paper', layout=posterLayouts[posterPrefs.layout]?posterPrefs.layout:'photo';
  editor.innerHTML='<div class="poster-editor-head"><div><span>'+t('posterKicker')+'</span><h2>'+t('posterTitle')+'</h2><p>'+t('posterPrefs')+'</p></div><button class="poster-editor-close" aria-label="'+t('close')+'">×</button></div>'+
    '<div class="poster-editor-grid"><div class="poster-controls"><fieldset><legend>'+t('layout')+'</legend><div class="poster-choice-row">'+Object.entries(posterLayouts).map(([id,o])=>'<button type="button" class="poster-choice '+(id===layout?'selected':'')+'" data-layout="'+id+'"><span class="layout-thumb layout-thumb--'+id+'"><i></i><b></b></span><strong>'+o.label+'</strong></button>').join('')+'</div></fieldset>'+
    '<fieldset class="palette-fieldset"><legend>'+t('palette')+'</legend><div class="palette-row">'+Object.entries(posterPalettes).map(([id,o])=>'<button type="button" class="palette-choice '+(id===palette?'selected':'')+'" data-palette="'+id+'"><i style="background:'+o.bg+';--swatch:'+o.accent+'"></i>'+o.label+'</button>').join('')+'</div></fieldset>'+
    '<button class="btn btn--primary poster-download">'+saveIcon+t('download')+'</button></div><div class="poster-preview"><canvas width="420" height="560" aria-label="'+t('preview')+'"></canvas></div></div>';
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
    const date=new Intl.DateTimeFormat(locale==='en'?'en-US':locale,{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(entry.publishDate+'T00:00:00Z'));
    const ink=full?(hasPhoto?'#fff':theme.ink):theme.ink,accent=full?'#f2b885':theme.accent;
    if(full&&hasPhoto){const veil=ctx.createLinearGradient(0,canvas.height*.35,0,canvas.height);veil.addColorStop(0,'rgba(12,20,18,0)');veil.addColorStop(.42,'rgba(12,20,18,.72)');veil.addColorStop(1,'rgba(12,20,18,.92)');ctx.fillStyle=veil;ctx.fillRect(0,0,canvas.width,canvas.height)}
    ctx.fillStyle=ink;
    if(full&&hasPhoto){let y=canvas.height-44*scale;const credit=elements.credit?t('photoLabel')+' '+entry.imageAuthor+' · '+entry.imageLicense:'';if(credit){ctx.font=(15*scale)+'px "DM Sans",sans-serif';ctx.fillText(credit,pad,y);y-=50*scale}if(elements.action){ctx.font=(17*scale)+'px "DM Sans",sans-serif';const lines=linesFor(ctx,entry.action,canvas.width-2*pad).slice(0,2);lines.reverse().forEach(line=>{ctx.fillText(line,pad,y);y-=25*scale});y-=12*scale}if(elements.quote){ctx.font=(50*scale)+'px "Newsreader",Georgia,serif';const lines=linesFor(ctx,entry.quote,canvas.width-2*pad);lines.reverse().forEach(line=>{ctx.fillText(line,pad,y);y-=58*scale});y-=10*scale}if(elements.theme){ctx.fillStyle=accent;ctx.font='600 '+(19*scale)+'px "DM Sans",sans-serif';ctx.fillText(entry.theme.toUpperCase(),pad,y);y-=48*scale}if(elements.brand||elements.date){ctx.fillStyle=ink;if(elements.brand){ctx.textAlign='left';ctx.font='600 '+(32*scale)+'px "DM Sans",sans-serif';ctx.fillText('DAILY GLIMMER',pad,y)}if(elements.date){ctx.textAlign='right';ctx.font=(19*scale)+'px "DM Sans",sans-serif';ctx.fillText(date,canvas.width-pad,y)}ctx.textAlign='left'}return}
    let y=(quoteFirst?52:hasPhoto?photoH/scale+48:76)*scale;
    if(!hasPhoto){let block=0;if(elements.brand||elements.date)block+=55*scale;if(elements.theme)block+=57*scale;if(elements.quote){ctx.font=(quoteFirst?49:47)*scale+'px "Newsreader",Georgia,serif';block+=linesFor(ctx,entry.quote,canvas.width-2*pad).length*55*scale+15*scale}if(elements.action){ctx.font=(17*scale)+'px "DM Sans",sans-serif';block+=Math.min(2,linesFor(ctx,entry.action,canvas.width-2*pad).length)*25*scale}y=Math.max(pad,(canvas.height-block)/2)}
    if(elements.brand||elements.date){ctx.fillStyle=ink;if(elements.brand){ctx.textAlign='left';ctx.font='600 '+(29*scale)+'px "DM Sans",sans-serif';ctx.fillText('DAILY GLIMMER',pad,y)}if(elements.date){ctx.textAlign='right';ctx.font=(19*scale)+'px "DM Sans",sans-serif';ctx.fillText(date,canvas.width-pad,y)}ctx.textAlign='left';y+=55*scale}
    if(elements.theme){ctx.fillStyle=accent;ctx.font='600 '+(19*scale)+'px "DM Sans",sans-serif';ctx.fillText(entry.theme.toUpperCase(),pad,y);y+=57*scale}
    if(elements.quote){ctx.fillStyle=ink;ctx.font=(quoteFirst?49:47)*scale+'px "Newsreader",Georgia,serif';const lines=linesFor(ctx,entry.quote,canvas.width-2*pad);lines.forEach(line=>{ctx.fillText(line,pad,y);y+=55*scale});y+=15*scale}
    if(elements.action){ctx.fillStyle=ink;ctx.font=(17*scale)+'px "DM Sans",sans-serif';linesFor(ctx,entry.action,canvas.width-2*pad).slice(0,2).forEach(line=>{ctx.fillText(line,pad,y);y+=25*scale})}
    if(elements.credit){ctx.fillStyle=ink;ctx.font=(15*scale)+'px "DM Sans",sans-serif';ctx.fillText(t('photoLabel')+' '+entry.imageAuthor+' · '+entry.imageLicense,pad,canvas.height-30*scale)}
  }});
}

function render() {
  if (momentCleanup) { momentCleanup(); momentCleanup = null; }
  const published = publishedEntries(entries, utcDate());
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
    else app.innerHTML = '<div class="wrap empty"><h1>' + t('notAvailable') + '</h1><a href="' + localizedHref('#/') + '">' + t('back') + '</a></div>';
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
  button.textContent = t('creating');
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
    toast(t('saved'));
  } catch { toast(t('saveFail')); }
  finally { button.disabled = false; button.innerHTML = saveIcon + t('download'); }
}

try {
  const response = await fetch('./content.json');
  if (!response.ok) throw new Error('Content unavailable');
  entries = await response.json();
  render();
  import('./assets/motion/motion.js').catch(() => {});
} catch { app.innerHTML = '<p class="empty">' + (isChinese ? (locale === 'zh-TW' ? '無法載入今日內容，請重新整理後再試。' : '无法加载今日内容，请刷新后重试。') : 'Couldn’t load today’s note. Please refresh and try again.') + '</p>'; }
addEventListener('hashchange', () => { render(); if (location.hash !== '#content') scrollTo(0, 0); });
setInterval(() => {
  const date = utcDate();
  if (date !== displayedDate) { displayedDate = date; render(); }
}, 10000);

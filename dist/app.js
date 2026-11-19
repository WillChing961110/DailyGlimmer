import {beijingDate,publishedEntries} from './logic.mjs';
let entries = [];
const app = document.querySelector('#app');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;
function toast(message) {
  const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3500);
}
function dateLabel(date) {
  return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',weekday:'long'}).format(new Date(date+'T12:00:00+08:00'));
}
function bindImages() {
  app.querySelectorAll('img').forEach(img => img.addEventListener('error', () => {img.style.visibility='hidden';}, {once:true}));
}
function render() {
  const published = publishedEntries(entries, beijingDate());
  const path = location.hash.slice(1).split('/').filter(Boolean).join('/');
  document.querySelector('#todayNav').classList.toggle('active', !path);
  document.querySelector('#archiveNav').classList.toggle('active', path === 'archive');
  if (path === 'archive') {
    document.title='往期日签 · 今日微光';
    app.innerHTML='<section class="archive-intro"><p class="eyebrow">A LITTLE LIGHT, EVERY DAY</p><h1>留住每一天的微光</h1><p>走过的日子，也藏着继续向前的力量。</p></section><div class="grid">'+published.map(e=>'<a class="mini" href="#/day/'+e.id+'"><img src="'+escape(e.image)+'" alt="'+escape(e.imageAlt)+'" loading="lazy"><div><time>'+e.publishDate+' · '+escape(e.theme)+'</time><p>'+escape(e.quote)+'</p></div></a>').join('')+'</div>';
    if (!published.length) app.innerHTML += '<p class="empty">第一束微光正在准备中。</p>';
  } else {
    const isDetail = path.startsWith('day/');
    const entry = isDetail ? published.find(e=>e.id===path.slice(4)) : (!path ? published[0] : null);
    if (!entry) {app.innerHTML='<p class="empty">这一天的微光尚未发布。<br><a href="#/">回到今日</a></p>'; return;}
    document.title=entry.publishDate+' · 今日微光';
    const parts=entry.publishDate.split('-');
    app.innerHTML=(isDetail?'<a class="back" href="#/archive">返回往期日签</a>':'')+'<section class="intro"><div><p class="eyebrow">A LITTLE LIGHT, EVERY DAY</p><h1>'+(isDetail?'那一天的微光':'给今天，一点微光')+'</h1></div><div class="date"><strong>'+parts[1]+' / '+parts[2]+'</strong>'+parts[0]+' · '+dateLabel(entry.publishDate)+'</div></section><article class="card"><div class="landscape"><img src="'+escape(entry.image)+'" alt="'+escape(entry.imageAlt)+'"><span class="image-label">慢慢来，光会照进来</span></div><div class="quote-block"><span class="theme">'+escape(entry.theme)+'</span><blockquote>'+escape(entry.quote)+'</blockquote><p class="source">'+escape(entry.textSource)+'</p></div></article><section class="action"><span>今日小行动</span><p>'+escape(entry.action)+'</p></section><div class="controls"><button class="primary" id="save">↓ &nbsp;保存日签</button><button id="copy">复制文字</button></div><p class="credit">'+(entry.imageSourceUrl?'摄影：'+escape(entry.imageAuthor)+' · <a target="_blank" rel="noopener noreferrer" href="'+escape(entry.imageSourceUrl)+'">查看来源</a>':'背景：今日微光原创渐变风景 · 摄影素材待补充')+'</p>';
    document.querySelector('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(entry.quote+'\n—— 今日微光');toast('文字已复制，愿微光与你同在。');}catch{toast('复制失败，请长按或选中文字复制。');}};
    document.querySelector('#save').onclick=()=>savePoster(entry);
  }
  bindImages();
}
function wrapText(ctx, text, maxWidth) {
  const lines=[]; let line='';
  for (const character of text) {
    if (line && ctx.measureText(line+character).width>maxWidth) {lines.push(line);line=character;} else line+=character;
  }
  if(line)lines.push(line);return lines;
}
async function savePoster(entry) {
  const button=document.querySelector('#save');button.disabled=true;button.textContent='正在生成…';
  try {
    await document.fonts.ready;
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#faf9f2';ctx.fillRect(0,0,1080,1440);
    const gradient=ctx.createLinearGradient(0,0,1080,780);gradient.addColorStop(0,'#b4c8c3');gradient.addColorStop(1,'#e9d8bb');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,780);
    try {
      const img=new Image();img.src=entry.image;await img.decode();
      const scale=Math.max(1080/img.naturalWidth,780/img.naturalHeight);
      const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
      ctx.save();ctx.beginPath();ctx.rect(0,0,1080,780);ctx.clip();ctx.drawImage(img,(1080-w)/2,(780-h)/2,w,h);ctx.restore();
    } catch {}
    ctx.fillStyle='#536849';ctx.font='28px sans-serif';ctx.fillText(entry.publishDate+'  '+dateLabel(entry.publishDate),80,850);
    ctx.fillStyle='#2d4034';ctx.font='44px "Noto Serif SC", "SimSun", serif';
    wrapText(ctx,entry.quote,920).forEach((line,i)=>ctx.fillText(line,80,950+i*77));
    ctx.fillStyle='#69765f';ctx.font='25px sans-serif';
    wrapText(ctx,'今日小行动 · '+entry.action,920).forEach((line,i)=>ctx.fillText(line,80,1230+i*40));
    ctx.fillStyle='#3b503b';ctx.font='32px "Noto Serif SC",serif';ctx.fillText('今日微光',80,1370);
    ctx.font='18px sans-serif';ctx.fillStyle='#7d8577';ctx.fillText('本站创作 · AI 辅助 / 原创渐变风景',580,1370);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG failed');
    const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='今日微光-'+entry.publishDate+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('日签已生成，感谢你收藏今天的微光。');
  } catch {toast('保存失败，请稍后再试。');}
  finally {button.disabled=false;button.textContent='↓  保存日签';}
}
try {
  const response=await fetch('./content.json');if(!response.ok)throw new Error('content failed');
  entries=await response.json();render();
} catch {app.innerHTML='<p class="empty">内容暂时无法加载，请刷新页面重试。</p>';}
addEventListener('hashchange',()=>{render();scrollTo(0,0);});
setInterval(render,60000);


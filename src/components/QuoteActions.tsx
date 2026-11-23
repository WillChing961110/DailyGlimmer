'use client';
import {useEffect,useRef,useState} from 'react';import {createPortal} from 'react-dom';import type {Entry,Locale} from '../lib/content';import {text,copy} from '../lib/content';
import {Check,Copy,Download,Image as ImageIcon,X} from 'lucide-react';
type Layout='photo'|'quote'|'full';type Palette='paper'|'ocean'|'sunset'|'night';
const colors={paper:['#efe9e0','#22261f','#2e5b44'],ocean:['#e5eef0','#17323c','#287b83'],sunset:['#f2e3d5','#482d28','#bd5a3c'],night:['#172723','#f3f0e8','#d5a86d']};
export function QuoteActions({entry,locale}:{entry:Entry;locale:Locale}){const [status,setStatus]=useState(''),[open,setOpen]=useState(false),[portalRoot,setPortalRoot]=useState<HTMLElement|null>(null),[layout,setLayout]=useState<Layout>('photo'),[palette,setPalette]=useState<Palette>('paper');const preview=useRef<HTMLCanvasElement>(null);const q=text(entry,locale,'quote');
function paint(canvas:HTMLCanvasElement, onReady?: () => void){
  const c=canvas.getContext('2d')!,scale=canvas.width/1080,h=canvas.height;
  const full=layout==='full',quoteFirst=layout==='quote';
  const photoH=full?h:Math.round(h*.45);
  const photoY=quoteFirst?h-photoH:0;
  const [bg,ink,accent]=colors[palette];
  c.fillStyle=bg;c.fillRect(0,0,canvas.width,h);

  const drawText=()=>{
    c.font=`${52*scale}px Georgia,serif`;
    const maxWidth=canvas.width-140*scale,lines=[''];
    for(const ch of Array.from(q)){
      const line=lines[lines.length-1];
      if(c.measureText(line+ch).width>maxWidth)lines.push(ch);
      else lines[lines.length-1]+=ch;
    }
    const visibleLines=lines.slice(0,7);
    const groupHeight=visibleLines.length*68*scale+76*scale;
    let y=full?h-330*scale:quoteFirst?Math.max(104*scale,(photoY-groupHeight)/2+52*scale):photoH+120*scale;

    if(full){
      const gradient=c.createLinearGradient(0,h*.45,0,h);
      gradient.addColorStop(0,'rgba(10,20,16,0)');gradient.addColorStop(1,'rgba(10,20,16,.88)');
      c.fillStyle=gradient;c.fillRect(0,0,canvas.width,h);
    }
    c.fillStyle=full?'#fff':ink;
    visibleLines.forEach(line=>{c.fillText(line,70*scale,y);y+=68*scale});
    c.font=`${24*scale}px sans-serif`;
    c.fillStyle=full?'#fff':accent;
    c.fillText(text(entry,locale,'theme').toUpperCase(),70*scale,y+20*scale);

    c.fillStyle=full?'#fff':ink;
    c.font=`${22*scale}px sans-serif`;
    c.fillText(entry.publishDate,70*scale,quoteFirst?photoY-58*scale:h-55*scale);
    c.font=`${18*scale}px sans-serif`;
    const credit=`${locale==='en'?'Photo:':locale==='zh'?'摄影：':'攝影：'} ${entry.imageAuthor} · ${entry.imageLicense}`;
    c.fillText(credit,70*scale,quoteFirst?photoY-24*scale:h-22*scale);
  };

  const img=new Image();
  img.onload=()=>{
    c.save();c.beginPath();c.rect(0,photoY,canvas.width,photoH);c.clip();
    const ratio=Math.max(canvas.width/img.width,photoH/img.height);
    c.drawImage(img,(canvas.width-img.width*ratio)/2,photoY+(photoH-img.height*ratio)/2,img.width*ratio,img.height*ratio);
    c.restore();drawText();onReady?.();
  };
  img.onerror=()=>{drawText();onReady?.();};
  img.src=entry.image.replace('./','/');
  return () => { img.onload = null; img.onerror = null; };;
}
const editorHeading = useRef<HTMLHeadingElement>(null);
const editorTrigger = useRef<HTMLButtonElement>(null);
const [saving, setSaving] = useState(false);
const c = copy[locale];
const labels = {
  en: { preview: 'Poster preview', palettes: ['Paper', 'Ocean', 'Sunset', 'Night'], saving: 'Preparing PNG…', failed: 'Could not download the poster.' },
  zh: { preview: '日签预览', palettes: ['纸白', '海蓝', '落日', '夜色'], saving: '正在生成 PNG…', failed: '无法下载日签。' },
  'zh-TW': { preview: '日簽預覽', palettes: ['紙白', '海藍', '落日', '夜色'], saving: '正在產生 PNG…', failed: '無法下載日簽。' },
}[locale];
const [downloadError, setDownloadError] = useState('');

useEffect(() => { setPortalRoot(document.getElementById('poster-root')); }, []);
useEffect(() => {
  if (open && portalRoot) editorHeading.current?.focus();
}, [open, portalRoot]);
useEffect(() => {
  if (open && preview.current) return paint(preview.current);
}, [entry, locale, layout, palette, open, portalRoot]);

function closeEditor() {
  setOpen(false);
  editorTrigger.current?.focus();
}

async function copyQuote() {
  try {
    const attribution = entry.quoteAuthor || c.original;
    const work = entry.quoteWork ? `, ${entry.quoteWork}` : '';
    const source = entry.quoteSourceUrl ? `\n${entry.quoteSourceUrl}` : '';
    await navigator.clipboard.writeText(`${q}\n— ${attribution}${work}${source}`);
    setStatus(locale === 'en' ? 'Quote copied' : locale === 'zh' ? '已复制语录' : '已複製語錄');
  } catch {
    setStatus(locale === 'en' ? 'Could not copy quote' : locale === 'zh' ? '复制失败' : '複製失敗');
  }
}

function save() {
  setSaving(true);
  setDownloadError('');
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  paint(canvas, () => {
    try {
      const link = document.createElement('a');
      link.download = `daily-glimmer-${layout}-${palette}-${entry.publishDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      setDownloadError(labels.failed);
    } finally {
      setSaving(false);
    }
  });
}

const editor = open && portalRoot ? createPortal(
  <section className="poster-editor" id="poster-editor" aria-labelledby="poster-title"
    onKeyDown={event => { if (event.key === 'Escape') closeEditor(); }}>
    <div className="poster-editor-head">
      <div>
        <h2 id="poster-title" ref={editorHeading} tabIndex={-1}>{c.posterTitle}</h2>
        <p>{c.posterHelp}</p>
      </div>
      <button type="button" className="poster-editor-close" aria-label={c.close} onClick={closeEditor}><X aria-hidden="true" size={18}/></button>
    </div>
    <div className="poster-editor-grid">
      <div className="poster-controls">
        <fieldset>
          <legend>{c.layout}</legend>
          <div className="poster-choice-row">
            {(['photo', 'quote', 'full'] as const).map(option => (
              <button key={option} type="button" className={`poster-choice ${layout === option ? 'selected' : ''}`}
                aria-pressed={layout === option} onClick={() => setLayout(option)}>
                <span className={`layout-thumb layout-thumb--${option}`} aria-hidden="true"><i/><b/></span>
                <span>{c[option]}</span>
                {layout === option && <Check className="control-check" aria-hidden="true"/>}
              </button>
            ))}
          </div>
        </fieldset>
        {layout !== 'full' && <fieldset>
          <legend>{c.palette}</legend>
          <div className="palette-row">
            {(['paper', 'ocean', 'sunset', 'night'] as const).map((option, index) => (
              <button key={option} type="button" className={`palette-choice ${palette === option ? 'selected' : ''}`}
                aria-pressed={palette === option} onClick={() => setPalette(option)}>
                <i style={{background: colors[option][0]}} aria-hidden="true"/>
                <span>{labels.palettes[index]}</span>
                {palette === option && <Check className="control-check" aria-hidden="true"/>}
              </button>
            ))}
          </div>
        </fieldset>}
        <button type="button" className="btn btn--primary poster-download" disabled={saving} onClick={save}>
          <Download aria-hidden="true" size={18}/><span>{saving ? labels.saving : c.download}</span>
        </button>
        {downloadError && <p className="control-status" role="alert">{downloadError}</p>}
      </div>
      <div className="poster-preview">
        <canvas ref={preview} width="540" height="720" role="img" aria-label={labels.preview}/>
      </div>
    </div>
  </section>,
  portalRoot
) : null;

return <>
  <div className="quote-actions">
    <div className="btn-row">
      <button ref={editorTrigger} type="button" className="btn btn--primary" aria-expanded={open}
        aria-controls={open ? 'poster-editor' : undefined} onClick={() => open ? closeEditor() : setOpen(true)}>
        <ImageIcon aria-hidden="true" size={18}/><span>{c.save}</span>
      </button>
      <button type="button" className="btn btn--secondary" onClick={copyQuote}>
        <Copy aria-hidden="true" size={18}/><span>{c.copy}</span>
      </button>
    </div>
    <p className="control-status" role="status">{status}</p>
  </div>
  {editor}
</>;
}

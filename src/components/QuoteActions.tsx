'use client';
import {useEffect,useRef,useState} from 'react';import {createPortal} from 'react-dom';import type {Entry,Locale} from '../lib/content';import {text,copy} from '../lib/content';
import {AlignLeft,Copy,Download,Image as ImageIcon,Maximize,X} from 'lucide-react';
type Layout='photo'|'quote'|'full';type Palette='paper'|'ocean'|'sunset'|'night';
const colors={paper:['#efe9e0','#22261f','#2e5b44'],ocean:['#e5eef0','#17323c','#287b83'],sunset:['#f2e3d5','#482d28','#bd5a3c'],night:['#172723','#f3f0e8','#d5a86d']};
export function QuoteActions({entry,locale}:{entry:Entry;locale:Locale}){const [status,setStatus]=useState(''),[open,setOpen]=useState(false),[portalRoot,setPortalRoot]=useState<HTMLElement|null>(null),[layout,setLayout]=useState<Layout>('photo'),[palette,setPalette]=useState<Palette>('paper');const preview=useRef<HTMLCanvasElement>(null);const q=text(entry,locale,'quote');
function paint(canvas:HTMLCanvasElement){
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
    c.restore();drawText();
  };
  img.onerror=drawText;
  img.src=entry.image.replace('./','/');
}
useEffect(()=>{setPortalRoot(document.getElementById('poster-root'))},[]);useEffect(()=>{if(open&&preview.current)paint(preview.current)},[entry,locale,layout,palette,open]);async function copyQuote(){try{await navigator.clipboard.writeText(`${q}\n— ${entry.quoteAuthor||copy[locale].original}${entry.quoteWork?`, ${entry.quoteWork}`:''}${entry.quoteSourceUrl?`\n${entry.quoteSourceUrl}`:''}`);setStatus(locale==='en'?'Copied':locale==='zh'?'已复制':'已複製')}catch{setStatus(locale==='en'?'Copy failed':locale==='zh'?'复制失败':'複製失敗')}}function save(){const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;paint(canvas);setTimeout(()=>{const a=document.createElement('a');a.download=`daily-glimmer-${layout}-${palette}-${entry.publishDate}.png`;a.href=canvas.toDataURL('image/png');a.click()},350)}
const layoutIcons={photo:ImageIcon,quote:AlignLeft,full:Maximize};
const editor=open&&portalRoot?createPortal(<section className="poster-editor wrap"><div className="poster-editor-head"><div><span>{copy[locale].poster}</span><h2>{copy[locale].posterTitle}</h2><p>{copy[locale].posterHelp}</p></div><button type="button" className="poster-editor-close" aria-label={copy[locale].close} onClick={()=>setOpen(false)}><X aria-hidden="true" size={18}/></button></div><div className="poster-editor-grid"><div className="poster-controls"><fieldset><legend>{copy[locale].layout}</legend><div className="poster-choice-row">{(['photo','quote','full'] as Layout[]).map(x=>{const Icon=layoutIcons[x];return <button type="button" key={x} className={`poster-choice ${layout===x?'selected':''}`} aria-pressed={layout===x} onClick={()=>setLayout(x)}><Icon className="control-icon" aria-hidden="true" size={18}/><span>{copy[locale][x]}</span></button>})}</div></fieldset>{layout!=='full'&&<fieldset><legend>{copy[locale].palette}</legend><div className="palette-row">{(['paper','ocean','sunset','night'] as Palette[]).map(x=><button type="button" key={x} className={`palette-choice ${palette===x?'selected':''}`} aria-pressed={palette===x} onClick={()=>setPalette(x)}><i style={{background:colors[x][0]}} aria-hidden="true"/><span>{x}</span></button>)}</div></fieldset>}<button type="button" className="btn btn--primary" onClick={save}><Download aria-hidden="true" size={18}/><span>{copy[locale].download}</span></button></div><div className="poster-preview"><canvas ref={preview} width="420" height="560" aria-label="Poster preview"/></div></div></section>,portalRoot):null;
return <><div className="btn-row"><button type="button" className="btn btn--primary" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><ImageIcon aria-hidden="true" size={18}/><span>{copy[locale].save}</span></button><button type="button" className="btn btn--secondary" onClick={copyQuote}><Copy aria-hidden="true" size={18}/><span>{copy[locale].copy}</span></button><span role="status">{status}</span></div>{editor}</>}

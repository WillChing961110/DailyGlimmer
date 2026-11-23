'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe2 } from 'lucide-react';
import {useRouter,usePathname} from 'next/navigation';
import {copy, type Locale} from '../lib/content';

const languages:{locale:Locale;label:string;nativeLabel:string}[]=[
  {locale:'en',label:'English',nativeLabel:'English'},
  {locale:'zh',label:'Simplified Chinese',nativeLabel:'简体中文'},
  {locale:'zh-TW',label:'Traditional Chinese',nativeLabel:'繁體中文'}
];

export function LanguageSelect({locale}:{locale:Locale}){
  const router=useRouter(),path=usePathname();
  const [open,setOpen]=useState(false),[active,setActive]=useState(languages.findIndex(x=>x.locale===locale));
  const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),items=useRef<(HTMLButtonElement|null)[]>([]);
  const selected=languages.find(x=>x.locale===locale)!;

  useEffect(()=>{
    if(!open)return;
    setActive(languages.findIndex(x=>x.locale===locale));
    items.current[languages.findIndex(x=>x.locale===locale)]?.focus();
    const dismiss=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};
    document.addEventListener('pointerdown',dismiss);
    return()=>document.removeEventListener('pointerdown',dismiss);
  },[open,locale]);

  function choose(next:Locale){
    setOpen(false);
    trigger.current?.focus();
    if(next!==locale)router.push(path.replace(/^\/[^/]+/,`/${next}`));
  }
  function handleMenuKey(event:React.KeyboardEvent<HTMLDivElement>){
    let next=active;
    if(event.key==='ArrowDown')next=(active+1)%languages.length;
    else if(event.key==='ArrowUp')next=(active-1+languages.length)%languages.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=languages.length-1;
    else if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus();return;}
    else return;
    event.preventDefault();setActive(next);items.current[next]?.focus();
  }

  return <div className="language-picker" ref={root}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false)}}>
    <button ref={trigger} type="button" className="language-trigger" aria-label={`${copy[locale].languageLabel}: ${selected.nativeLabel}`} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(value=>!value)} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);}}}>
      <Globe2 aria-hidden="true" className="language-icon" size={16}/>
      <span>{selected.nativeLabel}</span>
      <ChevronDown aria-hidden="true" className="language-chevron" size={14}/>
    </button>
    {open&&<div className="language-menu" role="menu" aria-label={copy[locale].languageLabel} onKeyDown={handleMenuKey}>
      {languages.map((language,index)=><button key={language.locale} ref={element=>{items.current[index]=element}} type="button" className={`language-option${language.locale===locale?' is-selected':''}`} role="menuitemradio" aria-checked={language.locale===locale} tabIndex={active===index?0:-1} onFocus={()=>setActive(index)} onClick={()=>choose(language.locale)}>
        <span className="language-option-copy"><span className="language-option-native" lang={language.locale}>{language.nativeLabel}</span>{language.label!==language.nativeLabel&&<span className="language-option-name" lang="en">{language.label}</span>}</span>
        {language.locale===locale&&<Check aria-hidden="true" size={16}/ >}
      </button>)}
    </div>}
  </div>
}

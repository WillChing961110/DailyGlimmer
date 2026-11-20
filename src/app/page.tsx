'use client';
import {useEffect} from 'react';
import {entries,type Locale,route} from '../lib/content';
export default function LegacyRoot(){useEffect(()=>{const p=new URLSearchParams(location.search);const lang=(p.get('lang')==='zh'||p.get('lang')==='zh-TW'?p.get('lang'):'en') as Locale;const old=location.hash.match(/day\/(day-\d+)/)?.[1];const entry=entries.find(e=>e.id===old);location.replace(old&&entry?route(lang,entry.publishDate):`/${lang}`)},[]);return <p className="empty">Opening Daily Glimmer…</p>}

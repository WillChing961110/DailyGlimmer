'use client';
import {useRouter,usePathname} from 'next/navigation';import type {Locale} from '../lib/content';
export function LanguageSelect({locale}:{locale:Locale}){const router=useRouter(),path=usePathname();return <select aria-label="Language" value={locale} onChange={e=>router.push(path.replace(/^\/[^/]+/,`/${e.target.value}`))}><option value="en">English</option><option value="zh">简体中文</option><option value="zh-TW">繁體中文</option></select>}

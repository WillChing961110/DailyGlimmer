import './globals.css';
import type { Metadata } from 'next';import {siteUrl} from '../lib/content';
export const metadata: Metadata = { title: 'Daily Glimmer', description: 'A thoughtful daily quote, a quiet landscape, and one small thing to try today.', metadataBase: new URL(siteUrl), icons:{icon:'/favicon.svg'} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap" rel="stylesheet"/></head><body>{children}</body></html>; }

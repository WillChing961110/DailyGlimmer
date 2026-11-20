import Link from 'next/link';
import {copy,route,text,type Entry,type Locale} from '../lib/content';
import {QuoteActions} from './QuoteActions';

export function DailyCard({entry,locale,previous,next}:{entry:Entry;locale:Locale;previous?:Entry;next?:Entry}) {
  const [year,month,day]=entry.publishDate.split('-');
  const dateLocale=locale==='zh'?'zh-CN':locale;
  const date=new Date(`${entry.publishDate}T00:00:00Z`);
  const weekday=new Intl.DateTimeFormat(dateLocale,{weekday:'long',timeZone:'UTC'}).format(date);
  const dateLabel=new Intl.DateTimeFormat(dateLocale,{month:'short',day:'numeric',timeZone:'UTC'}).format(date);
  const c=copy[locale];
  return <section className="daily hero" data-enter>
    <div className="edition"><div className="edition-kicker">{locale==='en'?'A little light for today':'今日的一束微光'}</div><time dateTime={entry.publishDate}>{new Intl.DateTimeFormat(dateLocale,{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date)}</time></div>
    <div className="daily-grid">
      <div className="reading">
        <div className="date-block"><span className="date-day">{day}</span><div className="date-month">{weekday}<br/>{dateLabel}</div></div>
        <p className="theme">{text(entry,locale,'theme')}</p>
        <blockquote className="quote">{text(entry,locale,'quote')}</blockquote>
        <p className="quote-attribution">— {entry.quoteType==='quotation'?<>{entry.quoteAuthor} · <cite>{entry.quoteWork}</cite> · <a href={entry.quoteSourceUrl} target="_blank" rel="noopener">{c.source}</a>{locale!=='en'&&<span>（{c.translation}）</span>}</>:c.original}</p>
        <QuoteActions entry={entry} locale={locale}/>
      </div>
      <figure className="photo-frame"><img src={entry.image.replace('./','/')} alt={text(entry,locale,'imageAlt')} width="1200" height="800"/></figure>
    </div>
    <div className="action-row"><h2>{c.action}</h2><p>{text(entry,locale,'action')}</p></div>
    <nav className="day-nav" aria-label={locale==='en'?'More daily notes':locale==='zh'?'更多每日语录':'更多每日語錄'}>
      {previous?<Link href={`${route(locale,previous.publishDate)}/`}>← {locale==='en'?'Earlier':locale==='zh'?'更早':'較早'} · {previous.publishDate.slice(5)}</Link>:<span>{locale==='en'?'You’re at the first note':locale==='zh'?'这是第一篇日签':'這是第一篇日簽'}</span>}
      <Link href={`/${locale}/archive/`}>{c.archive}</Link>
      {next?<Link href={`${route(locale,next.publishDate)}/`}>{locale==='en'?'Later':locale==='zh'?'更新':'較新'} · {next.publishDate.slice(5)} →</Link>:<span>{locale==='en'?'A little light, every day':'每天一束微光'}</span>}
    </nav>
    <div id="poster-root"/>
  </section>;
}

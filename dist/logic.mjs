export function beijingDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const value = type => parts.find(p => p.type === type).value;
  return value('year') + '-' + value('month') + '-' + value('day');
}
export function publishedEntries(entries, date) {
  return entries.filter(e => e.publishDate <= date).sort((a,b) => b.publishDate.localeCompare(a.publishDate));
}

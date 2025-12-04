import RSSParser from 'rss-parser';

const parser = new RSSParser();

const FEEDS = [
  'https://www.news24.com/rss',
  'https://www.iol.co.za/rss',
  'https://mg.co.za/feed/',
  'https://www.dailymaverick.co.za/feed/',
  'https://mybroadband.co.za/news/feed/',
  'https://www.businesslive.co.za/rss',
];

export default async function handler() {
  let articles = [];

  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.slice(0, 6).forEach(item => {
        articles.push({
          title: item.title || 'No title',
          link: item.link || '#',
          date: item.pubDate || item.isoDate,
          snippet: (item.contentSnippet || item.content || '').substring(0, 180) + '...',
          source: feed.title?.replace(' | News24', '').trim() || new URL(url).hostname
        });
      });
    } catch (e) {
      console.error('Feed failed:', url);
    }
  }

  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  return new Response(JSON.stringify(articles.slice(0, 30)), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*'
    },
  });
}

export const runtime = 'edge';

import RSSParser from 'rss-parser';

const parser = new RSSParser();

const FEEDS = [
  'https://www.news24.com/rss',
  'https://mg.co.za/feed/',
  'https://www.iol.co.za/rss',
  'https://www.dailymaverick.co.za/feed/',
  'https://mybroadband.co.za/news/feed/',
];

export default async function handler(req) {
  let articles = [];

  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.slice(0, 6).forEach(item => {
        articles.push({
          title: item.title || 'Untitled',
          link: item.link || '#',
          date: item.pubDate || item.isoDate,
          snippet: (item.contentSnippet || item.content || '').substring(0, 180) + '...',
          source: feed.title || new URL(url).hostname
        });
      });
    } catch (e) {
      console.error('Feed failed:', url);
    }
  }

  // Sort newest first
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Return JSON directly (no file system needed)
  return new Response(JSON.stringify(articles.slice(0, 30)), {
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    },
  });
}

// Important: run on Edge (fastest + works with cron)
export const runtime = 'edge';

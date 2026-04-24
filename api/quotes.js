export const config = { runtime: 'edge' };

const SYMBOLS = '^GSPTSE,^GSPC,XIU.TO,VFV.TO,CM.TO,SHOP.TO,RY.TO,BTC-USD';

const DISPLAY = {
  '^GSPTSE': { sym: 'TSX',  name: 'S&P/TSX Composite' },
  '^GSPC':   { sym: 'SPX',  name: 'S&P 500' },
  'XIU.TO':  { sym: 'XIU',  name: 'iShares S&P/TSX 60' },
  'VFV.TO':  { sym: 'VFV',  name: 'Vanguard S&P 500 CAD' },
  'CM.TO':   { sym: 'CM',   name: 'CIBC' },
  'SHOP.TO': { sym: 'SHOP', name: 'Shopify Inc.' },
  'RY.TO':   { sym: 'RY',   name: 'Royal Bank of Canada' },
  'BTC-USD': { sym: 'BTC',  name: 'Bitcoin / USD' },
};

export default async function handler() {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${SYMBOLS}&fields=regularMarketPrice,regularMarketChangePercent,shortName`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cf: { cacheTtl: 30 },
      }
    );

    if (!res.ok) throw new Error(`Yahoo returned ${res.status}`);

    const data = await res.json();
    const results = data?.quoteResponse?.result ?? [];

    const quotes = results.map(q => {
      const d = DISPLAY[q.symbol] ?? { sym: q.symbol, name: q.shortName ?? q.symbol };
      return {
        sym:   d.sym,
        name:  d.name,
        price: q.regularMarketPrice ?? 0,
        chg:   q.regularMarketChangePercent ?? 0,
      };
    });

    return new Response(JSON.stringify(quotes), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

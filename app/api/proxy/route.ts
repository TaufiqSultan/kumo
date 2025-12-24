
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { LineTransform, allowedExtensions } from '@/lib/proxy/transform';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const customReferer = req.nextUrl.searchParams.get('referer');

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const isStaticFiles = allowedExtensions.some(ext => url.endsWith(ext));
  


  try {
    const targetUrl = new URL(url);
    const origin = targetUrl.origin;
    
    // Some providers (like MegaCloud) are very picky about Referer.
    // We prioritize the custom referer passed from the frontend.
    const referer = customReferer || origin + "/";

    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        Accept: "*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: referer,
        Origin: origin
      }
    });

    const headers = new Headers();
    Object.entries(response.headers).forEach(([key, value]) => {
         // Axios headers can be string or array of strings. 
         // We need to handle both for Next.js Headers.
         if (key === 'content-length' && !isStaticFiles) return;

         if (Array.isArray(value)) {
             value.forEach(v => headers.append(key, v));
         } else if (value) {
             headers.set(key, String(value));
         }
    });
    
    // Set CORS and Cache headers
    if (response.headers['cache-control']) {
        headers.set('Cache-Control', response.headers['cache-control']);
    }

    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "*");
    headers.set("Access-Control-Allow-Methods", "*");

    // Pass-through for static files
    if (isStaticFiles || !url.endsWith(".m3u8")) {
         return new NextResponse(response.data, {
            status: response.status,
            headers: headers
         });
    }

    // Transform m3u8 playlists
    const transform = new LineTransform(url, customReferer || undefined);
    const stream = response.data.pipe(transform);

    return new NextResponse(stream as unknown as ReadableStream, {
        status: response.status,
        headers: headers
    });

  } catch (error: unknown) {
    const err = error as { response?: { status: number, statusText: string }, message: string };
    console.error("Proxy error for URL:", url);
    if (err.response) {
        console.error("Upstream status:", err.response.status);
        console.error("Upstream status text:", err.response.statusText);
    } else {
        console.error("Error message:", err.message);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

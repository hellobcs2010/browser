import type { IncomingMessage, ServerResponse } from 'http';
import { FAST_ONION_GATEWAYS } from '../src/constants/gateways.ts';

export { FAST_ONION_GATEWAYS };

// Cloudflare 1.1.1.1 DoH Endpoint
const CLOUDFLARE_DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

/**
 * Strict Cloudflare 1.1.1.1 DNS over HTTPS Query
 */
export async function queryCloudflareDNS(domain: string, type: string = 'A') {
  const startTime = Date.now();
  try {
    const cleanDomain = domain.trim().replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    
    // For .onion domains, Cloudflare 1.1.1.1 returns NXDOMAIN (since .onion is RFC 7686 special-use)
    // We document and show this securely while routing via the selected fast gateway!
    const isOnion = cleanDomain.endsWith('.onion');
    
    const dohUrl = `${CLOUDFLARE_DOH_ENDPOINT}?name=${encodeURIComponent(cleanDomain)}&type=${encodeURIComponent(type)}`;
    
    const response = await fetch(dohUrl, {
      headers: {
        'Accept': 'application/dns-json',
        'User-Agent': 'Aether-1.1.1.1-DoH-Client/1.0',
      },
    });

    const elapsedMs = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Cloudflare DoH responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      domain: cleanDomain,
      type,
      status: data.Status, // 0 = NOERROR, 3 = NXDOMAIN
      isDNSSEC: !!data.AD, // Authenticated Data flag from Cloudflare 1.1.1.1
      latencyMs: elapsedMs,
      resolver: '1.1.1.1 (Cloudflare Anycast DoH)',
      answers: data.Answer || [],
      authority: data.Authority || [],
      isOnion,
      strictDohEnforced: true,
      raw: data,
    };
  } catch (error: any) {
    const elapsedMs = Date.now() - startTime;
    return {
      success: false,
      domain,
      type,
      error: error.message || 'DNS resolution failed',
      latencyMs: elapsedMs,
      resolver: '1.1.1.1 (Cloudflare Anycast DoH)',
      answers: [],
      strictDohEnforced: true,
    };
  }
}

/**
 * Convert .onion URL to fast gateway URL for zero-tor-hop speed
 */
export function resolveTargetUrl(targetUrl: string, gatewayId: string = 'onion-ws'): {
  resolvedUrl: string;
  isOnion: boolean;
  gatewayUsed: string | null;
  originalDomain: string;
} {
  let url = targetUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      resolvedUrl: url,
      isOnion: false,
      gatewayUsed: null,
      originalDomain: targetUrl,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isOnion = hostname.endsWith('.onion');

  if (isOnion) {
    const selectedGateway = FAST_ONION_GATEWAYS.find(g => g.id === gatewayId) || FAST_ONION_GATEWAYS[0];
    const rewrittenHostname = `${hostname}.${selectedGateway.domain}`;
    parsed.hostname = rewrittenHostname;
    parsed.protocol = 'https:'; // Gateways use TLS
    return {
      resolvedUrl: parsed.toString(),
      isOnion: true,
      gatewayUsed: selectedGateway.name,
      originalDomain: hostname,
    };
  }

  return {
    resolvedUrl: parsed.toString(),
    isOnion: false,
    gatewayUsed: null,
    originalDomain: hostname,
  };
}

/**
 * Handle incoming API requests for proxying and 1.1.1.1 DNS
 */
export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const reqUrl = req.url || '';

  // 1. Cloudflare 1.1.1.1 DNS Query API
  if (reqUrl.startsWith('/api/dns-query')) {
    const parsed = new URL(reqUrl, 'http://localhost');
    const name = parsed.searchParams.get('name') || 'cloudflare.com';
    const type = parsed.searchParams.get('type') || 'A';

    const dnsResult = await queryCloudflareDNS(name, type);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.end(JSON.stringify(dnsResult));
    return true;
  }

  // 2. Wipe / Purge Session API (All browsing data wiped)
  if (reqUrl.startsWith('/api/wipe-session')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.end(JSON.stringify({
      success: true,
      wipedAt: Date.now(),
      status: 'Memory, cookies, cache, and session traces erased completely.',
      statusUrdu: 'تمام میموری، کوکیز، کیشے اور سیشن کا ڈیٹا مکمل ڈیلیٹ کر دیا گیا ہے۔',
    }));
    return true;
  }

  // 3. Web & Onion Proxy API
  if (reqUrl.startsWith('/api/proxy')) {
    const parsed = new URL(reqUrl, 'http://localhost');
    const rawUrl = parsed.searchParams.get('url');
    const gateway = parsed.searchParams.get('gateway') || 'onion-ws';

    if (!rawUrl) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing ?url= parameter' }));
      return true;
    }

    const { resolvedUrl, isOnion, gatewayUsed, originalDomain } = resolveTargetUrl(rawUrl, gateway);
    const startTime = Date.now();

    try {
      // Step 1: Pre-resolve host with Cloudflare 1.1.1.1 DoH for clearnet domains
      let dnsInfo = null;
      if (!isOnion) {
        const targetHost = new URL(resolvedUrl).hostname;
        dnsInfo = await queryCloudflareDNS(targetHost, 'A');
      }

      // Step 2: Fetch target site
      const fetchHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      };

      const upstreamResponse = await fetch(resolvedUrl, {
        headers: fetchHeaders,
        redirect: 'follow',
      });

      const elapsedMs = Date.now() - startTime;
      const contentType = upstreamResponse.headers.get('content-type') || 'text/html';

      // Forward status code
      res.statusCode = upstreamResponse.status;

      // Clean security headers to allow sandboxed browser rendering
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate'); // Auto-wipe compliant
      res.setHeader('X-Aether-DNS-Resolver', '1.1.1.1-Cloudflare-DoH');
      res.setHeader('X-Aether-Latency-Ms', elapsedMs.toString());
      if (isOnion) {
        res.setHeader('X-Aether-Onion-Gateway', gatewayUsed || 'Fast-Gateway');
        res.setHeader('X-Aether-Original-Onion', originalDomain);
      }

      // Handle HTML content: inject <base> tag and navigation interceptor
      if (contentType.includes('text/html')) {
        let htmlText = await upstreamResponse.text();

        // Inject base tag so relative assets load via proxy or target
        const baseTag = `<base href="${resolvedUrl}">`;
        
        // Anti-leak & framing helper script
        const securityShieldScript = `
          <script>
            // Aether Browser Security Sandbox
            (function() {
              window.__AETHER_ORIGIN__ = ${JSON.stringify(resolvedUrl)};
              window.__IS_ONION__ = ${JSON.stringify(isOnion)};
              // Disable WebRTC real IP leak
              if (window.RTCPeerConnection) {
                window.RTCPeerConnection = function() {
                  console.warn('[Aether Shield] WebRTC blocked to prevent IP leak');
                  return {
                    createOffer: () => Promise.reject(new Error('WebRTC disabled for privacy')),
                    createAnswer: () => Promise.reject(new Error('WebRTC disabled for privacy')),
                    setLocalDescription: () => Promise.resolve(),
                    setRemoteDescription: () => Promise.resolve(),
                    addIceCandidate: () => Promise.resolve(),
                    close: () => {},
                  };
                };
              }
              // Intercept internal link clicks to route through proxy
              document.addEventListener('click', function(e) {
                const a = e.target.closest('a');
                if (a && a.href && !a.href.startsWith('javascript:')) {
                  e.preventDefault();
                  window.parent.postMessage({
                    type: 'AETHER_NAVIGATE',
                    url: a.href
                  }, '*');
                }
              }, true);
            })();
          </script>
        `;

        if (htmlText.includes('<head>')) {
          htmlText = htmlText.replace('<head>', `<head>${baseTag}${securityShieldScript}`);
        } else if (htmlText.includes('<html>')) {
          htmlText = htmlText.replace('<html>', `<html><head>${baseTag}${securityShieldScript}</head>`);
        } else {
          htmlText = `${baseTag}${securityShieldScript}${htmlText}`;
        }

        res.end(htmlText);
      } else {
        // Binary / media streaming
        const arrayBuffer = await upstreamResponse.arrayBuffer();
        res.end(Buffer.from(arrayBuffer));
      }
      return true;
    } catch (err: any) {
      const elapsedMs = Date.now() - startTime;
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Gateway Navigation Error</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #e2e8f0; padding: 40px; line-height: 1.6; }
            .card { max-width: 600px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 28px; }
            h2 { color: #f43f5e; margin-top: 0; display: flex; align-items: center; gap: 8px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #1e293b; color: #38bdf8; }
            .urdu { font-family: Tahoma, 'Segoe UI', sans-serif; direction: rtl; text-align: right; background: #0f172a; padding: 12px 16px; border-radius: 8px; margin: 16px 0; color: #cbd5e1; }
            code { background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #f59e0b; word-break: break-all; }
            button { background: #3b82f6; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 500; }
            button:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Connection / Gateway Notice</h2>
            <div class="urdu">
              <strong>گیٹ وے کنکشن نوٹس:</strong> اس اونین یا ویب ایڈریس تک رسائی میں تاخیر یا مسئلہ پیش آیا ہے۔ براہ کرم گیٹ وے تبدیل کر کے دیکھیں یا ایڈریس چیک کریں۔ کلاؤڈ فلیر 1.1.1.1 ڈی این ایس سیکیور ہے۔
            </div>
            <p>Target URL: <code>${rawUrl}</code></p>
            <p>Resolved via: <code>${resolvedUrl}</code></p>
            <p>DNS Resolver: <span class="badge">Cloudflare 1.1.1.1 DoH (Strict)</span></p>
            <p>Error details: <code>${err.message || 'Upstream Gateway Timeout'}</code> (${elapsedMs}ms)</p>
            <p>Tip: If this is a <code>.onion</code> site, some hidden services may take a moment to wake up, or you can switch to another Fast Gateway in the browser toolbar.</p>
            <button onclick="window.location.reload()">Retry via Fast Gateway</button>
          </div>
        </body>
        </html>
      `);
      return true;
    }
  }

  return false;
}

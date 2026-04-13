import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting for public API endpoints using Upstash Redis.
 *
 * Tiers:
 * - Anonymous (by IP): 60 requests/minute
 * - API Key (X-API-Key header): 600 requests/minute
 *
 * Graceful degradation: if Redis is unavailable, requests pass through.
 */

let anonymousLimiter: Ratelimit | null = null;
let apiKeyLimiter: Ratelimit | null = null;

function initLimiters() {
  if (anonymousLimiter) return;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[ratelimit] UPSTASH_REDIS_REST_URL or TOKEN not set — rate limiting disabled');
    return;
  }

  const redis = new Redis({ url, token });

  anonymousLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'rl:anon',
  });

  apiKeyLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(600, '1 m'),
    prefix: 'rl:apikey',
  });
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a request. Returns null if rate limiting is disabled
 * or Redis is unavailable (fail open).
 */
export async function checkRateLimit(
  request: NextRequest
): Promise<RateLimitResult | null> {
  try {
    initLimiters();

    const apiKey = request.headers.get('x-api-key');
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

    if (apiKey && apiKeyLimiter) {
      const result = await apiKeyLimiter.limit(`apikey_${apiKey}`);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    }

    if (anonymousLimiter) {
      const result = await anonymousLimiter.limit(`ip_${ip}`);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    }

    return null;
  } catch (error) {
    console.error('[ratelimit] Redis error, failing open:', error);
    return null;
  }
}

/**
 * Generate rate limit headers from a result.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
}

/**
 * Returns a 429 response if rate limited, or null if the request should proceed.
 * Attaches rate limit headers to let the caller merge them into success responses.
 */
export async function applyRateLimit(
  request: NextRequest
): Promise<{ response: NextResponse; headers: Record<string, string> } | null> {
  const result = await checkRateLimit(request);

  if (!result) return null; // Rate limiting disabled, pass through

  const headers = rateLimitHeaders(result);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    return {
      response: NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${retryAfter}s.`,
          reset: new Date(result.reset).toISOString(),
        },
        {
          status: 429,
          headers: { ...headers, 'Retry-After': String(retryAfter) },
        }
      ),
      headers,
    };
  }

  return { response: null as unknown as NextResponse, headers };
}

declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface RuntimeCaching {
    urlPattern: RegExp | string;
    handler: 'CacheFirst' | 'CacheOnly' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate';
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
      networkTimeoutSeconds?: number;
      cacheableResponse?: {
        statuses?: number[];
      };
    };
  }

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    reloadOnOnline?: boolean;
    cacheOnFrontEndNav?: boolean;
    fallbacks?: {
      document?: string;
      image?: string;
      font?: string;
    };
    runtimeCaching?: RuntimeCaching[];
    buildExcludes?: (string | RegExp)[];
    publicExcludes?: string[];
    scope?: string;
    sw?: string;
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
  }

  export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}

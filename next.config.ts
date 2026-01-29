import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true, // 新しいSWをすぐに有効化（アップデート反映問題対応）
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true, // オンライン復帰時にリロード
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: "/offline", // オフライン時のフォールバックページ
  },
  // キャッシュ戦略: Network Firstでアップデートを優先
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "firebase-data",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1時間
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30日
        },
      },
    },
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1時間
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

const nextConfig: NextConfig = {
  trailingSlash: false,
};

export default withPWA(nextConfig);

module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{html,css,js,webp,png,jpg,avif}"],
  swDest: "dist/sw.js",
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB limit for precaching
  // Workbox v7+ uses different runtime caching configuration
  runtimeCaching: [
    // Cache images and videos in public directories
    {
      urlPattern: /\/public\/images\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "public-images",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    // Cache videos
    {
      urlPattern: /\/public\/videos\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "public-videos",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    // Cache Leaflet tiles
    {
      urlPattern: /https:\/\/(?:a|b|c)\.tile\.openstreetmap\.org\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "leaflet-tiles",
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    // Cache Google Fonts
    {
      urlPattern: /https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    }
  ]
};

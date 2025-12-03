module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{html,css,js,webp,png,jpg}"],
  swDest: "dist/sw.js",
  runtimeCaching: [{
    urlPattern: /\.(?:png|jpg|jpeg|webp|svg)$/,
    handler: "CacheFirst",
    options: { cacheName: "images" }
  }]
};

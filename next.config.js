/** @type {import('next').NextConfig} */

// module.exports = {
//   reactStrictMode: true,
// };

const runtimeCaching = require("next-pwa/cache");
const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    runtimeCaching,
    buildExcludes: [/manifest.json$/],
});

const nextConfig = withPWA({
    // next config
});
module.exports = nextConfig;

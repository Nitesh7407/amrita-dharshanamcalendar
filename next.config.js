/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib', '@pdf-lib/fontkit', 'fontkit'],
  },
};

module.exports = nextConfig;

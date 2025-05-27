/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Increase the maximum file size for uploads
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
}

module.exports = nextConfig 
const isVercel = Boolean(process.env.VERCEL)
const backendUrl = (process.env.BACKEND_URL ?? (isVercel ? '' : 'http://localhost:4000')).replace(/\/+$/, '')

if (!backendUrl) {
  console.warn(
    '[next.config] BACKEND_URL is not set. Set it to the deployed NestJS backend URL (e.g. https://your-backend.vercel.app) or /api/chat will 404.',
  )
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (!backendUrl) return []
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig

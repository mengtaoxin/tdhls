/**
 * Production PWA contract consumed by Vite.
 * The service worker only keeps the app shell; HLS playlists and segments always hit the network.
 */
export const pwaOptions = {
  registerType: 'autoUpdate' as const,
  includeAssets: ['favicon.svg'],
  manifest: {
    name: 'tdhls',
    short_name: 'tdhls',
    description: 'HLS player in the browser',
    start_url: '/',
    scope: '/',
    display: 'standalone' as const,
    background_color: '#101820',
    theme_color: '#101820',
    lang: 'en',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
    globIgnores: ['**/*.{m3u8,ts,m4s,mp4,aac}'],
    navigateFallback: 'index.html',
    navigateFallbackDenylist: [/\.(?:m3u8|ts|m4s|mp4|aac)$/i],
    cleanupOutdatedCaches: true,
  },
};

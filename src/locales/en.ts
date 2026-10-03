export default {
  nav: {
    home: 'Home',
    about: 'About',
    language: 'Language',
  },
  home: {
    title: 'HLS streams, in the browser',
    lead: 'No account. No backend. Paste an .m3u8 URL and watch.',
    urlLabel: 'Stream URL (.m3u8)',
    play: 'Play',
    invalidUrl: 'Enter a full http:// or https:// URL.',
    history: {
      title: 'Recent streams',
      play: 'Play {url}',
      remove: 'Remove {url}',
    },
  },
  watch: {
    back: 'Back to home',
    player: 'Video player',
    live: 'LIVE',
    latency: '{seconds}s behind live',
    backToLive: 'Back to live',
    controls: {
      play: 'Play',
      pause: 'Pause',
      mute: 'Mute',
      unmute: 'Unmute',
      seek: 'Seek',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit fullscreen',
    },
    error: {
      invalidUrl: 'This stream URL is missing or invalid.',
      network: 'The stream could not be loaded. Check the URL and that the server allows CORS.',
      media: 'The stream could not be decoded.',
      unsupported: 'This browser cannot play HLS streams.',
    },
  },
  settings: {
    title: 'Settings',
    liveDelay: 'Live delay',
    liveDelayOption: '{seconds}s',
  },
  about: {
    github: 'GitHub repository',
  },
  locale: {
    en: 'English',
    zh: '中文',
  },
};

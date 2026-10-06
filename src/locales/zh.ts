import type en from './en';

export default {
  nav: {
    home: '首页',
    about: '关于',
  },
  home: {
    title: '在浏览器里播放 HLS 流',
    lead: '无需账号，无需后端。粘贴 .m3u8 地址即可观看。',
    urlLabel: '视频流地址（.m3u8）',
    play: '播放',
    invalidUrl: '请输入完整的 http:// 或 https:// 地址。',
    history: {
      title: '最近播放',
      play: '播放 {url}',
      remove: '删除 {url}',
    },
  },
  watch: {
    back: '返回首页',
    player: '视频播放器',
    live: '直播',
    latency: '落后直播 {seconds} 秒',
    backToLive: '回到直播',
    controls: {
      play: '播放',
      pause: '暂停',
      mute: '静音',
      unmute: '取消静音',
      seek: '进度',
      fullscreen: '全屏',
      exitFullscreen: '退出全屏',
    },
    error: {
      invalidUrl: '视频流地址缺失或无效。',
      network: '无法加载视频流。请检查地址，并确认服务器允许跨域（CORS）。',
      media: '视频流无法解码。',
      unsupported: '此浏览器不支持播放 HLS 视频流。',
    },
  },
  settings: {
    title: '设置',
    language: '语言',
    liveDelay: '直播延迟',
    liveDelayOption: '{seconds} 秒',
  },
  about: {
    github: 'GitHub 仓库',
  },
  locale: {
    en: 'English',
    zh: '中文',
  },
} satisfies typeof en;

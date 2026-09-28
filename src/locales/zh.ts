import type en from './en';

export default {
  nav: {
    home: '首页',
    about: '关于',
    language: '语言',
  },
  home: {
    title: '在浏览器里播放 HLS 流',
    lead: '无需账号，无需后端。粘贴 .m3u8 地址即可观看。',
    comingSoon: '播放功能尚未实现。',
  },
  about: {
    github: 'GitHub 仓库',
  },
  locale: {
    en: 'English',
    zh: '中文',
  },
} satisfies typeof en;

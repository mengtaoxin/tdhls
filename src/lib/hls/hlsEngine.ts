import Hls, { ErrorTypes, Events, type HlsConfig } from 'hls.js';

export type FatalErrorType = 'network' | 'media' | 'other';

export type HlsEngineEvents = {
  onLive: (live: boolean) => void;
  onFatalError: (type: FatalErrorType) => void;
};

/** The subset of an hls.js instance the player adapter relies on. */
export type HlsInstance = {
  load: (url: string, media: HTMLMediaElement) => void;
  updateConfig: (patch: Partial<HlsConfig>) => void;
  recoverMediaError: () => void;
  destroy: () => void;
  readonly latency: number;
  readonly liveSyncPosition: number | null;
};

export type HlsEngine = {
  isSupported: () => boolean;
  create: (config: Partial<HlsConfig>, events: HlsEngineEvents) => HlsInstance;
};

function toFatalErrorType(type: ErrorTypes): FatalErrorType {
  if (type === ErrorTypes.NETWORK_ERROR) return 'network';
  if (type === ErrorTypes.MEDIA_ERROR) return 'media';
  return 'other';
}

export const hlsJsEngine: HlsEngine = {
  isSupported: () => Hls.isSupported(),

  create(config, events) {
    const hls = new Hls(config);
    hls.on(Events.LEVEL_LOADED, (_event, data) => events.onLive(data.details.live));
    hls.on(Events.ERROR, (_event, data) => {
      if (data.fatal) events.onFatalError(toFatalErrorType(data.type));
    });

    return {
      load(url, media) {
        hls.attachMedia(media);
        hls.loadSource(url);
      },
      updateConfig(patch) {
        Object.assign(hls.config, patch);
      },
      recoverMediaError: () => hls.recoverMediaError(),
      destroy: () => hls.destroy(),
      get latency() {
        return hls.latency;
      },
      get liveSyncPosition() {
        return hls.liveSyncPosition;
      },
    };
  },
};

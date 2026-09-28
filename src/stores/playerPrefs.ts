import { create } from 'zustand';

import {
  clampVolume,
  resolvePlayerPrefs,
  writeLiveDelay,
  writeMuted,
  writeVolume,
  type LiveDelay,
  type PlayerPrefs,
} from '@/lib/hls/playerPrefs';

type PlayerPrefsState = PlayerPrefs & {
  setLiveDelay: (value: LiveDelay) => void;
  setVolume: (value: number) => void;
  setMuted: (value: boolean) => void;
};

export const usePlayerPrefsStore = create<PlayerPrefsState>((set) => ({
  ...resolvePlayerPrefs(),

  setLiveDelay(value) {
    writeLiveDelay(value);
    set({ liveDelaySec: value });
  },

  setVolume(value) {
    const volume = clampVolume(value);
    writeVolume(volume);
    set({ volume });
  },

  setMuted(value) {
    writeMuted(value);
    set({ muted: value });
  },
}));

import { create } from 'zustand';

import {
  resolvePlayerPrefs,
  writeLiveDelay,
  writeMuted,
  type LiveDelay,
  type PlayerPrefs,
} from '@/lib/hls/playerPrefs';

type PlayerPrefsState = PlayerPrefs & {
  setLiveDelay: (value: LiveDelay) => void;
  setMuted: (value: boolean) => void;
};

export const usePlayerPrefsStore = create<PlayerPrefsState>((set) => ({
  ...resolvePlayerPrefs(),

  setLiveDelay(value) {
    writeLiveDelay(value);
    set({ liveDelaySec: value });
  },

  setMuted(value) {
    writeMuted(value);
    set({ muted: value });
  },
}));

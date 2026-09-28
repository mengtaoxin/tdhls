import { useState } from 'react';

import { addStreamHistory, readStreamHistory, removeStreamHistory } from '@/lib/hls/streamHistory';

export function useStreamHistory() {
  const [history, setHistory] = useState(readStreamHistory);

  return {
    history,
    add: (url: string) => setHistory(addStreamHistory(url)),
    remove: (url: string) => setHistory(removeStreamHistory(url)),
  };
}

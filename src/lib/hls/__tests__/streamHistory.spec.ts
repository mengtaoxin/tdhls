import { describe, expect, it } from 'vitest';

import {
  STREAM_HISTORY_KEY,
  STREAM_HISTORY_LIMIT,
  addStreamHistory,
  readStreamHistory,
  removeStreamHistory,
} from '@/lib/hls/streamHistory';

const url = (n: number) => `https://example.com/${n}.m3u8`;

describe('streamHistory', () => {
  it('is empty when nothing is stored', () => {
    expect(readStreamHistory()).toEqual([]);
  });

  it('ignores corrupt or non-string stored entries', () => {
    localStorage.setItem(STREAM_HISTORY_KEY, '{not json');
    expect(readStreamHistory()).toEqual([]);

    localStorage.setItem(STREAM_HISTORY_KEY, JSON.stringify({ url: url(1) }));
    expect(readStreamHistory()).toEqual([]);

    localStorage.setItem(STREAM_HISTORY_KEY, JSON.stringify([url(1), 42, null, url(2)]));
    expect(readStreamHistory()).toEqual([url(1), url(2)]);
  });

  it('adds the newest URL first and persists it', () => {
    addStreamHistory(url(1));
    const history = addStreamHistory(url(2));

    expect(history).toEqual([url(2), url(1)]);
    expect(readStreamHistory()).toEqual([url(2), url(1)]);
  });

  it('moves a repeated URL to the top instead of duplicating it', () => {
    addStreamHistory(url(1));
    addStreamHistory(url(2));

    expect(addStreamHistory(url(1))).toEqual([url(1), url(2)]);
  });

  it(`keeps at most ${STREAM_HISTORY_LIMIT} URLs, dropping the oldest`, () => {
    for (let n = 1; n <= STREAM_HISTORY_LIMIT + 2; n += 1) addStreamHistory(url(n));

    const history = readStreamHistory();
    expect(STREAM_HISTORY_LIMIT).toBe(10);
    expect(history).toHaveLength(STREAM_HISTORY_LIMIT);
    expect(history[0]).toBe(url(STREAM_HISTORY_LIMIT + 2));
    expect(history).not.toContain(url(1));
    expect(history).not.toContain(url(2));
  });

  it('removes a URL', () => {
    addStreamHistory(url(1));
    addStreamHistory(url(2));

    expect(removeStreamHistory(url(1))).toEqual([url(2)]);
    expect(readStreamHistory()).toEqual([url(2)]);
  });
});

import { useRef, type KeyboardEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { PlayerControls } from '@/components/PlayerControls';
import { useAutoHideControls } from '@/hooks/useAutoHideControls';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';
import { useVideoControls } from '@/hooks/useVideoControls';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';

export function VideoPlayer({ url }: { url: string }) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const liveDelaySec = usePlayerPrefsStore((s) => s.liveDelaySec);
  const player = useHlsPlayer(videoRef, url, liveDelaySec);
  const controls = useVideoControls(videoRef, containerRef);
  const autoHide = useAutoHideControls(controls.isFullscreen);
  const controlsHidden = !autoHide.visible;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    autoHide.reveal();
    // Space on a focused button already activates that button.
    if (event.key === ' ' && event.target === event.currentTarget) {
      event.preventDefault();
      controls.togglePlay();
    } else if (event.key === 'm' || event.key === 'M') {
      controls.toggleMute();
    }
  };

  return (
    <>
      <Box
        ref={containerRef}
        role="region"
        aria-label={t('watch.player')}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={autoHide.reveal}
        onPointerMove={autoHide.reveal}
        sx={(theme) => ({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: theme.layout.radiusLg,
          overflow: 'hidden',
          cursor: controlsHidden ? 'none' : undefined,
          '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}` },
          '&:fullscreen': { borderRadius: 0 },
          '&:fullscreen video': { flex: 1, minHeight: 0, aspectRatio: 'auto' },
        })}
      >
        <Box
          component="video"
          ref={videoRef}
          data-testid="player-video"
          autoPlay
          playsInline
          sx={{
            display: 'block',
            width: '100%',
            aspectRatio: '16 / 9',
            objectFit: 'contain',
            bgcolor: 'common.black',
          }}
        />
        <Box
          aria-hidden={controlsHidden || undefined}
          inert={controlsHidden}
          sx={(theme) => ({
            transition: theme.transitions.create(['opacity', 'visibility']),
            ...(controls.isFullscreen && {
              position: 'absolute',
              insetInline: 0,
              bottom: 0,
              bgcolor: alpha(theme.palette.background.paper, 0.85),
            }),
            ...(controlsHidden && { opacity: 0, visibility: 'hidden' }),
          })}
        >
          <PlayerControls
            controls={controls}
            isLive={player.isLive}
            latency={player.latency}
            liveDelaySec={liveDelaySec}
            onBackToLive={player.seekToLiveSync}
          />
        </Box>
      </Box>
      {player.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t(`watch.error.${player.error}`)}
        </Alert>
      )}
    </>
  );
}

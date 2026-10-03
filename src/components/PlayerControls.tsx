import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useTranslation } from 'react-i18next';

import type { VideoControls } from '@/hooks/useVideoControls';
import { formatTime } from '@/lib/hls/formatTime';
import type { LiveDelay } from '@/lib/hls/playerPrefs';

/** How far past the chosen delay playback may drift before offering "Back to live". */
const BACK_TO_LIVE_MARGIN_SEC = 10;

export type PlayerControlsProps = {
  controls: VideoControls;
  isLive: boolean;
  latency: number | null;
  liveDelaySec: LiveDelay;
  onBackToLive: () => void;
};

const sliderValue = (value: number | number[]) => (Array.isArray(value) ? (value[0] ?? 0) : value);

export function PlayerControls({
  controls,
  isLive,
  latency,
  liveDelaySec,
  onBackToLive,
}: PlayerControlsProps) {
  const { t } = useTranslation();
  const { paused, muted, currentTime, duration, isFullscreen } = controls;
  const canSeek = !isLive && Number.isFinite(duration) && duration > 0;
  const farBehindLive = latency != null && latency > liveDelaySec + BACK_TO_LIVE_MARGIN_SEC;

  return (
    <Box
      data-testid="player-controls"
      sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1, px: 1, py: 0.5 }}
    >
      <IconButton
        aria-label={paused ? t('watch.controls.play') : t('watch.controls.pause')}
        onClick={controls.togglePlay}
        color="inherit"
      >
        {paused ? <PlayArrowIcon /> : <PauseIcon />}
      </IconButton>

      <IconButton
        aria-label={muted ? t('watch.controls.unmute') : t('watch.controls.mute')}
        onClick={controls.toggleMute}
        color="inherit"
      >
        {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </IconButton>

      {isLive ? (
        <>
          <Chip label={t('watch.live')} color="primary" size="small" />
          {latency != null && (
            <Typography variant="body2" color="text.secondary">
              {t('watch.latency', { seconds: latency })}
            </Typography>
          )}
          {farBehindLive && (
            <Button size="small" variant="outlined" onClick={onBackToLive}>
              {t('watch.backToLive')}
            </Button>
          )}
        </>
      ) : (
        <>
          <Slider
            size="small"
            min={0}
            max={canSeek ? duration : 0}
            step={0.1}
            value={canSeek ? Math.min(currentTime, duration) : 0}
            disabled={!canSeek}
            onChange={(_event, value) => controls.seek(sliderValue(value))}
            slotProps={{ input: { 'aria-label': t('watch.controls.seek') } }}
            sx={{ flex: '1 1 8rem', mx: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {`${formatTime(currentTime)} / ${formatTime(duration)}`}
          </Typography>
        </>
      )}

      <Box sx={{ flex: 1 }} />

      <IconButton
        aria-label={
          isFullscreen ? t('watch.controls.exitFullscreen') : t('watch.controls.fullscreen')
        }
        onClick={controls.toggleFullscreen}
        color="inherit"
      >
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
    </Box>
  );
}

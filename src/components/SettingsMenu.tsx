import { useState, type MouseEvent } from 'react';
import IconButton from '@mui/material/IconButton';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

import { LIVE_DELAY_OPTIONS } from '@/lib/hls/playerPrefs';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';

export function SettingsMenu() {
  const { t } = useTranslation();
  const liveDelaySec = usePlayerPrefsStore((s) => s.liveDelaySec);
  const setLiveDelay = usePlayerPrefsStore((s) => s.setLiveDelay);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);
  const closeMenu = () => setAnchor(null);

  return (
    <>
      <IconButton
        data-testid="nav-settings-toggle"
        color="inherit"
        aria-label={t('settings.title')}
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
        onClick={openMenu}
      >
        <SettingsIcon />
      </IconButton>
      <Menu
        data-testid="nav-settings-menu"
        anchorEl={anchor}
        open={anchor != null}
        onClose={closeMenu}
      >
        <ListSubheader>{t('settings.liveDelay')}</ListSubheader>
        {LIVE_DELAY_OPTIONS.map((option) => (
          <MenuItem
            key={option}
            role="menuitemradio"
            aria-checked={option === liveDelaySec}
            selected={option === liveDelaySec}
            onClick={() => {
              setLiveDelay(option);
              closeMenu();
            }}
          >
            {t('settings.liveDelayOption', { seconds: option })}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

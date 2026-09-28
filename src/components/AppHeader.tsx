import { useState, type MouseEvent } from 'react';
import { Link } from '@tanstack/react-router';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';

import { SettingsMenu } from '@/components/SettingsMenu';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import { useLocaleStore } from '@/stores/locale';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/about', labelKey: 'nav.about' },
] as const;

export function AppHeader() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [localeAnchor, setLocaleAnchor] = useState<HTMLElement | null>(null);

  const openLocaleMenu = (event: MouseEvent<HTMLElement>) => setLocaleAnchor(event.currentTarget);
  const closeLocaleMenu = () => setLocaleAnchor(null);

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          data-testid="brand-title"
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, mr: 2 }}
        >
          tdhls
        </Typography>
        <Box component="nav" sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Button key={item.to} component={Link} to={item.to} color="inherit">
              {t(item.labelKey)}
            </Button>
          ))}
        </Box>
        <Button
          data-testid="nav-locale-toggle"
          color="inherit"
          startIcon={<TranslateIcon />}
          aria-label={t('nav.language')}
          aria-haspopup="menu"
          aria-expanded={localeAnchor ? 'true' : undefined}
          onClick={openLocaleMenu}
        >
          {t(`locale.${locale}`)}
        </Button>
        <Menu
          data-testid="nav-locale-menu"
          anchorEl={localeAnchor}
          open={localeAnchor != null}
          onClose={closeLocaleMenu}
        >
          {SUPPORTED_LOCALES.map((code) => (
            <MenuItem
              key={code}
              data-testid={`locale-option-${code}`}
              selected={code === locale}
              onClick={() => {
                setLocale(code);
                closeLocaleMenu();
              }}
            >
              {t(`locale.${code}`)}
            </MenuItem>
          ))}
        </Menu>
        <SettingsMenu />
      </Toolbar>
    </AppBar>
  );
}

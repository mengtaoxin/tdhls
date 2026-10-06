import { Link } from '@tanstack/react-router';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/about', labelKey: 'nav.about' },
] as const;

export function AppHeader() {
  const { t } = useTranslation();

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
        <IconButton
          component={Link}
          to="/settings"
          data-testid="nav-settings-link"
          color="inherit"
          aria-label={t('settings.title')}
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

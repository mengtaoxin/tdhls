import { useId } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import HistoryIcon from '@mui/icons-material/History';
import { useTranslation } from 'react-i18next';

type StreamHistoryListProps = {
  history: string[];
  onPlay: (url: string) => void;
  onRemove: (url: string) => void;
};

export function StreamHistoryList({ history, onPlay, onRemove }: StreamHistoryListProps) {
  const { t } = useTranslation();
  const titleId = useId();

  if (history.length === 0) return null;

  return (
    <Box component="section" sx={{ mt: 1 }}>
      <Typography
        id={titleId}
        variant="subtitle2"
        component="h2"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {t('home.history.title')}
      </Typography>
      <List
        aria-labelledby={titleId}
        disablePadding
        sx={{ bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}
      >
        {history.map((url) => (
          <ListItem
            key={url}
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                aria-label={t('home.history.remove', { url })}
                onClick={() => onRemove(url)}
              >
                <DeleteOutlinedIcon />
              </IconButton>
            }
          >
            <ListItemButton
              aria-label={t('home.history.play', { url })}
              onClick={() => onPlay(url)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary={url} slotProps={{ primary: { noWrap: true, title: url } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

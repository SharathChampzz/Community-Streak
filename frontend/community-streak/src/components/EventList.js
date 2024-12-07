import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

const EventList = ({ events, onEventClick, title, streakCount = true }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 2 }}>{title}</Typography>
      <List sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {events.length > 0 ? (
          events.map(event => (
            <ListItem
              key={event.id}
              sx={{
                flex: '1 1 calc(33% - 16px)', // Responsive layout
                cursor: 'pointer',
                boxShadow: 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 3,
                },
                backgroundColor: 'background.paper'
              }}
              onClick={() => onEventClick(event.id)}
            >
              <ListItemText
                primary={`${event.name} ${streakCount && event.streak_count ? `🔥${event.streak_count}` : ''}`}
                secondary={event.description}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No events available.
          </Typography>
        )}
      </List>
    </>
  );
};

export default EventList;

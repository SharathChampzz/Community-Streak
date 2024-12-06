import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, Button, IconButton } from '@mui/material';
import { getEvents } from '../api/events';
import VisibilityIcon from '@mui/icons-material/Visibility';

function Home() {
  const [subscribedEvents, setSubscribedEvents] = useState([]);
  const [otherEvents, setOtherEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = 1; // Replace with actual user ID from token or context
        const events = await getEvents(token);

        const subscribed = events.filter(event => event.subscribed_users.includes(userId));
        const notSubscribed = events.filter(event => !event.subscribed_users.includes(userId));

        setSubscribedEvents(subscribed);
        setOtherEvents(notSubscribed);
      } catch (err) {
        setError('Failed to load events.');
      }
    };
    fetchEvents();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>Welcome to Community Streak 🎉</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>Your Subscribed Events</Typography>
      <List>
        {subscribedEvents.map(event => (
          <ListItem key={event.id}>
            <Typography variant="body1">{event.name}</Typography>
            <IconButton href={`/events/${event.id}`}>
              <VisibilityIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mt: 2 }}>Other Events</Typography>
      <List>
        {otherEvents.map(event => (
          <ListItem key={event.id}>
            <Typography variant="body1">{event.name}</Typography>
            <IconButton href={`/events/${event.id}`}>
              <VisibilityIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default Home;

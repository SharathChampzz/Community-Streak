import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, Button, IconButton } from '@mui/material';
// import { getEvents } from '../api/events';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getMe, getUserEvents, getEvents } from '../services/api';
import { Card, CardContent, CardActions } from '@mui/material';

function Home() {
  const [subscribedEvents, setSubscribedEvents] = useState([]);
  const [otherEvents, setOtherEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // const token = localStorage.getItem('token');
        const userId = JSON.parse(localStorage.getItem('user')).id;

        const subscribed = await getUserEvents(userId).then(response => response.data);

        const all_events = await getEvents().then(response => response.data);

        const notSubscribed = all_events.filter(event => !subscribed.some(subscribedEvent => subscribedEvent.id === event.id));

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
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h5">{event.name}</Typography>
                <Typography variant="body2" color="textSecondary">{event.description}</Typography>
              </CardContent>
              <CardActions>
                <IconButton href={`/events/${event.id}`}>
                  <VisibilityIcon />
                </IconButton>
              </CardActions>
            </Card>
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mt: 2 }}>Other Events</Typography>
      <List>
        {otherEvents.map(event => (
          <ListItem key={event.id}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h5">{event.name}</Typography>
                <Typography variant="body2" color="textSecondary">{event.description}</Typography>
              </CardContent>
              <CardActions>
                <IconButton href={`/events/${event.id}`}>
                  <VisibilityIcon />
                </IconButton>
              </CardActions>
            </Card>
          </ListItem>
        ))}
      </List>

      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default Home;

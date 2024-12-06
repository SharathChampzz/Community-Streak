import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { getMe, getUserEvents, getEvents } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [subscribedEvents, setSubscribedEvents] = useState([]);
  const [otherEvents, setOtherEvents] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
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

  const handleCardClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <Container>
      <Typography variant="h3" sx={{ mt: 4 }}>Welcome to Community Streak 🎉</Typography>
      <Typography variant="h5" sx={{ mt: 2 }}>Your Subscribed Events</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {subscribedEvents.map(event => (
          <Box 
            key={event.id} 
            sx={{ 
              flex: '1 1 calc(33.333% - 16px)', 
              backgroundColor: '#e0f7fa', 
              padding: 2, 
              cursor: 'pointer', 
              '&:hover': { 
                boxShadow: 6 
              } 
            }} 
            onClick={() => handleCardClick(event.id)}
          >
            <Typography variant="h5">{event.name}</Typography>
            <Typography variant="body2" color="textSecondary">{event.description}</Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="h5" sx={{ mt: 2 }}>Other Events</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {otherEvents.map(event => (
          <Box 
            key={event.id} 
            sx={{ 
              flex: '1 1 calc(33.333% - 16px)', 
              backgroundColor: '#fce4ec', 
              padding: 2, 
              cursor: 'pointer', 
              '&:hover': { 
                boxShadow: 6 
              } 
            }} 
            onClick={() => handleCardClick(event.id)}
          >
            <Typography variant="h5">{event.name}</Typography>
            <Typography variant="body2" color="textSecondary">{event.description}</Typography>
          </Box>
        ))}
      </Box>

      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default Home;

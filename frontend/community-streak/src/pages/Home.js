import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { getMe, getUserEvents, getEvents } from '../services/api';
import { useNavigate } from 'react-router-dom';
import EventList from '../components/EventList';

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

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };


  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>Welcome to Community Streak 🎉</Typography>
      <EventList
        title="Your Subscribed Events"
        events={subscribedEvents}
        onEventClick={handleEventClick}
        streakCount={true}
      />
      <EventList
        title="Other Events"
        events={otherEvents}
        onEventClick={handleEventClick}
        streakCount={true}
      />
      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default Home;

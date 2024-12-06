import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import EventList from '../components/EventList';
import { getCreatedEvents, getJoinedEvents } from '../services/api';
import { useNavigate } from 'react-router-dom';

function MyStreaks() {
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      window.location.href = '/login';
    }
  }, [userId]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const created = await getCreatedEvents().then(res => res.data);
        const joined = await getJoinedEvents().then(res => res.data);

        setCreatedEvents(created);
        setJoinedEvents(joined);
      } catch (err) {
        setError('Failed to fetch streaks.');
      }
    };

    fetchEvents();
  }, [userId]);

  const handleEventClick = (id) => {
    navigate(`/events/${id}`);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>My Streaks 🥳</Typography>
      <EventList
        title="Created Events"
        events={createdEvents}
        onEventClick={handleEventClick}
        streakCount={true}
      />
      <EventList
        title="Joined Events"
        events={joinedEvents}
        onEventClick={handleEventClick}
        streakCount={true}
      />
      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default MyStreaks;

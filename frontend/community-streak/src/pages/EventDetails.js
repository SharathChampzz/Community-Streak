import React, { useState, useEffect } from 'react';
import { Container, Typography, Button } from '@mui/material';
import { getEventDetails, joinEvent, exitEvent } from '../api/events';

function EventDetails({ match }) {
  const { eventId } = match.params;
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [userId] = useState(1); // Replace with actual user ID from token or context

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const eventDetails = await getEventDetails(eventId, token);
        setEvent(eventDetails);
      } catch (err) {
        setError('Failed to load event details.');
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleJoin = async () => {
    try {
      const token = localStorage.getItem('token');
      await joinEvent(eventId, userId, token);
      alert('Joined event!');
    } catch (err) {
      alert('Failed to join event.');
    }
  };

  const handleExit = async () => {
    try {
      const token = localStorage.getItem('token');
      await exitEvent(eventId, userId, token);
      alert('Exited event!');
    } catch (err) {
      alert('Failed to exit event.');
    }
  };

  if (!event) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Typography variant="h4">{event.name}</Typography>
      <Typography variant="body1">{event.description}</Typography>

      <Button onClick={handleJoin} variant="contained" color="primary" sx={{ mt: 2 }}>Join</Button>
      <Button onClick={handleExit} variant="contained" color="secondary" sx={{ mt: 2 }}>Exit</Button>
    </Container>
  );
}

export default EventDetails;

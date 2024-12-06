import React, { useState, useEffect } from 'react';
import { Container, Typography, Button } from '@mui/material';
import { getEventDetails, joinEvent, exitEvent } from '../services/api';
import { useParams } from 'react-router-dom';

function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const userId = JSON.parse(localStorage.getItem('user')).id;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const eventDetails = await getEventDetails(eventId, 100);
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
      await joinEvent(eventId, userId);
      alert('Joined event!');
    } catch (err) {
      alert('Failed to join event.');
    }
  };

  const handleExit = async () => {
    try {
      const token = localStorage.getItem('token');
      await exitEvent(eventId, userId);
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

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Grid, Paper } from '@mui/material';
import { getEventDetails, joinEvent, exitEvent } from '../services/api';
import { useParams } from 'react-router-dom';

function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;

  useEffect(() => {
    if (!userId) {
      window.location.href = '/login';
    }
  }, [userId]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDetails = await getEventDetails(eventId, userId).then((response) => response.data);
        setEvent(eventDetails);
      } catch (err) {
        setError('Failed to load event details.');
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleJoin = async () => {
    try {
      await joinEvent(eventId, userId);
      alert('Joined event!');
    } catch (err) {
      alert('Failed to join event.');
    }
  };

  const handleExit = async () => {
    try {
      await exitEvent(eventId, userId);
      alert('Exited event!');
    } catch (err) {
      alert('Failed to exit event.');
    }
  };

  if (!event) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Get user position in top_users list
  console.log(event);
  const currentUser = event && event.top_users.find((user) => user.userid === userId);
  const userPosition = event && event.top_users.findIndex((user) => user.userid === userId) + 1;

  return (
    <Container>
      <nav>
        <Link to="/">Home</Link> / Event Details
      </nav>
      {/* Motivational Line */}
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        🚴‍♂️ Keep pushing your limits! Greatness awaits! ✨
      </Typography>

      {/* Event Name and Description */}
      <Typography variant="h4">{event.name}</Typography>
      <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
        {event.description}
      </Typography>

      {/* Buttons for Join/Exit */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item>
          <Button onClick={handleJoin} variant="contained" color="primary">
            Join
          </Button>
        </Grid>
        <Grid item>
          <Button onClick={handleExit} variant="contained" color="secondary">
            Exit
          </Button>
        </Grid>
      </Grid>

      {/* Top Users Section */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        🏆 Top Participants
      </Typography>
      <Grid container spacing={2}>
        {event.top_users.map((user, index) => (
          <Grid item xs={6} sm={4} md={3} key={user.userid}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                textAlign: 'center',
                backgroundColor: user.userid === userId ? 'lightblue' : 'white',
              }}
            >
              <Typography variant="h6">{user.username}</Typography>
              <Typography variant="body2">🔥 Streak: {user.streak_count}</Typography>
              <Typography variant="body2">🏅 Rank: {index + 1}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Current User Position */}
      {currentUser && (
        <Typography variant="h6" sx={{ mt: 4 }}>
          👤 You are currently ranked <strong>#{userPosition}</strong> with a streak count of{' '}
          <strong>{currentUser.streak_count}</strong>. Keep it up!
        </Typography>
      )}
    </Container>
  );
}

export default EventDetails;

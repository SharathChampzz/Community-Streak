import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Grid, Paper } from '@mui/material';
import { getEventDetails, joinEvent, exitEvent, markEventAsComplete } from '../services/api';
import { useParams } from 'react-router-dom';

function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [partOfEvent, setpartOfEvent] = useState(false);
  const [showMarkAsComplete, setshowMarkAsComplete] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;

  useEffect(() => {
    if (!userId) {
      window.location.href = '/login';
    }
  }, [userId]);

  const fetchEvent = async () => {
    try {
      const eventDetails = await getEventDetails(eventId, userId).then((response) => response.data);
      setEvent(eventDetails);
      setpartOfEvent(eventDetails.user_details?.status === 'Part of the event' || false); // Check if user is part of the event
      setshowMarkAsComplete(eventDetails.user_details?.request_update_streak === true || false); // Check if user can mark event as complete
    } catch (err) {
      setError('Failed to load event details.');
    }
  };
  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const handleJoin = async () => {
    try {
      await joinEvent(eventId, userId);
      fetchEvent();
      alert('Joined event!');
    } catch (err) {
      alert('Failed to join event.');
    }
  };

  async function handleExit() {
    const confirmExit = window.confirm('Are you sure you want to exit? Caution: If you exit, all the streaks will be lost.');
    if (!confirmExit) return;

    try {
      await exitEvent(eventId, userId);
      fetchEvent();
      alert('Exited event!');
    } catch (err) {
      alert('Failed to exit event.');
    }
  }

  const handleMarkAsComplete = async () => {
    try {
      const response = await markEventAsComplete(eventId).then((response) => response.data);
      console.log(response);
      fetchEvent();
      alert(response.message);
    } catch (err) {
      alert('Streak already updated for today or Failed to mark event as complete.');
    }
  }

  if (!event) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Get user position in top_users list
  console.log(event);
  const currentUser = event && event.top_users.find((user) => user.userid === userId);
  const userPosition = event && event.top_users.findIndex((user) => user.userid === userId) + 1;

  return (
    <Container>
      <Button onClick={() => window.history.back()} variant="outlined" sx={{ mt: 2, mb: 2 }}>
        ←
      </Button>
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
      {/* Show this buttons based on condition, Dont show all the buttons every time. */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {!partOfEvent && <Grid item>
          <Button onClick={handleJoin} variant="contained" color="primary">
            Join
          </Button>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Join the event to start your streak! 🥳🥳
          </Typography>
        </Grid>}
        {partOfEvent && <Grid item>
          <Button onClick={handleExit} variant="contained" color="secondary">
            Exit
          </Button>
        </Grid>}
        {showMarkAsComplete && <Grid item>
          <Button onClick={handleMarkAsComplete} variant="contained" color="success">
            Mark as Complete
          </Button>
        </Grid>}
      </Grid>

      {currentUser && (
        <Typography variant="h6" sx={{ mt: 4 }}>
          👤 You are currently ranked <strong>#{userPosition}</strong> with a streak count of{' '}
          <strong>{currentUser.streak_count}</strong>. Keep it up! 😍
        </Typography>
      )}

      {event.top_users && event.top_users.length > 0 && (
        <>
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
        </>
      )}

    </Container>
  );
}

export default EventDetails;

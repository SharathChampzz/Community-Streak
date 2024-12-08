import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Container, Typography, Button, Grid, Paper, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { getEventDetails, joinEvent, exitEvent, markEventAsComplete } from '../services/api';

function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [partOfEvent, setPartOfEvent] = useState(false);
  const [showMarkAsComplete, setShowMarkAsComplete] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;

  useEffect(() => {
    if (!userId) {
      window.location.href = '/login';
    }
  }, [userId]);

  const fetchEvent = async () => {
    try {
      const eventDetails = await getEventDetails(eventId, 100).then((response) => response.data);
      setEvent(eventDetails);
      setPartOfEvent(eventDetails.user_details?.status === 'Part of the event' || false);
      setShowMarkAsComplete(eventDetails.user_details?.request_update_streak === true || false);
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
      showSnackbar('Joined event!', 'success');
    } catch (err) {
      showSnackbar('Failed to join event.', 'error');
    }
  };

  const handleExit = async () => {
    try {
      await exitEvent(eventId, userId);
      fetchEvent();
      showSnackbar('Exited event!', 'success');
      setExitDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to exit event.', 'error');
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      const response = await markEventAsComplete(eventId).then((response) => response.data);
      fetchEvent();
      showSnackbar(response.message, 'success');
    } catch (err) {
      showSnackbar('Streak already updated for today or Failed to mark event as complete.', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!event) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const currentUser = event?.top_users.find((user) => user.userid === userId);
  const userPosition = event?.top_users.findIndex((user) => user.userid === userId) + 1;

  return (
    <Container>
      <Button onClick={() => window.history.back()} variant="outlined" sx={{ mt: 2, mb: 2 }}>
        ← Back
      </Button>
      <Typography variant="h2" sx={{ mt: 4, mb: 2 }}>
        🚴‍♂️ Keep pushing your limits! Greatness awaits! ✨
      </Typography>

      <Paper elevation={3} sx={{ padding: 3, mb: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h4">{event.name}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>{event.description}</Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {!partOfEvent && (
          <Grid item>
            <Button onClick={handleJoin} variant="contained" color="success">
              Join
            </Button>
          </Grid>
        )}
        {showMarkAsComplete && (
          <Grid item>
            <Button onClick={handleMarkAsComplete} variant="contained" color="primary">
              Mark as Complete
            </Button>
          </Grid>
        )}
        {partOfEvent && (
          <Grid item>
            <Button
              onClick={() => setExitDialogOpen(true)}
              variant="contained"
              color="danger"
            >
              Exit
            </Button>
          </Grid>
        )}
      </Grid>

      {currentUser && (
        <Paper elevation={2} sx={{ padding: 2, mb: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h6">
            👤 You are ranked <strong>#{userPosition}</strong> out of {event.user_counts} users with a streak count of{' '}
            <strong>{currentUser.streak_count}</strong>. Keep it up! 😍
          </Typography>
        </Paper>
      )}

      {event.top_users && event.top_users.length > 0 && (
        <Paper elevation={2} sx={{ padding: 3, bgcolor: 'background.paper', maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>🏆 Top Participants</Typography>
          <Grid container spacing={2}>
            {event.top_users.map((user, index) => (
              <Grid item xs={6} sm={4} md={3} key={user.userid}>
                <Paper
                  elevation={3}
                  sx={{
                    padding: 2,
                    textAlign: 'center',
                    bgcolor: user.userid === userId ? 'highlight.main' : 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Add a user profile image */}
                  <img
                    src={user.profileImageUrl || `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${user.username}`}
                    alt={`${user.username}'s profile`}
                    style={{
                      borderRadius: '50%',
                      width: 50,
                      height: 50,
                      objectFit: 'cover',
                      marginBottom: '10px',
                    }}
                  />
                  <Typography variant="h6">{user.username} {user.userid === userId && '(You)'}</Typography>
                  <Typography variant="body2">🔥 Streak: {user.streak_count}</Typography>
                  <Typography variant="body2">🏅 Rank: {index + 1}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}


      {/* Exit Confirmation Dialog */}
      <Dialog open={exitDialogOpen} onClose={() => setExitDialogOpen(false)}>
        <DialogTitle>Exit Event</DialogTitle>
        <DialogContent>
          Are you sure you want to exit? Caution: All streaks will be lost.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleExit} color="secondary">Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EventDetails;

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { getMe, getUserEvents, getEvents } from '../services/api';
import { useNavigate } from 'react-router-dom';
import EventList from '../components/EventList';
import CountdownToMidnight from '../components/CountdownToMidnight';

function Home() {
  const [subscribedEvents, setSubscribedEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [otherEvents, setOtherEvents] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const subscribed = await getUserEvents(userId).then((response) => response.data);
        const pending_events = subscribed.filter((event) => event.completed === false);
        const all_events = await getEvents().then((response) => response.data);

        const notSubscribed = all_events.filter(
          (event) => !subscribed.some((subscribedEvent) => subscribedEvent.id === event.id)
        );

        setSubscribedEvents(subscribed);
        setOtherEvents(notSubscribed);
        setPendingEvents(pending_events);
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
      {/* Welcome Section */}
      <Paper elevation={3} sx={{ padding: 3, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Community Streak 🎉
        </Typography>
        <Typography variant="body1">
          Join events, build streaks, and achieve greatness together with your community!
        </Typography>
      </Paper>

      {/* Pending Events Section */}
      <Paper elevation={2} sx={{ padding: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Pending Events Title */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              ⌚ Your Pending Events For Today
            </Typography>
            {pendingEvents.length > 0 ? (
              <EventList
                title=""
                events={pendingEvents}
                onEventClick={handleEventClick}
                streakCount={true}
              />
            ) : (
              <Typography variant="body1" color="textSecondary">
                You don't have any pending events for today. Great job staying on top of things!
              </Typography>
            )}
          </Box>

          {/* Right: Countdown Timer */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '25%', // Ensures the timer section takes up some space
              textAlign: 'center',
              padding: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              Time Left ⏰
            </Typography>
            <CountdownToMidnight />
          </Box>
        </Box>
      </Paper>

      {/* Subscribed Events Section */}
      <Paper elevation={2} sx={{ padding: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          🔥 Your Subscribed Events
        </Typography>
        {subscribedEvents.length > 0 ? (
          <EventList
            title=""
            events={subscribedEvents}
            onEventClick={handleEventClick}
            streakCount={true}
          />
        ) : (
          <Typography variant="body1" color="textSecondary">
            You haven't subscribed to any events yet. Start exploring and join an event today!
          </Typography>
        )}
      </Paper>

      {/* Other Events Section */}
      <Paper elevation={2} sx={{ padding: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          🌟 Explore Other Events
        </Typography>
        {otherEvents.length > 0 ? (
          <EventList
            title=""
            events={otherEvents}
            onEventClick={handleEventClick}
            streakCount={true}
          />
        ) : (
          <Typography variant="body1" color="textSecondary">
            No events are currently available to join. Check back later for more!
          </Typography>
        )}
      </Paper>

      {/* Error Section */}
      {error && (
        <Paper elevation={1} sx={{ padding: 2, mt: 2, backgroundColor: '#ffeaea' }}>
          <Typography color="error" variant="body1">
            {error}
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default Home;

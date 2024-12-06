import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
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
        let created = await getCreatedEvents().then(res => res.data).catch(err => { throw err; });
        let joined = await getJoinedEvents().then(res => res.data).catch(err => { throw err; });

        created = created.map(event => ({
          id: event.id,
          name: event.name,
          description: event.description,
          streak_count: event.streak_count
        }));

        joined = joined.map(event => ({
          id: event.id,
          name: event.name,
          description: event.description,
          streak_count: event.streak_count
        }));

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
      <Typography variant="h4" sx={{ mt: 4 }}>My Streaks</Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>Created Events</Typography>
      <List sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {createdEvents.length > 0 ? (
          createdEvents.map(event => (
            <ListItem 
              key={event.id} 
              sx={{ 
                flex: '1 1 calc(33% - 16px)', 
                cursor: 'pointer', 
                boxShadow: 1, 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 3,
                }
              }} 
              onClick={() => handleEventClick(event.id)}
            >
              <ListItemText 
                primary={`${event.name} 🔥${event.streak_count}`} 
                secondary={event.description} 
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            You haven't created any events yet.
          </Typography>
        )}
      </List>

      <Typography variant="h6" sx={{ mt: 2 }}>Joined Events</Typography>
      <List sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {joinedEvents.length > 0 ? (
          joinedEvents.map(event => (
            <ListItem 
              key={event.id} 
              sx={{ 
                flex: '1 1 calc(33% - 16px)', 
                cursor: 'pointer', 
                boxShadow: 1, 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 3,
                }
              }} 
              onClick={() => handleEventClick(event.id)}
            >
              <ListItemText 
                primary={`${event.name} 🔥${event.streak_count}`} 
                secondary={event.description} 
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            You haven't joined any events yet.
          </Typography>
        )}
      </List>

      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default MyStreaks;

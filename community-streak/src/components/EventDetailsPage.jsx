import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import { getEventDetails } from '../services/api';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getEventDetails(eventId);
        setEventDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [eventId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!eventDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          Event not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box padding={2}>
      <Typography variant="h4" gutterBottom>
        {eventDetails.name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {eventDetails.description}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Participants:
      </Typography>
      <List>
        {eventDetails.top_users.map((user) => (
          <React.Fragment key={user.username}>
            <ListItem>
              <ListItemText
                primary={`${user.username} (Streak: ${user.streak_count})`}
                secondary={user.username}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default EventDetailsPage;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  IconButton,
  Box,
  Modal,
  TextField,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventList from '../components/EventList';
import ToastAlert from '../components/ToastAlert';
import { getCreatedEvents, getJoinedEvents, createEvent } from '../services/api';
import { useNavigate } from 'react-router-dom';

function MyStreaks() {
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [toast, setToast] = useState({ open: false, text: '', severity: 'info' });
  const [modalOpen, setModalOpen] = useState(false);
  const initialState = { name: '', description: '', is_private: true };
  const [newEvent, setNewEvent] = useState(initialState);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.id : null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      window.location.href = '/login';
    }
  }, [userId]);

  const fetchEvents = async () => {
    try {
      const created = await getCreatedEvents().then((res) => res.data);
      const joined = await getJoinedEvents().then((res) => res.data);

      setCreatedEvents(created);
      setJoinedEvents(joined);
    } catch (err) {
      setToast({ open: true, text: 'Failed to fetch streaks.', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const handleEventClick = (id) => {
    navigate(`/events/${id}`);
  };

  const handleCreateEvent = async () => {
    try {
      await createEvent(newEvent);
      setToast({ open: true, text: 'Event created successfully!', severity: 'success' });
      fetchEvents(); // Reload events
      setModalOpen(false); // Close modal
      setNewEvent(initialState); // Reset form
    } catch (err) {
      setToast({ open: true, text: 'Failed to create event.', severity: 'error' });
    }
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setNewEvent({ name: '', description: '', is_private: true }); // Reset form
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        My Streaks 🥳
      </Typography>
      <EventList
        title="Active Events ✊"
        events={joinedEvents}
        onEventClick={handleEventClick}
        streakCount={true}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4 }}>
        <Typography variant="h5">You created the following Events 💪</Typography>
        <IconButton onClick={() => setModalOpen(true)}>
          <AddIcon />
        </IconButton>
      </Box>
      <EventList events={createdEvents} onEventClick={handleEventClick} streakCount={true} />

      {/* Toast Alert */}
      <ToastAlert
        open={toast.open}
        onClose={handleCloseToast}
        text={toast.text}
        severity={toast.severity}
      />

      {/* Modal for Adding Event */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create New Event
          </Typography>
          <TextField
            label="Event Name"
            fullWidth
            margin="normal"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant={newEvent.is_private ? 'contained' : 'outlined'}
              color="primary"
              onClick={() =>
                setNewEvent({ ...newEvent, is_private: !newEvent.is_private })
              }
            >
              {newEvent.is_private ? 'Private' : 'Public'}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleCreateEvent}
              disabled={!newEvent.name || !newEvent.description}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}

export default MyStreaks;

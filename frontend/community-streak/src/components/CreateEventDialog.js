import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

function CreateEventDialog() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="outlined" color="secondary" onClick={handleOpen} sx={{ mt: 2 }}>
        Create New Event
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Streak Event</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Event Name" margin="normal" />
          <TextField fullWidth label="Description" margin="normal" multiline rows={3} />
          <TextField fullWidth label="Start Date" margin="normal" type="date" InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleClose} color="primary">Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CreateEventDialog;

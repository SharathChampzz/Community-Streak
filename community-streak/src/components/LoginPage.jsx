import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { loginUser } from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      setMessage({ type: 'success', text: response.data.message });
      // Save token in local storage for further API calls
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={2}
    >
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      <Box component="form" maxWidth="400px" width="100%" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name="email"
          label="Email"
          margin="normal"
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          name="password"
          label="Password"
          type="password"
          margin="normal"
          onChange={handleInputChange}
        />
        <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;

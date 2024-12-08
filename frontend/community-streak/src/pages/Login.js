import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Box,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getMe, login } from '../services/api';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginSucess = () => {
    const redirectPath = localStorage.getItem('redirect_path') || '/';
    localStorage.removeItem('redirect_path');
    navigate(redirectPath);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const encodedPassword = btoa(formData.password); // Encode password to base64
      const response = await login({ ...formData, password: encodedPassword })
        .then((response) => response.data)
        .catch((err) => {
          throw err;
        });
      const user_details = await getMe()
        .then((response) => response.data)
        .catch((err) => {
          throw err;
        });
      localStorage.setItem('user', JSON.stringify(user_details));
      handleLoginSucess();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Invalid login credentials or Something went wrong!';
      setError(errorMessage);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
            backgroundColor: 'primary',
          }}
        >
          <Typography variant="h4" align="center" sx={{ mb: 4 }}>
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Username or Email"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
          <Typography align="center" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link href="/register" underline="hover" color="inherit">
              Register
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;

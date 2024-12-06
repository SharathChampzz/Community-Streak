import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { loginUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await loginUser(formData);
      localStorage.setItem('token', response.access_token); // Save token
      navigate('/'); // Redirect to home
    } catch (err) {
      setError(err.message || 'Invalid login credentials.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mt: 4 }}>Login</Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
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
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
      <Typography sx={{ mt: 2 }}>
        Don't have an account? <Link href="/register">Register</Link>
      </Typography>
    </Container>
  );
}

export default Login;

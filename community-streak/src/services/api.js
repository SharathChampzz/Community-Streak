import axios from 'axios';

// Set the base URL for API calls
const API = axios.create({
  baseURL: 'http://localhost:8000/api', // Replace with your backend URL
});

// Auth API calls
export const registerUser = (data) => API.post("/v1/users/signup", data);
export const loginUser = (data) => API.post("/v1/users/login", data);

// Events API calls
export const fetchEvents = () => API.get('/v1/events/events');
export const getEventDetails = (eventId) => API.get(`/v1/events/events/${eventId}`);



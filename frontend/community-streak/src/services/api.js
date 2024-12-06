import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// User APIs
export const signup = (userData) => {
    return api.post('/users/signup', userData);
};

export const login = async (userData) => {
    const response = await api.post('/users/login', userData);
    const token = response.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return response;
};

export const getAllUsers = () => {
    return api.get('/users/users');
};

export const getUserDetails = (userId) => {
    return api.get(`/users/users/${userId}`);
};

export const getMe = () => {
    return api.get('/users/me');
};

export const getUserEvents = (userId) => {
    return api.get(`/users/users/${userId}/events`);
};

// Event APIs
export const createEvent = (eventData) => {
    return api.post('/events', null, { params: eventData });
};

export const getEvents = (queryParams) => {
    return api.get('/events', { params: queryParams });
};

export const getEventDetails = (eventId, topX) => {
    console.log(`Fetching event details for event ${eventId}`);
    return api.get(`/events/${eventId}`, { params: { top_x: topX } });
};

export const joinEvent = (eventId, userId) => {
    console.log(`Joining event ${eventId} with user ${userId}`);
    return api.post(`/events/${eventId}/join`, null,  { params: { user_id: userId } });
};

export const exitEvent = (eventId, userId) => {
    console.log(`Exiting event ${eventId} with user ${userId}`);
    return api.post(`/events/${eventId}/exit`, null, { params: { user_id: userId } });
};
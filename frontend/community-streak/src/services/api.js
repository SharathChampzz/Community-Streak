import axios from 'axios';

const baseURL = 'http://localhost:8000/api/v1';
const token = localStorage.getItem('access_token');
const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    },
});

// Function to refresh token
const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const newToken = await axios.post(`${baseURL}/users/token/refresh`, null, { params: { refresh_token: refreshToken } }).then(response => response.data.access_token).catch(error => error.response.data);
    localStorage.setItem('access_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    return newToken;
    // TODO: For testing purpose, show toast alert whenever token is refreshed
};

// Axios response interceptor
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newToken = await refreshToken();
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
        }
        return Promise.reject(error);
    }
);

// User APIs
export const signup = (userData) => {
    return api.post('/users/signup', userData);
};

export const login = async (userData) => {
    const formData = new URLSearchParams();
    for (const key in userData) {
        formData.append(key, userData[key]);
    }
    const response = await api.post('/users/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    const token = response.data.access_token;
    const refresh_token = response.data.refresh_token;
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh_token);
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

export const getCreatedEvents = () => {
    return api.get('/events/myevents');
}

export const getJoinedEvents = () => {
    return api.get('/events/joinedevents');
}

export const markEventAsComplete = (eventId) => {
    return api.post(`/events/${eventId}/mark-completed`);
}

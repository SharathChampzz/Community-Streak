import axios from 'axios';

// check for token in local storage, if not exists redirect to login page
const token = localStorage.getItem('access_token');
if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    // Save the current path to redirect later
    redirectToLoginPage();
}

function redirectToLoginPage() {
    localStorage.setItem('redirect_path', window.location.pathname);
    window.location.href = '/login';
}

const baseURL = 'http://localhost:8000/api/v1';
const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    },
});


// Function to refresh token
const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        // Request a new access token using the refresh token
        const response = await axios.post(`${baseURL}/users/token/refresh`, null, {
            params: { refresh_token: refreshToken }
        });

        const newToken = response.data.access_token;

        // Store the new access token in local storage
        localStorage.setItem('access_token', newToken);

        // Update the default authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // TODO: For testing purposes, show a toast alert whenever the token is refreshed
        // showToast('Token refreshed successfully');

        return newToken;
    } catch (error) {
        // Redirect to the login page on refresh failure
        redirectToLoginPage();
        return Promise.reject(error);
    }
};


// Axios response interceptor
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Check if the error is due to an unauthorized request (401) and if the request has not been retried
        if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const newToken = await refreshToken();

                // Update the authorization header with the new token
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                // Retry the original request with the new token
                return api(originalRequest);
            } catch (refreshError) {
                // Redirect to the login page if token refresh fails
                redirectToLoginPage();
                return Promise.reject(refreshError);
            }
        }

        // Reject the promise if the error is not due to an unauthorized request or if the request has already been retried
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
    return api.get('/users');
};

export const getUserDetails = (userId) => {
    return api.get(`/users/${userId}`);
};

export const getMe = () => {
    return api.get('/users/me');
};

export const getUserEvents = (userId) => {
    return api.get(`/users/${userId}/events`);
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
    return api.post(`/events/${eventId}/join`, null, { params: { user_id: userId } });
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

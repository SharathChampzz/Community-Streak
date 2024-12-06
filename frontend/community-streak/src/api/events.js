import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const getEvents = async (token) => {
  const url = `${API_BASE_URL}/events/events`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to fetch events.' };
  }
};

export const getEventDetails = async (eventId, token) => {
  const url = `${API_BASE_URL}/events/events/${eventId}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to fetch event details.' };
  }
};

export const joinEvent = async (eventId, userId, token) => {
  const url = `${API_BASE_URL}/events/events/${eventId}/join?user_id=${userId}`;
  try {
    const response = await axios.post(url, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to join event.' };
  }
};

export const exitEvent = async (eventId, userId, token) => {
  const url = `${API_BASE_URL}/events/events/${eventId}/exit?user_id=${userId}`;
  try {
    const response = await axios.post(url, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to exit event.' };
  }
};

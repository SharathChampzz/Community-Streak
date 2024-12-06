import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const registerUser = async (data) => {
  const url = `${API_BASE_URL}/users/signup`;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed.' };
  }
};

export const loginUser = async (data) => {
  const url = `${API_BASE_URL}/users/login`;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed.' };
  }
};

export const getCurrentUser = async (userId, token) => {
  const url = `${API_BASE_URL}/users/users/${userId}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to fetch user details.' };
  }
};

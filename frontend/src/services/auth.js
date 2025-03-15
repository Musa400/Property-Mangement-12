// auth.js

export const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return token;
};

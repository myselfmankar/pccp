import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = {
    register: async (user_email, password, coordinates, image_url) => {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                user_email,
                password,
                coordinates,
                image_url,
            });
            return response;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    login: async (user_email, password, coordinates) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                user_email,
                password,
                coordinates,
            });
            return response;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    storePassword: async (user_email, site_url, username, password) => {
        try {
            const response = await axios.post(`${API_URL}/store_pccp`, {
                user_email,
                site_url,
                username,
                password,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    getPasswords: async (user_email) => {
        try {
            const response = await axios.get(`${API_URL}/get_passwords`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params: { user_email }
            });
            return response;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    getPassword: async (user_email, site_url) => {
        try {
            const response = await axios.get(
                `${API_URL}/get_password`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    params: { 
                        user_email,
                        site_url: site_url.replace(/^(https?:\/\/)?(www\.)?/, '')
                    }
                }
            );
            return response;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    getRegistrationImage: async () => {
        try {
            const response = await axios.get(`${API_URL}/get_registration_image`);
            return response;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    getPCCPImage: async () => {
        try {
            const response = await axios.get(`${API_URL}/get_pccp_image`);
            return response;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },
    getPCCPImageForLogin: async (user_email) => {
      try{
        const response = await axios.post(`${API_URL}/get_pccp_login`,{user_email});
        return response;
      }catch(error){
        console.error('API error', error);
        throw error;
      }
    }
};

export default api;
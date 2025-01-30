import axios from "axios";

const messageApi = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  messageApi.interceptors.request.use(
    (config) => {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        config.headers['X-User-Id'] = user.id;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


export default messageApi;
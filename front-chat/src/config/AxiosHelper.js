import axios from 'axios';
export const baseURL = "https://roomchatapplication.onrender.com/";
export const httpClient = axios.create({

    baseURL: baseURL,
});
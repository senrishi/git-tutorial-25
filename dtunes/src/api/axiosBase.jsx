import axios from 'axios';
const baseUrl = 'http://localhost:2006';

const axiosBase =  axios.create({
    baseURL: baseUrl
}) 

export const axiosPrivate = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
}) 

export const axiosPrivateFile = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
}) 

export default axiosBase;
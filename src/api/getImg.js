import axios from "axios";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '33856079-07df6d61f1845998135abb1f8';
const SEARCH_SETTINGS = ['image_type=photo', 'orientation=horizontal']

export default async function getImg(searchQuery) {
    try {
      const response = await axios.get(`${BASE_URL}/?key=${API_KEY}&q=${searchQuery}&${SEARCH_SETTINGS.join('&')}`);
      console.log(`${BASE_URL}/?key=${API_KEY}q=${searchQuery}&${SEARCH_SETTINGS.join('&')}`);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
 
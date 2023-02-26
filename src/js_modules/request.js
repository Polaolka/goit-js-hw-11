import axios from 'axios';
const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '33856079-07df6d61f1845998135abb1f8';

export default class NewApi {
  key = API_KEY;
  query;
  page = 1;
  per_page = 40;
  maxPage = 1;
  async getCards(query) {
    if (query) {
      this.query = query;
    }
    const params = {
      q: this.query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: this.per_page,
      page: this.page,
    };
    try {
      const response = await axios.get(`${BASE_URL}/?key=${this.key}`, {
        params: params,
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}

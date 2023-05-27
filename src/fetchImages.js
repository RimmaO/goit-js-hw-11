import axios from 'axios'; //-HTTP

/**
 * 1 get API
 */

async function fetchImages(query) {
  const BASE_URL = 'https://pixabay.com/api/';
  const params = new URLSearchParams({
    key: '36648375-8210797ad77555d82512d73b2',
    q: `${query}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  const response = await axios.get(`${BASE_URL}?${params}`);
  console.log(response);

  return response;
}
export { fetchImages };

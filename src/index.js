import './css/styles.css';

import axios from 'axios'; //-HTTP
import Notiflix from 'notiflix'; //-Error

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css'; //-Image

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('input');
const gallery = document.querySelector('.gallery');

searchForm.addEventListener('submit', onSubmitForm);

function onSubmitForm(event) {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (query === '') {
    Notiflix.Notify.failure('Please write your query');
    return;
  }
  fetchImages(query)
    .then(data => {
      createMarkupOfImages.innerHTML = '';
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        gallery.insertAdjacentHTML('beforeend', createMarkupOfImages(images));
        const lightbox = new SimpleLightbox('.gallery a', {
          captionsData: 'alt',
          captionPosition: 'bottom',
          captionDelay: 250,
        }).refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

async function fetchImages(query = '', page = 1, per_page = 40) {
  const BASE_URL = 'https://pixabay.com/api/';
  const params = new URLSearchParams({
    key: '36648375-8210797ad77555d82512d73b2',
    q: `${query}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: `${page}`,
    per_page: `${per_page}`,
  });

  const response = await axios.get(`${BASE_URL}?${params}`);
  console.log(response.data);

  return response;
}

function createMarkupOfImages(images) {
  return images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        view,
        comments,
        downloads,
      }) =>
        `
      <div class="photo-card">
        <a class="photo-link link" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
     
      <div class="info">
          <p class="info-item">
             <b>Likes</b> ${likes}
          </p>
         
          
          <p class="info-item">
             <b>Views</b> ${view}
          </p>
         
          <p class="info-item">
             <b>Comments</b> ${comments}
          </p>
         
          <p class="info-item">
             <b>Downloads</b> ${downloads}
          </p>
          
        </div>
      </div>`
    )
    .join('');
}

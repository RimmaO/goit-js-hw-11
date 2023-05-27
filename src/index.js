import './css/styles.css';

import axios from 'axios'; //-HTTP
import Notiflix from 'notiflix'; //-Error

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css'; //-Image

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.guard');
let page = 1;

let options = {
  root: null,
  rootMargin: '500px',
  threshold: 0,
};

let observer = new IntersectionObserver(onPagination, options);

function onPagination(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      fetchImages(page).then(data => {
        gallery.insertAdjacentHTML(
          'beforeend',
          createMarkupOfImages(data.data.hits)
        );
        if (data.data.totalHits <= data.page) {
          observer.unobserve(guard);
        }
      });
    }
  });
}

searchForm.addEventListener('submit', onSubmitForm);

function onSubmitForm(event) {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (query === '') {
    Notiflix.Notify.info(
      'The search string cannot be empty. Please write your search query.'
    );
    return;
  }

  fetchImages(query)
    .then(data => {
      observer.observe(guard);
      createMarkupOfImages.innerHTML = '';
      if (data.data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        gallery.insertAdjacentHTML(
          'beforeend',
          createMarkupOfImages(data.data.hits)
        );

        const lightbox = new SimpleLightbox('.gallery a', {
          captionsData: 'alt',
          captionPosition: 'bottom',
          captionDelay: 250,
        }).refresh();
        Notiflix.Notify.success(
          `Hooray! We found ${data.data.totalHits} images.`
        );
        smoothScroll();
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

async function fetchImages(query) {
  const BASE_URL = 'https://pixabay.com/api/';
  const params = new URLSearchParams({
    key: '36648375-8210797ad77555d82512d73b2',
    q: `${query}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    // page: `${page}`,
    // per_page: `${per_page}`,
  });

  const response = await axios.get(`${BASE_URL}?${params}`);
  console.log(response);

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
        views,
        comments,
        downloads,
      }) => {
        return `
      <div class="photo-card">
        <a class="photo-link link" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
     
      <div class="info">
          <p class="info-item">
             <b>Likes</b> ${likes}
          </p>
         
          
          <p class="info-item">
             <b>Views</b> ${views}
          </p>
         
          <p class="info-item">
             <b>Comments</b> ${comments}
          </p>
         
          <p class="info-item">
             <b>Downloads</b> ${downloads}
          </p>
          
        </div>
      </div>`;
      }
    )
    .join('');
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

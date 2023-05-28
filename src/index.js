import './css/styles.css';
import { fetchImages } from './fetchImages';

import Notiflix from 'notiflix'; //-Error
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css'; //-Image

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.guard');

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

let page = 1;
let query = '';

/**
 * create infinity scroll
 */

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
      fetchImages(query, page).then(data => {
        gallery.insertAdjacentHTML(
          'beforeend',
          createMarkupOfImages(data.data.hits)
        );
        if (data.data.page * 40 >= data.data.totalHits) {
          observer.unobserve(guard);
        }
      });
    }
  });
}

/**
 * 3 add event on btn
 */

searchForm.addEventListener('submit', onSubmitForm);

function onSubmitForm(event) {
  event.preventDefault();

  observer.observe(guard);

  gallery.innerHTML = '';
  query = searchInput.value.trim();

  if (query === '') {
    Notiflix.Notify.info(
      'The search string cannot be empty. Please write your search query.'
    );
    return;
  }

  fetchImages(query, page)
    .then(data => {
      if (data.data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        gallery.insertAdjacentHTML(
          'beforeend',
          createMarkupOfImages(data.data.hits)
        );

        lightbox.refresh();
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

/**
 * 2 create markup for gallery
 */

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

/**
 * create smooth scroll
 */
function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

import AOS from 'aos';
import 'aos/dist/aos.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createCardsMarkup } from './js_modules/HTML_markup';
import NewApi from './js_modules/request';

const refs = {
  formEl: document.querySelector('.search-form'),
  inputEl: document.querySelector('.input'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more-btn'),
  loadMoreBox: document.querySelector('.js-loadMoreBox'),
  checkboxEl: document.querySelector('.checkbox'),
  observerEl: document.querySelector('.observer'),
};

const newsApi = new NewApi();
let gallery = new SimpleLightbox('.gallery a', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionPosition: 'bottom',
  captionDelay: 250,
  overlayOpacity: 0.5,
  captionsData: 'title',
  animationSpeed: 300,
});

let userChoice = false;
let isApiRequestActive = false;

refs.formEl.addEventListener('submit', handleSubmit);
refs.inputEl.addEventListener('focus', handleFocus);
refs.inputEl.addEventListener('blur', handleBlur);
refs.checkboxEl.addEventListener('change', handleUserChoice);
refs.loadMoreBtn.addEventListener('click', handleLoadMoreClick);

const observer = new IntersectionObserver(entries => {
  // слідкуємо лише за одним елементом
  const entry = entries[0];
  if (entry.isIntersecting) {
    if (newsApi.page === newsApi.maxPage) {
      endOfScroll();
      return;
    }
    if (!isApiRequestActive) progressOfScroll();
  }
});

async function handleSubmit(e) {
  e.preventDefault();
  
  clearGallery();
  hideLoadMoreBox();
  setToFirstPage();

  const searchQuery = formatQuery(refs.inputEl.value);
  const data = await newsApi.getCards(searchQuery);
  const images = data.hits;

  initializeloading(data);
  drawGallery(images);
  setMaxPage(data);
  clearForm();
}

function formatQuery(query) {
  return query.trim();
}

function clearForm() {
  refs.formEl.reset();
}

function clearGallery() {
  refs.galleryEl.innerHTML = '';
}

function initializeloading(data) {
  if (data.hits.length && !userChoice) loadByButton(data);
  if (data.hits.length && userChoice) loadByScroll(data);
  if (!data.hits.length) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function loadByButton(data) {
  Notify.success(`Hooray! We found ${data.totalHits} images.`);
  observer.unobserve(refs.observerEl);
  showLoadMoreBox();
  isActiveLoadMoreBtn();
}

function loadByScroll(data) {
  Notify.success(`Hooray! We found ${data.totalHits} images.`);
  observer.observe(refs.observerEl);
}

function handleUserChoice(e) {
  userChoice = e.target.checked ? true : false;
}

function handleFocus() {
  refs.formEl.classList.add('js-focus');
}

function handleBlur() {
  refs.formEl.classList.remove('js-focus');
}

function setToFirstPage() {
  newsApi.page = 1;
}

function setMaxPage(data) {
  newsApi.maxPage = Math.ceil(data.total / newsApi.per_page);
}

function isActiveLoadMoreBtn() {
  if (newsApi.page === newsApi.maxPage) {
    Notify.warning(
      `I'm sorry, but this is the last page of results for your request`
    );
    refs.loadMoreBtn.disabled = true;
  } else refs.loadMoreBtn.disabled = false;
}

function handleLoadMoreClick(e) {
  newsApi.page += 1;
  newsApi.getCards().then(data => {
    drawGallery(data.hits);
  });
  isActiveLoadMoreBtn();
}

function showLoadMoreBox() {
  setTimeout(() => {
    refs.loadMoreBox.classList.remove('is-hidden');
  }, 1000);
}

function hideLoadMoreBox() {
  refs.loadMoreBox.classList.add('is-hidden');
}

function drawGallery(data) {
  const gallerycards = data.map(item => createCardsMarkup(item)).join('');
  refs.galleryEl.insertAdjacentHTML('beforeend', gallerycards);
  gallery.refresh();
  AOS.init();
  AOS.refreshHard();
}

function progressOfScroll() {
  isApiRequestActive = true;
  newsApi.page += 1;
  newsApi.getCards().then(data => {
    renderData(data.hits);
    isApiRequestActive = false;
    pageScrolling(refs.galleryEl);
  });
}

function endOfScroll() {
  setTimeout(() => {
    Notify.warning(
      `I'm sorry, but this is the last page of results for your request`
    );
  }, 500);
  observer.unobserve(refs.observerEl);
}

function pageScrolling(el) {
  const { height: cardHeight } = el.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

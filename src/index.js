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

function handleSubmit(e) {
  e.preventDefault();
  hideLoadMoreBox();
  refs.galleryEl.innerHTML = '';
  newsApi.page = 1;
  const query = e.target.elements.searchQuery.value.trim();
  newsApi.q = query;
  newsApi.getCards(query).then(data => {
    if (data.hits.length && !userChoice) {
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
      showLoadMoreBox();
      isActiveLoadMoreBtn();
    }
    if (data.hits.length && userChoice) {
      window.addEventListener('scroll', onWindowScroll);
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
    if (!data.hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    countMaxPage(data);
    renderData(data.hits);
  });
  e.target.reset();
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

function countMaxPage(data) {
  newsApi.maxPage = Math.ceil(data.total / newsApi.per_page);
  console.log(newsApi.maxPage);
}

function isActiveLoadMoreBtn() {
  if (newsApi.page === newsApi.maxPage) {
    console.log(newsApi.maxPage);
    Notify.warning(`I'm sorry, but this is the last page of results for your request`);
    refs.loadMoreBtn.disabled = true;
  } else refs.loadMoreBtn.disabled = false;
}

function handleLoadMoreClick(e) {
  newsApi.page += 1;
  console.log(newsApi.page);
  newsApi.getCards().then(data => {
    renderData(data.hits);
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

function renderData(data) {
  const gallerycards = data.map(item => createCardsMarkup(item)).join('');
  refs.galleryEl.insertAdjacentHTML('beforeend', gallerycards);
}

function onWindowScroll(e) {
  const scrollHeight = e.target.documentElement.scrollHeight;
  const scrollTop = e.target.documentElement.scrollTop;
  const clientHeight = e.target.documentElement.clientHeight;
  const position = scrollHeight - scrollTop - clientHeight;

  if (newsApi.page === newsApi.maxPage) endOfScroll();

  if (position < 500 && !isApiRequestActive) progressOfScroll();
}

function progressOfScroll() {
  isApiRequestActive = true;
  newsApi.page += 1;
  newsApi.getCards().then(data => {
    renderData(data.hits);
    isApiRequestActive = false;
  });
}
function endOfScroll() {
  setTimeout(() => {
    Notify.warning(`I'm sorry, but this is the last page of results for your request`);
  }, 500);
  window.removeEventListener('scroll', onWindowScroll);
}
// const { height: cardHeight } = document
//   .querySelector(".gallery")
//   .firstElementChild.getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 10,
//   behavior: "smooth",
// });
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createCardsMarkup } from './js_modules/HTML_markup';
import NewApi from './js_modules/request';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();

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

const observer = new IntersectionObserver((entries)=>{
  // слідкуємо лише за одним елементом
    const entry = entries[0];
    if (entry.isIntersecting) {
      if (newsApi.page === newsApi.maxPage) {endOfScroll(); return}
  
      if (!isApiRequestActive) progressOfScroll();
    }
  });

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
      observer.unobserve(refs.observerEl);
      showLoadMoreBox();
      isActiveLoadMoreBtn();
    }
    if (data.hits.length && userChoice) {
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
      observer.observe(refs.observerEl);
    }
    if (!data.hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    renderData(data.hits);
    countMaxPage(data);
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
}

function isActiveLoadMoreBtn() {
  if (newsApi.page === newsApi.maxPage) {
    Notify.warning(`I'm sorry, but this is the last page of results for your request`);
    refs.loadMoreBtn.disabled = true;
  } 
  else refs.loadMoreBtn.disabled = false;
}

function handleLoadMoreClick(e) {
  newsApi.page += 1;
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
  gallery.refresh();
  AOS.refreshHard();
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
  observer.unobserve(refs.observerEl);
}
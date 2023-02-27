export const createCardsMarkup = ({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) => {
  return `
    <a href="${largeImageURL}" class="img-link card-item" >
      <img class="img-prew" src="${webformatURL}" alt="${tags}" title="${tags}"/>
      <div class="img-info">
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
    </a>
  `;
};

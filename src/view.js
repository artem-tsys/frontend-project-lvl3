import onChange from 'on-change';

const renderError = (elements, message, i18next) => {
  const feedbackEl = elements.feedback;
  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
  feedbackEl.innerHTML = i18next.t(message);
};

const renderSuccess = (elements, message, i18next) => {
  const feedbackEl = elements.feedback;
  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.innerHTML = i18next.t(message);
};

const renderFeeds = (data, elements, i18next) => {
  const feedsEl = elements.feedsContainer;
  feedsEl.innerHTML = '';

  const feedsHtml = data.map((feed) => `<li class="list-group-item "><h3>${feed.title}</h3><p>${feed.description}</p></li>`);
  const feeds = feedsHtml.join('');
  feedsEl.innerHTML = `
  <h2 class="feeds__title">${i18next.t('feedsTitle')}</h2>
  <ul class="feeds__list list-group">
    ${feeds}
  </ul>
  `;
};

const renderPosts = (feeds, elements, i18next, seenPosts) => {
  const postsEl = elements.postsContainer;
  postsEl.innerHTML = '';
  const posts = feeds.map((item) => {
    const linkClass = seenPosts.has(item.id) ? 'fw-regular' : 'fw-bold';
    const result = `<li class="list-group-item d-flex justify-content-between align-items-start" data-post-element data-post-id="${item.id}">
    <a href="${item.linkSite}" class="${linkClass}">${item.title}</a>
    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal" data-post-id="${item.id}">
      ${i18next.t('form.button')}
    </button></li>`;
    return result;
  });
  const postsHtml = posts.join('');
  postsEl.innerHTML = `
  <h2 class="posts__title">${i18next.t('postsTitle')}</h2>
  <ul class="posts__list list-group">
  ${postsHtml}
</ul>
  `;
};

const renderForm = (status, elements, i18next) => {
  switch (status) {
    case 'filling':
      elements.formContainer.reset();
      elements.input.removeAttribute('disabled');
      elements.input.removeAttribute('readonly');
      elements.submit.removeAttribute('disabled');
      break;
    case 'success':
      renderSuccess(elements, 'messages.success', i18next);
      break;
    case 'getting':
      elements.input.setAttribute('disabled', 'disabled');
      elements.input.setAttribute('readonly', true);
      elements.submit.setAttribute('disabled', 'disabled');
      break;
    case 'failed':
      elements.input.removeAttribute('disabled');
      elements.submit.removeAttribute('disabled');
      elements.input.removeAttribute('readonly');
      break;
    default:
      throw new Error(`Unknown form status: ${status}`);
  }
};

const setSeenPosts = (seenPostsMap, postsContainer) => {
  const seenPosts = Array.from(seenPostsMap.values());
  seenPosts.forEach((postId) => {
    const post = postsContainer.querySelector(`[data-post-id="${postId}"]`);
    const linkEl = post.querySelector('a');
    linkEl.classList.remove('fw-bold');
    linkEl.classList.add('fw-normal');
  });
};

const renderModal = (modal, elements) => {
  const { title, description, link } = modal.post;
  const modalEl = elements.modal;
  modalEl.title.textContent = title;
  modalEl.content.textContent = description;
  modalEl.link.setAttribute('href', link);
};

const resetInputClasses = (input) => {
  input.classList.remove('is-valid');
  input.classList.remove('is-invalid');
};

const renderValidInput = (input) => {
  input.classList.add('is-valid');
};

const renderInvalidInput = (element) => {
  element.classList.add('is-invalid');
};

const renderInputError = (field, elements) => {
  resetInputClasses(elements.input);
  if (field.valid) {
    renderValidInput(elements.input);
  } else {
    renderInvalidInput(elements.input);
  }
};

function initView(state, elements, i18next) {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.fields.url':
        renderInputError(value, elements);
        renderError(elements, value.error, i18next);
        break;
      case 'form.status':
        renderForm(value, elements, i18next);
        break;
      case 'error':
        renderError(elements, value, i18next);
        break;
      case 'feeds':
        renderFeeds(value, elements, i18next);
        break;
      case 'posts':
        renderPosts(value, elements, i18next, state.ui.seenPosts);
        break;
      case 'modal':
        renderModal(value, elements);
        break;
      case 'ui.seenPosts':
        setSeenPosts(value, elements.postsContainer);
        break;
      default:
        break;
    }
  });

  return watchedState;
}
export default initView;

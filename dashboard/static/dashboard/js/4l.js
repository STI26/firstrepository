/* Login: Open contexts modal menu */
const openContextsMenu = (url) => {
  document.querySelector('.modal-contexts-menu').classList.add('open-modal');
  // Load contexts
  postData(url)
    .then(data => {
      treeView('treeContexts').render(data);
    })
    .catch(error => {
      infoBlock('error', error);
    });
}
/* Login - contexts: Apply context */
const applyContext = () => {
  document.querySelector('.modal-contexts-menu').classList.remove('open-modal');
  const path = treeView('treeContexts').getPath();
  if (path === undefined) {
    document.querySelector('input[name=context]').value = '';
  } else {
    document.querySelector('input[name=context]').value = path.join('.');
  }
}

docReady(function() {
  // DOM is loaded and ready for manipulation here

  // Initialize tree view
  treeView().init();
  // Login: Show a simple login form
  document.querySelector('#display-simple-form').addEventListener('click', function() {
    document.querySelector('.login-form-inner').classList.add('rotate180');
  });
  // Login: Show a OES login form
  document.querySelector('#display-oes-form').addEventListener('click', function() {
    document.querySelector('.login-form-inner').classList.remove('rotate180');
  });
  // Login: Open contexts menu
  document.querySelector('#menu-contexts').addEventListener('click', function() {
    openContextsMenu(this.dataset.fetch);
  });
  // Login - contexts: Close contexts menu
  document.querySelector('#close-modal-contexts').addEventListener('click', function() {
    document.querySelector('.modal-contexts-menu').classList.remove('open-modal');
  });
  // Login - contexts: Select contexts menu
  document.querySelector('#apply-modal-contexts').addEventListener('click', applyContext);

});

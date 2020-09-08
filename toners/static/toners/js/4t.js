const test = () => {
  const url = document.querySelector('.table-conteiner').dataset.fetch;
  const obj = {
    number: 10,
    currentPage: 1,
    names: null,
    statuses: null,
  };
  postData(url, obj, 'loadToners')
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      infoBlock('error', error);
    });
};

docReady(function() {
  document.querySelector('#toners').addEventListener('click', test);
});

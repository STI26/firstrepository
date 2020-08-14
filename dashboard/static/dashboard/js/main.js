// Setting for flatpickr
const cfgFlatpickr = {
  enableTime: true,
  dateFormat: 'd.m.y H:i',
  time_24hr: true,
  'locale': 'ru',
  // disableMobile: "true",
};

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.closest('.dropdown-btn')) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    for (let i = 0; i < dropdowns.length; i++) {
      if (dropdowns[i].classList.contains('is-showing')) {
        dropdowns[i].classList.remove('is-showing');
      }
    }
  }
}
/* Fetch */
async function postData(url='', data={}, operation='') {
  const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  // Send the data using post
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json',
      'operation': operation,
    },
    body: JSON.stringify(data),
  })
  return response.json();
}
/* Show pagination block */
const showPagination = (page, numberRows, rowsPerPage, halfPaginationLength) => {
  document.querySelector('.pagination').innerHTML = '';
  let pagination = new DocumentFragment();
  let n;
  if (rowsPerPage === 0) {
    n = 1;
  } else {
    n = Math.ceil(numberRows / rowsPerPage);
  }
  if (n > 1) {
    let i,
        link;
    if (page > 0) {
      link = document.createElement('a');
      link.href = '#';
      link.innerHTML = '&laquo';
      pagination.appendChild(link);
    }
    if (page <= halfPaginationLength) {
      i = 0;
    } else {
      i = (page > halfPaginationLength ? halfPaginationLength - 2 : halfPaginationLength);
      i = (n > (page + halfPaginationLength) ? page - i : n - (i * 2 + 1));
      link = document.createElement('a');
      link.href = '#';
      link.innerText = 1;
      pagination.appendChild(link);
      link = document.createElement('span');
      link.innerHTML = '...';
      pagination.appendChild(link);
    }
    let maxPage;
    if (page <= halfPaginationLength) {
      maxPage = i + (halfPaginationLength * 2) - 1;
    } else {
      maxPage = i + halfPaginationLength + 2;
    }
    if (page > n - halfPaginationLength - 2) {
      i = (n - 9 < 0 ? 0 : n - 9);
      maxPage += 2;
    }
    while (i < maxPage && i < n) {
      link = document.createElement('a');
      link.href = '#';
      link.innerText = i + 1;
      if (page === 0 && i === 0) {
        link.classList.add('active');
      } else if (page === i) {
        link.classList.add('active');
      }
      pagination.appendChild(link);
      i++;
    }
    if (n > maxPage + 2) {
      link = document.createElement('span');
      link.innerHTML = '...';
      pagination.appendChild(link);
      link = document.createElement('a');
      link.href = '#';
      link.innerText = n;
      pagination.appendChild(link);
    }
    if (page < n - 1) {
      link = document.createElement('a');
      link.href = '#';
      link.innerHTML = '&raquo';
      pagination.appendChild(link);
    }
    document.querySelector('.pagination').appendChild(pagination);
  }
}
/* Open auxiliary modal */
const openAuxiliaryModal = (tableName, id=null) => {
  let header;
  let form = null;
  switch (tableName) {
    case 'departments':
    case 'modal-department':
      header = 'отдел';
      document.querySelector('#modal-new-department-name').innerHTML = '';
      document.querySelector('#modal-new-department-short-name').innerHTML = '';
      form = 'modal-department-add';
      break;
    case 'locations':
    case 'modal-location':
      header = 'расположение';
      document.querySelector('#modal-department-for-new-location').value = 0;
      document.querySelector('#modal-new-location-office').innerHTML = '';
      document.querySelector('#modal-new-location-phone').innerHTML = '';
      document.querySelector('#modal-new-location-building').value = 0;
      form = 'modal-location-add';
      break;
    case 'employees':
    case 'modal-employee':
    case 'modal-customer-in':
    case 'modal-customer-out':
      header = 'сотрудника';
      document.querySelector('#modal-new-lname').innerHTML = '';
      document.querySelector('#modal-new-fname').innerHTML = '';
      document.querySelector('#modal-new-pname').innerHTML = '';
      document.querySelector('#modal-department-for-new-employee').value = 0;
      form = 'modal-employee-add';
      break;
    case 'equipment':
    case 'modal-equipment-name':
      header = 'наименование техники';
      document.querySelector('#modal-new-equipment-type-id').value = 0;
      document.querySelector('#modal-new-equipment-brand').innerHTML = '';
      document.querySelector('#modal-new-equipment-model').innerHTML = '';
      form = 'modal-equipment-name-add';
      break;
    case 'type_of_equipment':
    case 'modal-equipment-type':
      header = 'тип техники';
      document.querySelector('#modal-new-equipment-type').innerHTML = '';
      form = 'modal-equipment-type-add';
      break;
    case 'buildings':
      header = 'филиал';
      document.querySelector('#modal-new-building').innerHTML = '';
      document.querySelector('#modal-new-building-short-name').innerHTML = '';
      form = 'modal-building-add';
      break;
    case 'users':
      header = 'пользователя';
      document.querySelector('#modal-new-username').innerHTML = '';
      document.querySelector('#modal-new-password').innerHTML = '';
      document.querySelector('#modal-new-confirm').innerHTML = '';
      form = 'modal-user-add';
      break;
    default:
      break;
  }
  if (form !== null) {
    let selector = `#${form} .modal-header h4`;
    let headerEl = document.querySelector(selector);
    header = (id === null ? `Добавить ${header}` : `Изменить ${header}(#${id})`);
    headerEl.innerText = header;
    modal.open('modal-auxiliary');
    modalDisplay(form);
  }
}
/* Get value from auxiliary form */
const getAuxiliaryForm = (tableName) => {
  let obj;
  switch (tableName) {
    case 'modal-department-add':
      obj = {
        table: 'departments',
        vars: {
          name: document.querySelector('#modal-new-department-name').value,
          short_name: document.querySelector('#modal-new-department-short-name').value,
        }
      };
      break;
    case 'modal-location-add':
      obj = {
        table: 'locations',
        vars: {
          department_id: document.querySelector('#modal-department-for-new-location').value,
          office: document.querySelector('#modal-new-location-office').value,
          building: document.querySelector('#modal-new-location-building').value,
          phone: document.querySelector('#modal-new-location-phone').value
        }
      };
      break;
    case 'modal-employee-add':
      obj = {
        table: 'employees',
        vars: {
          l_name: document.querySelector('#modal-new-lname').value,
          f_name: document.querySelector('#modal-new-fname').value,
          patronymic: document.querySelector('#modal-new-pname').value,
          department_id: document.querySelector('#modal-department-for-new-employee').value
        }
      };
      break;
    case 'modal-equipment-name-add':
      obj = {
        table: 'equipment',
        vars: {
          type_id: document.querySelector('#modal-new-equipment-type-id').value,
          brand: document.querySelector('#modal-new-equipment-brand').value,
          model: document.querySelector('#modal-new-equipment-model').value
        }
      };
      break;
    case 'modal-equipment-type-add':
      obj = {
        table: 'type_of_equipment',
        vars: {
          name: document.querySelector('#modal-new-equipment-type').value
        }
      };
      break;
    case 'modal-building-add':
      obj = {
        table: 'buildings',
        vars: {
          name: document.querySelector('#modal-new-building').value,
          short_name: document.querySelector('#modal-new-building-short-name').value
        }
      };
      break;
  }
  return obj;
};
/* Get current number page */
const getNumberPage = (page) => {
  if (page === '«') {
    page = document.querySelector('.pagination > a.active').innerText;
    page = parseInt(page) - 2;
  } else if (page === '»') {
    page = document.querySelector('.pagination > a.active').innerText;
    page = parseInt(page);
  } else {
    page = parseInt(page);
    page = (page > 0 ? page - 1 : 0);
  }
  return page;
};
/* Display current item in modal */
const modalDisplay = (id) => {
  Array.from(document.querySelector('.modal-auxiliary .modal-content').children).forEach((item, i) => {
    if (item.id == id) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
};
/* Show error block */
const infoBlock = (type, message) => {
  // css style type: error, success, info
  const fr = new DocumentFragment();
  const span = document.createElement('span');
  span.innerHTML = 'x';
  span.addEventListener('click', (e) => {
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
  });
  const li = document.createElement('li');
  li.classList.add('flash', `flash-${type}`);
  li.innerHTML = message;
  li.appendChild(span);
  const ib = document.querySelector('#info-block');
  if (document.contains(ib)) {
    fr.appendChild(li);
    ib.appendChild(fr);
  } else {
    const ul = document.createElement('ul');
    ul.id = 'info-block';
    ul.appendChild(li);
    fr.appendChild(ul);
    const theFirstChild = document.querySelector('main.conteiner').firstChild;
    document.querySelector('main.conteiner').insertBefore(fr, theFirstChild);
  }
  this.clear = () => {
    document.querySelector('#info-block').innerHTML = '';
  };
  return this;
};
// Methods for modal object
const modal = {
  modals: document.querySelectorAll('.modal'),
  initial: function() {
    this.modals.forEach((item) => {
      let dataTarget = item.getAttribute('id');
      item.querySelectorAll(`[data-target=${dataTarget}]`).forEach((modal) => {
        modal.addEventListener('click', () => {
          item.classList.remove('open-modal');
          setTimeout(() => {item.style.display = 'none';}, 400);
        });
      });
    });
  },
  open: function(modalId) {
    document.getElementById(modalId).style.display = 'block';
    setTimeout(() => {document.getElementById(modalId).classList.add('open-modal');}, 0);

  },
  close: function(modalId) {
    document.getElementById(modalId).classList.remove('open-modal');
    setTimeout(() => {document.getElementById(modalId).style.display = 'none';}, 400);
  },
};

docReady(function() {
  // DOM is loaded and ready for manipulation here

  // https://github.com/feathericons/feather
  feather.replace()

  // https://github.com/flatpickr/flatpickr
  flatpickr('.flatpickr', cfgFlatpickr);

  // Toggle dropdowns
  document.querySelectorAll('.dropdown-btn').forEach((item, i) => {
    let dataTarget = item.getAttribute('id');
    item.addEventListener('click', () => {
      document.querySelector(`[data-target=${dataTarget}]`).classList.toggle('is-showing');
    });
  });

  // Close modals with [data-target]
  modal.initial();

  // Navbar: Toggle menu
  if (document.querySelector('#nav-menu')) {
    document.querySelector('#nav-menu').addEventListener('click', function() {
      let bar = document.querySelector('#topnavbar');
      if (bar.classList.contains('responsive')) {
        bar.classList.remove('responsive');
        bar.querySelectorAll('a svg.feather.feather-x')[0].innerHTML = feather.icons['menu'].toSvg();
      } else {
        bar.classList.add('responsive');
        bar.querySelectorAll('a svg.feather.feather-menu')[0].innerHTML = feather.icons['x'].toSvg();
      }
    });
  }
});

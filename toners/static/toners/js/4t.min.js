const loadToners = (page = 1) => {
  const obj = {
    number: document.querySelector('#rows-per-page').value,
    currentPage: page,
  };
  const statuses = topFilterSettings.get();
  // Get an array of keys with true values
  obj['statuses'] = Object.entries(statuses).filter(([k, v]) => v).map(([k, v]) => +k);
  const sideFilter = sideFilterSettings.get();
  if (sideFilter) {
    Object.entries(sideFilter).forEach(([key, value]) => {
      obj[key] = value;
      let filter = '';
      if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          filter += `${v}; `;
        });
      } else {
        filter = value;
      }
      document.querySelector('#side-filter').innerHTML = filter;
    });
  } else {
    document.querySelector('#side-filter').innerHTML = '';
  }
  const table = document.querySelector('.table-conteiner.table-toners');
  postData(table.dataset.fetch, obj, 'loadToners')
    .then(data => {
      // Clear table
      const rows = document.querySelectorAll('.table-conteiner.table-toners .item-conteiner');
      rows.forEach((item, i) => {
        if (i > 0) {
          item.remove();
        }
      });
      // Fill table
      const fragment = new DocumentFragment();
      data.toners.forEach((item, i) => {
        const row = rows[0].cloneNode(true);
        const id = `${item.prefix}${item.number}`;
        row.querySelector('.attribute').innerHTML = i + 1;
        row.querySelector('.attribute').dataset.id = id;
        row.querySelector('.attribute.toner-id').innerHTML = id;
        row.querySelector('.attribute.toner-id').title = id;
        row.querySelector('.attribute.toner-type').innerHTML = item.type.join(', ');
        row.querySelector('.attribute.toner-type').title = item.type.join(', ');
        row.querySelector('.attribute.owner').innerHTML = item.owner;
        row.querySelector('.attribute.owner').title = item.owner;
        if (item.date) {
          const status = feather.icons[item.status__logo].toSvg({class: 'svg-low-size'});
          row.querySelector('.attribute.status').innerHTML = status;
          row.querySelector('.attribute.status').dataset.status = item.status__id;
          row.querySelector('.attribute.status').title = item.status__name;
          row.querySelector('.attribute.location').innerHTML = item.location__office;
          row.querySelector('.attribute.location').title = item.location__office;
          row.querySelector('.attribute.date').innerHTML = addTimeZone(item.date, toString=true, onlyDate=true);
          row.querySelector('.attribute.date').title = addTimeZone(item.date, toString=true, onlyDate=true);
        } else {
          row.querySelector('.attribute.status').innerHTML = '';
          row.querySelector('.attribute.location').innerHTML = '';
          row.querySelector('.attribute.date').innerHTML = '';
        }
        fragment.appendChild(row);
      });
      table.appendChild(fragment);

      showPagination(page, data.paginator, 5);
      document.querySelector('#db-time-update').innerHTML = data.time;
    })
    .catch(error => {
      infoBlock('error', error);
    });
};
const loadTonersLog = (id) => {
  const obj = {id: id};
  const table = document.querySelector('.table-conteiner.table-toners-log');
  postData(table.dataset.fetch, obj, 'tonerLog')
    .then(data => {
      if (!data.status) {
        infoBlock('info', data.message, 3000);
        return;
      }
      // Fill in the table header
      const header = document.querySelector('#table-toners-log .table-header span');
      const crtID = data.toner_cartridge.prefix + data.toner_cartridge.number;
      const type = data.toner_cartridge.type;
      const owner = data.toner_cartridge.owner__short_name;
      header.innerHTML = `История: ${crtID}(${type}) | Владелец - ${owner}`;
      // Clear table
      const rows = document.querySelectorAll('.table-conteiner.table-toners-log .item-conteiner');
      rows.forEach((item, i) => {
        if (i > 0) {
          item.remove();
        }
      });
      // Fill in the table
      const fragment = new DocumentFragment();
      data.log.forEach((item, i) => {
        const row = rows[0].cloneNode(true);
        row.querySelector('.attribute').innerHTML = i + 1;
        row.querySelector('.attribute.date').innerHTML = addTimeZone(item.date, toString=true, onlyDate=true);
        row.querySelector('.attribute.date').title = addTimeZone(item.date, toString=true, onlyDate=true);
        const status = feather.icons[item.status__logo].toSvg({class: 'svg-low-size'});
        row.querySelector('.attribute.status').innerHTML = status;
        row.querySelector('.attribute.status').title = item.status__name;
        row.querySelector('.attribute.location').innerHTML = item.location__office;
        row.querySelector('.attribute.location').title = item.location__office;
        row.querySelector('.attribute.note').innerHTML = item.note;
        row.querySelector('.attribute.note').title = item.note;
        fragment.appendChild(row);
      });
      table.appendChild(fragment);
      dataTable.open('#table-toners-log');
    })
    .catch(error => {
      infoBlock('error', error);
    });
};
const toggleSidebar = () => {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggler = document.querySelector('.sidebar-toggler');
  sidebar.classList.toggle('open');
  if (sidebar.classList.contains('open')) {
    sidebarToggler.innerHTML = '&lsaquo;&lsaquo;';
  } else {
    sidebarToggler.innerHTML = '&rsaquo;&rsaquo;';
  }
};
const getPrinterModels = (brand) => {
  const url = document.querySelector('.table-conteiner.table-toners').dataset.fetch;
  const obj = {
    brand: brand
  };
  postData(url, obj, 'getPrinterModels')
    .then(data => {
      fillPrinterModelsBlock(data, brand);
    })
    .catch(error => {
      infoBlock('error', error);
    });
};
const fillPrinterModelsBlock = (data, brand) => {
  const block = document.querySelector('#printer-models-block');
  block.innerHTML = '';
  const fragment = new DocumentFragment();
  data.models.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.name = 'model';
    btn.innerHTML = item.model;
    btn.dataset.brand = brand;
    btn.addEventListener('click', function() {
      sideFilterSettings.update({
        brand: this.dataset.brand,
        model: this.innerHTML
      });
      block.classList.remove('open');
      loadToners();
    });
    fragment.append(btn);
  });
  block.append(fragment);
  block.classList.add('open');
};
const toggleStatus = () => {
  topFilterSettings.update();
  loadToners();
};
/* Open new form for change location and status toner-cartridge */
const moveToner = (id) => {
  const url = document.querySelector('.table-conteiner.table-toners').dataset.fetch;
  const obj = {};
  // Step 1 of 3
  this.selectDepartment = () => {
    postData(url, {}, 'getDepartments')
      .then(data => {
        console.log(data);
        obj.department = '';
      })
      .catch(error => {
        infoBlock('error', error);
      });
  };
  // Step 2 of 3
  this.selectLocation = () => {
    postData(url, obj, 'getlocations')
      .then(data => {
        console.log(data);
        obj.location = '';
      })
      .catch(error => {
        infoBlock('error', error);
      });
  };
  // Step 3 of 3
  this.selectStatus = (statuses) => {
    obj.status = '';
    postData(url, obj, 'move')
      .then(data => {
        if (data.status) {
          infoBlock('success', data.message);
        }
        console.log(data);
      })
      .catch(error => {
        infoBlock('error', error);
      });
  };
};
/* Open new form for add new toner-cartridge */
const addToner = () => {
  const url = document.querySelector('.table-conteiner.table-toners').dataset.fetch;
  postData(url, {}, 'openBlankForm')
    .then(data => {
      createRowForNewToner(data);
    })
    .catch(error => {
      infoBlock('error', error);
    });
};
/* Save new toner-cartridge */
const saveToner = () => {
  const obj = {
    prefix: document.querySelector('#new-prefix').value,
    number: document.querySelector('#new-number').value,
    names: document.multipleSelect('new-type').getSelection()[0],
    owner: document.multipleSelect('new-owner').getSelection()[0][0],
  };
  const url = document.querySelector('.table-conteiner.table-toners').dataset.fetch;
  postData(url, obj, 'save')
    .then(data => {
      if (data.status) {
        infoBlock('success', data.message, 3000);
        loadToners();
      }
    })
    .catch(error => {
      infoBlock('error', error);
    });
};
/* Autocomplite toner-cartridge ID */
const autocompliteID = (prefix, el) => {
  const url = document.querySelector('.table-conteiner.table-toners').dataset.fetch;
  postData(url, {prefix: prefix.toLowerCase()}, 'getMaxID')
    .then(data => {
      if (data.maxID) {
        el.value = data.maxID + 1;
      } else {
        el.value = 1;
      }
    })
    .catch(error => {
      infoBlock('error', error);
    });
};
/* Create and fill new row on main table. (Preparing to add new toner-cartridge) */
const createRowForNewToner = (data) => {
  const html = `
    <div class="attribute" data-name="#">+</div>
    <div class="attribute" data-name="Префикс"><input class="attribute-input" type="text" id="new-prefix" placeholder="Префикс" required=""></div>
    <div class="attribute" data-name="Номер"><input class="attribute-input" type="number" id="new-number" placeholder="Номер" required=""></div>
    <div class="attribute" data-name="Тип"><input class="attribute-input" type="text" id="new-type" placeholder="Тип" required=""></div>
    <div class="attribute" data-name="Владелец"><input class="attribute-input" type="text" id="new-owner" placeholder="Владелец" required=""></div>
    <div class="attribute" data-name=""><button class="attribute-btn close">&#10006;</button></div>
    <div class="attribute" data-name=""><button class="attribute-btn apply">&#10004;</button></div>
    <div class="attribute" data-name="Типы" data-multiple-select-menu="new-type" style="display: none;"></div>
    <div class="attribute" data-name="Отделы" data-multiple-select-menu="new-owner" style="display: none;"></div>
  `;

  if (document.querySelector('#new-toner-cartridge')) {
    return;
  }
  const li = document.createElement('li');
  li.classList.add('item', 'item-conteiner-new');
  li.id = "new-toner-cartridge";
  li.innerHTML = html;
  document.querySelector('.table-conteiner.table-toners').appendChild(li);

  // Add action for buttons
  document.querySelector('#new-toner-cartridge .close').addEventListener('click', (event) => {
    event.stopPropagation();
    document.querySelector('#new-toner-cartridge').remove();
  });
  document.querySelector('#new-toner-cartridge .apply').addEventListener('click', (event) => {
    event.stopPropagation();
    const form = [
      document.querySelector('#new-prefix'),
      document.querySelector('#new-number'),
      document.querySelector('#new-type'),
      document.querySelector('#new-owner'),
    ];
    let formReady = true;
    form.forEach((item) => {
      if (!item.checkValidity()) {
        formReady = false;
        infoBlock('info', 'Заполните все поля.', 3000);
        item.classList.add('not-filled');
      } else {
        item.classList.remove('not-filled');
      }
    });
    if (formReady) {
      saveToner();
      document.querySelector('#new-toner-cartridge').remove();
    }
  });
  // Add action for multipleSelect
  document.multipleSelect('new-type').init();
  document.multipleSelect('new-type').update(data.types);
  document.multipleSelect('new-owner').init();
  document.multipleSelect('new-owner').update(data.departments, true);
  // Autocomplite toner-cartridge ID
  document.querySelector('#new-prefix').addEventListener('keyup', function() {
    const target = document.querySelector('#new-number');
    autocompliteID(this.value, target);
  });
};
/* Get or set side-filter settings */
const sideFilterSettings = {
  update: (filter) => {
    // format 'filter': {brand: 'brand_name', model: 'model_name'}
    if (typeof filter === 'object') {
      localStorage.setItem('sideFilter', JSON.stringify({
        printer: filter
      }));
      // format 'filter': type_name
    } else {
      localStorage.setItem('sideFilter', JSON.stringify({
        type: filter
      }));
    }
  },
  get: () => {
    if (localStorage.sideFilter) {
      const data = JSON.parse(localStorage.getItem('sideFilter'));
      return data;
    }
    return null;
  },
  clear: () => {
    localStorage.removeItem('sideFilter');
  },
};
/* Get or set top-filter settings */
const topFilterSettings = {
  update: function() {
    let data = {};
    document.querySelectorAll('.filter .switch').forEach((item, i) => {
      data[item.dataset.status] = item.checked;
    });
    localStorage.setItem('statusFilter', JSON.stringify(data));
  },
  apply: function() {
    if (localStorage.statusFilter) {
      const data = JSON.parse(localStorage.getItem('statusFilter'));
      Object.entries(data).forEach((item) => {
        const key = item[0];
        const value = item[1];
        const status = document.querySelector(`#status-${key}`);
        if (status) {
          status.checked = value;
        };
      });
    } else {
      this.update();
    }
  },
  get: function() {
    if (localStorage.statusFilter) {
      const data = JSON.parse(localStorage.getItem('statusFilter'));
      return data;
    }
    return null;
  },
};
/* Get or set default settings */
const defaultSettings = {
  update: () => {
    const data = {
      numberRowsPerPage: document.querySelector('#rows-per-page').value,
    };
    localStorage.setItem('toners', JSON.stringify(data));
  },
  apply: () => {
    if (localStorage.toners) {
      const data = JSON.parse(localStorage.getItem('toners'));
      document.querySelector('#rows-per-page').value = data.numberRowsPerPage;
    } else {
      document.querySelector('#rows-per-page').value = '20';
    }
  },
}
// Methods for table object: open, close, initial(set close button)
const dataTable = {
  tables: document.querySelectorAll('.table'),
  initial: function() {
    this.tables.forEach((item) => {
      let dataTarget = item.getAttribute('id');
      item.querySelectorAll(`[data-target=${dataTarget}]`).forEach((table) => {
        table.addEventListener('click', () => {
          item.classList.remove('show-table');
          setTimeout(() => {item.style.display = 'none';}, 400);
        });
      });
    });
  },
  open: function(tableSelector) {
    document.querySelector(tableSelector).style.display = 'block';
    setTimeout(() => {document.querySelector(tableSelector).classList.add('show-table');}, 0);

  },
  close: function(tableSelector) {
    document.querySelector(tableSelector).classList.remove('show-table');
    setTimeout(() => {document.querySelector(tableSelector).style.display = 'none';}, 400);
  },
};

docReady(function() {
  // Apply default top filter settings
  topFilterSettings.apply();
  // Apply default page settings
  defaultSettings.apply();
  // Table(main): Load and fill with default settings
  loadToners();
  // Tables: Hide the current table
  dataTable.initial();

  // Top filter: Remove selected row
  document.querySelector('#remove-row').addEventListener('click', () => {
    const row = document.querySelector('.table-conteiner.table-toners .table-active-row div:first-child');
    if (row) {
      removeToner(row.dataset.id);
    } else {
      infoBlock('info', 'Нет выделенных строк.', 3000);
    }
  });
  // Top filter: Show form to add a new row to log table
  document.querySelector('#move-row').addEventListener('click', () => {
    const row = document.querySelector('.table-conteiner.table-toners .table-active-row div:first-child');
    if (row) {
      moveToner(row.dataset.id);
    } else {
      infoBlock('info', 'Нет выделенных строк.', 3000);
    }
  });
  // Top filter: Show log table of the selected toner-cartridge
  document.querySelector('#open-log').addEventListener('click', () => {
    const row = document.querySelector('.table-conteiner.table-toners .table-active-row div:first-child');
    if (row) {
      loadTonersLog(row.dataset.id);
    } else {
      infoBlock('info', 'Нет выделенных строк.', 3000);
    }
  });
  // Top filter: Show form to add a new row to toner-cartridge table
  document.querySelector('#add-row').addEventListener('click', () => {
    addToner();
  });
  // Sidebar: Toggler
  document.querySelector('.sidebar-toggler').addEventListener('click', toggleSidebar);
  // Table(main): Change the number of lines per page and reload main table
  document.querySelector('#rows-per-page').addEventListener('change', () => {
    defaultSettings.update();
    loadToners();
  });
  // Side filter: Reset side filters and reload main table
  document.querySelector('#reset-filters').addEventListener('click', () => {
    sideFilterSettings.clear();
    loadToners();
  });
  // Table(main): Show the current row in table
  document.querySelector('.table-conteiner.table-toners').addEventListener('click', function(e) {
    this.querySelectorAll('li.item-conteiner').forEach((item, i) => {
      if (item.classList.contains('table-active-row')) {
        item.classList.remove('table-active-row');
      }
    });
    const row = e.target.closest('li.item-conteiner:not(:first-child)');
    row && row.classList.add('table-active-row');
  });
  // Table(main): Show log table of the selected toner-cartridge (double click on a row)
  document.querySelector('.table-conteiner.table-toners').addEventListener('dblclick', function(e) {
    const el = e.target.closest('li.item-conteiner:not(:first-child)');
    el && loadTonersLog(el.querySelector(':first-child').dataset.id);
  });
  // Sidebar: Show dropdown
  document.querySelectorAll('.sidebar-dropdown-btn').forEach((item, i) => {
    item.addEventListener('click', function() {
      this.classList.toggle('open');
    });
  });
  // Sidebar: Select brand
  document.querySelectorAll('[name=brand]').forEach((item, i) => {
    item.addEventListener('click', function() {
      getPrinterModels(item.innerHTML);
    });
  });
  // Sidebar: Select type
  document.querySelectorAll('[name=type]').forEach((item, i) => {
    item.addEventListener('click', function() {
      sideFilterSettings.update(item.innerHTML);
      loadToners();
    });
  });
  // Filter: Update status
  document.querySelectorAll('.filter .switch').forEach((item, i) => {
    item.addEventListener('click', toggleStatus);
  });
  // Table: Pagigation buttons
  document.querySelector('.pagination').addEventListener('click', (e) => {
    event.preventDefault();
    event.stopPropagation();
    const n = e.target.closest('a');
    n && loadToners(n.dataset.page);
  });

});

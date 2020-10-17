const loadToners = (page = 1) => {
  // Remove form for new toner-cartridge
  if (document.querySelector('#new-toner-cartridge')) {
    document.querySelector('#new-toner-cartridge').remove();
  }

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
        row.querySelector('.attribute').dataset.id = item.id;
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
      infoBlock('error', error, 10000);
    });
};
const loadTonersLog = (id) => {
  const obj = {id: id};
  const table = document.querySelector('.table-conteiner.table-toners-log');
  postData(table.dataset.fetch, obj, 'tonerLog')
    .then(data => {
      if (!data.status) {
        infoBlock('error', data.message, 3000);
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
        const printer = item.equipment__brand__short_name ? `${item.equipment__brand__short_name} ${item.equipment__model}` : '';
        row.querySelector('.attribute.printer').innerHTML = printer;
        row.querySelector('.attribute.printer').title = printer;
        row.querySelector('.attribute.note').innerHTML = item.note;
        row.querySelector('.attribute.note').title = item.note;
        fragment.appendChild(row);
      });
      table.appendChild(fragment);
      dataTable.open('#table-toners-log');
    })
    .catch(error => {
      infoBlock('error', error, 10000);
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
      infoBlock('error', error, 10000);
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
const moveToner = () => {
  const url = document.querySelector('.table-conteiner.table-toners').dataset.fetch;
  const activeRows = document.querySelectorAll('.table-toners .table-active-row');
  const tonerCartridges = Array.from(activeRows, x => x.firstElementChild.dataset.id);
  // Step 1 of 6 (select department)
  this.selectDepartment = () => {
    if (document.querySelector('[data-multiple-select-menu=move-toner-cartridge]') ||
        !document.querySelector('.table-toners .table-active-row')) {
      return;
    }
    const obj = {};
    obj.toner_cartridges = tonerCartridges;
    postData(url, obj, 'getDepartments')
      .then(data => {
        const activeRows = document.querySelectorAll('.table-toners .table-active-row');
        const activeRow = activeRows[activeRows.length - 1];

        const div = document.createElement('div');
        div.dataset.multipleSelectMenu = 'move-toner-cartridge';
        div.classList.add('attribute', 'modifies');

        activeRow.appendChild(div);
        // Button action if select department
        this.btnFunc = () => {
          obj.department = document.multipleSelect('move-toner-cartridge').getSelection()[0][0];
          // Start step 2
          selectLocation(obj);
        };
        // Update multipleSelect
        document.multipleSelect('move-toner-cartridge').update(data.departments, radioMode=true, btnFunc=btnFunc);
      })
      .catch(error => {
        infoBlock('error', error, 10000);
      });
  };
  // Step 2 of 6 (select location)
  this.selectLocation = (obj) => {
    postData(url, obj, 'getLocationsAndStatuses')
      .then(data => {
        if (data.locations.length === 0) {
          infoBlock('info', 'В базе отсутствуют "комнаты" связанные с текущей службой. \
                    Выберете другую службу либо добавте в текущею через панель администратора.', 3000);
          return;
        }
        // Button action if select location
        this.btnFunc = () => {
          obj.location = document.multipleSelect('move-toner-cartridge').getSelection()[0][0];
          // Start step 3
          selectStatus(obj, data.statuses);
        };
        document.multipleSelect('move-toner-cartridge').update(data.locations, radioMode=true, btnFunc=btnFunc);
      })
      .catch(error => {
        infoBlock('error', error, 10000);
      });
  };
  // Step 3 of 6 (select status)
  this.selectStatus = (obj, statuses) => {
    if (statuses.length === 0) {
      infoBlock('info', 'В базе отсутствуют "статусы". Вы можете добавте их через панель администратора.', 3000);
      return;
    }
    // Button action if select status
    this.btnFunc = () => {
      obj.status = document.multipleSelect('move-toner-cartridge').getSelection()[0][0];
      // Start step 4
      selectPrinters(obj);
    };
    document.multipleSelect('move-toner-cartridge').update(statuses, radioMode=true, btnFunc=btnFunc);
  };
  // Step 4 of 6 (select printer)
  this.selectPrinters = (obj) => {
    postData(url, obj, 'getPrinters')
      .then(data => {
        if (!data.link_printer) {
          obj.equipment = null;
          // Start step 5
          addNote(obj);
          return;
        }
        if (data.printers.length === 0) {
          infoBlock('info', 'С текущем картриджем нет связанных принтеров. Вы можете добавте их через панель администратора.', 3000);
          return;
        }
        // Button action if select printer
        this.btnFunc = () => {
          obj.equipment = document.multipleSelect('move-toner-cartridge').getSelection()[0][0];
          // Start step 5
          addNote(obj);
        };
        document.multipleSelect('move-toner-cartridge').update(data.printers, radioMode=true, btnFunc=btnFunc);
      })
      .catch(error => {
        infoBlock('error', error, 10000);
      });
  };
  // Step 5 of 6 (add note)
  this.addNote = (obj) => {
    const menu = document.querySelector('[data-multiple-select-menu=move-toner-cartridge]');
    menu.innerHTML = '';
    const btnBlockHTML = `
      <input type="text" id="toner-cartridge-log--note" value="" placeholder="Добавьте примечание" autocomplete="off" autofocus>
      <button type="submit">&#10004;</button>
    `;
    const btnBlock = document.createElement('form');
    btnBlock.classList.add('btn-block');
    btnBlock.innerHTML = btnBlockHTML;
    btnBlock.addEventListener('submit', (event) => {
      event.stopPropagation();
      event.preventDefault();
      obj.note = document.querySelector('#toner-cartridge-log--note').value;
      // Start step 6
      saveObj(obj);
    });
    menu.appendChild(btnBlock);
  };
  // Step 6 of 6 (try to save)
  this.saveObj = (obj) => {
    obj.date = new Date();
    console.log('activeRows', activeRows);
    console.log('obj', obj);
    postData(url, obj, 'move')
      .then(data => {
        if (data.status) {
          infoBlock('success', data.message, 3000);
          loadToners();
        } else {
          infoBlock('error', data.message, 10000);
        }
        document.querySelector('[data-multiple-select-menu=move-toner-cartridge]').remove();
      })
      .catch(error => {
        infoBlock('error', error, 10000);
      });
  };
  // Start first step
  selectDepartment();
};
/* Remove toner-cartridge */
const removeToner = (id) => {
  if (!window.confirm(`Вы действительно хотите удалить текущий картридж?`)) {
    return;
  }
  const url = document.querySelector('.table-conteiner.table-toners').dataset.fetch;
  postData(url, {id: id}, 'remove')
    .then(data => {
      if (data.status) {
        infoBlock('success', data.message, 3000);
        loadToners();
      } else {
        infoBlock('error', data.message, 5000);
      }
    })
    .catch(error => {
      infoBlock('error', error, 10000);
    });
};
/* Open new form for add new toner-cartridge */
const addToner = () => {
  const url = document.querySelector('.table-conteiner.table-toners').dataset.fetch;
  postData(url, {}, 'openBlankForm')
    .then(data => {
      createRowForNewToner(data);
    })
    .catch(error => {
      infoBlock('error', error, 10000);
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
      } else {
        infoBlock('error', data.message, 3000);
      }
    })
    .catch(error => {
      infoBlock('error', error, 10000);
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
      infoBlock('error', error, 10000);
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
/* Select rows in main table */
function selectRowsInTable(e) {
  let selectedRows;
  if (e.shiftKey) {
    selectedRows = document.querySelectorAll('.table-conteiner.table-toners li.item-conteiner.table-active-row');
  } else if (e.ctrlKey || e.altKey) {
    // Do nothing
  } else {
    // Unselect all rows
    this.querySelectorAll('li.item-conteiner').forEach((item, i) => {
      if (item.classList.contains('table-active-row')) {
        item.classList.remove('table-active-row');
      }
    });
  }
  const row = e.target.closest('li.item-conteiner:not(:first-child)');
  // Remove change location menu
  if (row && !row.querySelector('[data-multiple-select-menu=move-toner-cartridge]') &&
      document.querySelector('[data-multiple-select-menu=move-toner-cartridge]')) {
    document.querySelector('[data-multiple-select-menu=move-toner-cartridge]').remove();
  }
  // Select row
  const allRows = document.querySelectorAll('.table-conteiner.table-toners li.item-conteiner:not(:first-child)');
  if (e.altKey) {
    selectedRows = document.querySelectorAll('.table-conteiner.table-toners li.item-conteiner.table-active-row');
    if (selectedRows.length !== 0) {
      allRows.forEach((item) => {
        item.classList.remove('table-active-row');
      });
    } else {
      allRows.forEach((item) => {
        item.classList.add('table-active-row');
      });
    }

  } else if (selectedRows && row) {
    const currentRow = parseInt(row.firstElementChild.innerHTML);
    let currentRowFirst = false;
    let firstSelectRow = parseInt(selectedRows[0].firstElementChild.innerHTML);
    if (currentRow <= firstSelectRow) {
      currentRowFirst = true;
    }
    for (let item of allRows) {
      let number = parseInt(item.firstElementChild.innerHTML);
      if (currentRowFirst && (number >= currentRow)) {
        if (item.classList.contains('table-active-row')) {
          break;
        }
        item.classList.add('table-active-row')
      } else if (number >= firstSelectRow) {
        item.classList.add('table-active-row')
        if (number === currentRow) {
          break;
        }
      }
    }
  } else if (row) {
    row.classList.add('table-active-row');
  }
}
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
      moveToner();
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
  // Table(main): Select rows in table
  document.querySelector('.table-conteiner.table-toners').addEventListener('click', selectRowsInTable);
  // Table(main): Show form to add a new row to log table (double click on a row)
  document.querySelector('.table-conteiner.table-toners').addEventListener('dblclick', function(e) {
    const el = e.target.closest('li.item-conteiner:not(:first-child)');
    el && moveToner();
  });
  // Table(main): Show log table of the selected toner-cartridge (contextmenu click on a row)
  document.querySelector('.table-conteiner.table-toners').addEventListener('contextmenu', function(e) {
    e.stopPropagation();
    e.preventDefault();
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

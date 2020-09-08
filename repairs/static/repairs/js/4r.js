/* Table: details or short form */
function repairsDetails(details=true) {
  let setShort = function() {
    displayElementsBySelector('.input-names', 'none');
    displayElementsBySelector('.phone', 'none');
    displayElementsBySelector('.inv', 'none');
    displayElementsBySelector('.customer-out', 'none');
    document.querySelector('.table-conteiner').style.fontSize = '1rem';
  };
  let setDetails = function() {
    displayElementsBySelector('.input-names', 'initial');
    displayElementsBySelector('.phone', 'initial');
    displayElementsBySelector('.inv', 'initial');
    displayElementsBySelector('.customer-out', 'initial');
    document.querySelector('.table-conteiner').style.fontSize = '.625rem';
  };
  document.querySelector('#show-all-columns').addEventListener('click', function() {
    defaultSettings.update();
    if (this.checked == true) {
      setDetails();
    } else {
      setShort();
    }
  });
  if (details == true) {
    setDetails();
    document.querySelector('#show-all-columns').checked = true;
  } else {
    setShort();
    document.querySelector('#show-all-columns').checked = false;
  }
}

/* Toggle column */
function displayElementsBySelector(className, value) {
  document.querySelectorAll(className).forEach((item, i) => {
    item.style.display = value;
  });
}

/* Load repairs table */
function loadRepairs(page=1) {
  let rowsPerPage = parseInt(document.querySelector('#rows-per-page').value);
  let obj = {
    number: rowsPerPage,
    currentPage: page,
    activeRepairs: document.querySelector('#active-repairs').checked,
  };
  const table = document.querySelector('.table-conteiner');
  postData(table.dataset.fetch, obj, 'load_repairs')
    .then(data => {
      // Clear table
      const rows = document.querySelectorAll('.table-conteiner .item-conteiner');
      rows.forEach((item, i) => {
        if (i > 0) {
          item.remove();
        }
      });
      // Fill table
      let fragment = new DocumentFragment();
      data.repairs.forEach((item, i) => {
        let row = rows[0].cloneNode(true);
        row.querySelector('.attribute').innerText = item.id;
        row.querySelector('.attribute.date-in').innerText = addTimeZone(item.dateIn, toString=true);
        row.querySelector('.attribute.customer-in').innerText = item.customerIn;
        row.querySelector('.attribute.employee').innerText = item.employee;
        row.querySelector('.attribute.department').innerText = item.department;
        row.querySelector('.attribute.phone').innerText = item.phone;
        row.querySelector('.attribute.equipment').innerText = item.equipment;
        row.querySelector('.attribute.inv').innerText = item.invNumber;
        row.querySelector('.attribute.defect').innerText = item.defect;
        row.querySelector('.attribute.work').innerText = item.repair;
        row.querySelector('.attribute.note').innerText = item.currentState;
        row.querySelector('.attribute.customer-out').innerText = item.customerOut;
        row.querySelector('.attribute.date-out').innerText = addTimeZone(item.dateOut, toString=true);

        row.querySelector('.attribute.date-in').title = addTimeZone(item.dateIn, toString=true);
        row.querySelector('.attribute.customer-in').title = item.customerIn;
        row.querySelector('.attribute.employee').title = item.employee;
        row.querySelector('.attribute.department').title = item.department;
        row.querySelector('.attribute.phone').title = item.phone;
        row.querySelector('.attribute.equipment').title = item.equipment;
        row.querySelector('.attribute.inv').title = item.invNumber;
        row.querySelector('.attribute.defect').title = item.defect;
        row.querySelector('.attribute.work').title = item.repair;
        row.querySelector('.attribute.note').title = item.currentState;
        row.querySelector('.attribute.customer-out').title = item.customerOut;
        row.querySelector('.attribute.date-out').title = addTimeZone(item.dateOut, toString=true);
        fragment.appendChild(row);
      });
      table.appendChild(fragment);

      showPagination(page, data.paginator, 5)
      document.querySelector('#db-time-update').innerText = data.time;
    })
    .catch(error => {
      infoBlock('error', error);
    });
}

/* Save repair */
function saveRepair() {
  let dateIn;
  let dateOut;
  let customerOut;
  if (document.querySelector('#modal-date-in').value === '') {
    dateIn = null;
  } else {
    dateIn = flatpickr.parseDate(document.querySelector('#modal-date-in').value, 'd.m.y H:i');
  }
  if (document.querySelector('#modal-date-out').value === '') {
    dateOut = null;
  } else {
    dateOut = flatpickr.parseDate(document.querySelector('#modal-date-out').value, 'd.m.y H:i');
  }
  if (document.querySelector('#modal-customer-out').selectedIndex > 0) {
    customerOut = document.querySelector('#modal-customer-out').value;
  } else {
    customerOut = null;
  }
  let obj = {
    date_in: dateIn,
    location: document.querySelector('#modal-location').value,
    equipment: document.querySelector('#modal-equipment-model').value,
    defect: document.querySelector('#modal-defect').value,
    inv_number: document.querySelector('#modal-inv').value,
    customer_in: document.querySelector('#modal-customer-in').value,
    employee: document.querySelector('#modal-employee').value,
    repair: document.querySelector('#modal-repair').value,
    current_state: document.querySelector('#modal-current-state').value,
    date_out: dateOut,
    customer_out: customerOut,
  };
  let id = document.querySelector('#modal-id').innerText;
  // Detect temporary id
  if (id.search('\\*') < 0) {
    obj.id = id;
  } else {
    obj.id = -1;
  }
  const url = document.querySelector('#modal-form').action;
  // Send the data using post
  postData(url, obj, 'save')
    .then(data => {
      if (data.status === true) {
        modal.close('modal-current-row');
        infoBlock('success', data.message, 2000);
        // Reload page
        loadRepairs();
      } else {
        infoBlock('error', data.message);
      }
    })
    .catch(error => {
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    });
}

/* Open Repair */
function openRepair(el) {
  // Get id table 'repairs'
  const obj = {
    id: el.querySelector(':first-child').innerHTML,
  };
  const url = document.querySelector('#modal-form').action;
  // Send the data using post
  postData(url, obj, 'open')
    .then(data => {
      // Modal show
      modal.open('modal-current-row');
      document.querySelector('#modal-id').innerHTML = data.repair.id;

      const dateIn = flatpickr('#modal-date-in', cfgFlatpickr);
      dateIn.setDate(addTimeZone(data.repair.date_in));
      const dateOut = flatpickr('#modal-date-out', cfgFlatpickr);
      if (data.repair.date_out == null) {
        dateOut.clear();
      } else {
        dateOut.setDate(addTimeZone(data.repair.date_out));
      }
      const departments = setOptions(data.departments, 'departments');
      const locations = setOptions(data.locations, 'locations');
      const buildings = setOptions(data.buildings, 'buildings');
      const phone = data.locations.find(e => e.id === data.repair.location).phone;
      const equipmentTypes = setOptions(data.types, 'types');
      const equipmentBrands = setOptions(data.brands, 'brands');
      const equipmentModels = setOptions(data.equipment, 'equipment');
      const employees = setOptions(data.employees, 'names');
      const customers = setOptions(data.customers, 'names');
      document.querySelector('#modal-department').innerHTML = '';
      document.querySelector('#modal-location').innerHTML = '';
      document.querySelector('#modal-new-location-building').innerHTML = '';
      document.querySelector('#modal-department-for-new-employee').innerHTML = '';
      document.querySelector('#modal-department-for-new-location').innerHTML = '';
      document.querySelector('#modal-equipment-type').innerHTML = '';
      document.querySelector('#modal-new-equipment-type-id').innerHTML = '';
      document.querySelector('#modal-equipment-brand').innerHTML = '';
      document.querySelector('#modal-new-equipment-brand').innerHTML = '';
      document.querySelector('#modal-equipment-model').innerHTML = '';
      document.querySelector('#modal-customer-in').innerHTML = '';
      document.querySelector('#modal-employee').innerHTML = '';
      document.querySelector('#modal-customer-out').innerHTML = '';
      document.querySelector('#modal-department').appendChild(departments.cloneNode(true));
      document.querySelector('#modal-location').appendChild(locations);
      document.querySelector('#modal-new-location-building').appendChild(buildings);
      document.querySelector('#modal-department-for-new-employee').appendChild(departments.cloneNode(true));
      document.querySelector('#modal-department-for-new-location').appendChild(departments);
      document.querySelector('#modal-equipment-type').appendChild(equipmentTypes.cloneNode(true));
      document.querySelector('#modal-new-equipment-type-id').appendChild(equipmentTypes);
      document.querySelector('#modal-equipment-brand').appendChild(equipmentBrands.cloneNode(true));
      document.querySelector('#modal-new-equipment-brand').appendChild(equipmentBrands);
      document.querySelector('#modal-equipment-model').appendChild(equipmentModels);
      document.querySelector('#modal-customer-in').appendChild(customers.cloneNode(true));
      document.querySelector('#modal-employee').appendChild(employees);
      document.querySelector('#modal-customer-out').appendChild(customers);

      document.querySelector('#modal-department').value = data.repair.department;
      document.querySelector('#modal-location').value = data.repair.location;
      document.querySelector('#modal-phone').value = phone;
      document.querySelector('#modal-customer-in').value = data.repair.customer_in;
      document.querySelector('#modal-equipment-type').value = data.repair.type;
      document.querySelector('#modal-new-equipment-type-id').value = '';
      document.querySelector('#modal-equipment-brand').value = data.repair.brand;
      document.querySelector('#modal-new-equipment-brand').value = '';
      document.querySelector('#modal-equipment-model').value = data.repair.equipment;
      document.querySelector('#modal-inv').value = data.repair.inv_number;
      document.querySelector('#modal-employee').value = data.repair.employee;
      document.querySelector('#modal-defect').value = data.repair.defect;
      document.querySelector('#modal-repair').value = data.repair.repair;
      document.querySelector('#modal-current-state').value = data.repair.current_state;
      document.querySelector('#modal-customer-out').value = data.repair.customer_out;
      checkDepartment();
      checkEquipmentTypeAndBrand();
      if (data.readOnly) {
        readOnly('#modal-current-row').on();
      } else {
        readOnly('#modal-current-row').off();
      }
    })
    .catch(error => {
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    });
}
/* Remove Repair */
function removeRepair(el) {
  // Get id table 'repairs'
  const repairId = el.querySelector(':first-child').innerHTML;
  const obj = {
    id: repairId,
  };
  if (!window.confirm(`Вы действительно хотите удалить строку с номером: ${repairId}?`)) {
    return;
  }
  const url = document.querySelector('.table-conteiner').dataset.fetch;
  // Send the data using post
  postData(url, obj, 'remove')
    .then(data => {
      if (data.status) {
        infoBlock('info', data.message, 2000);
        loadRepairs();
      } else {
        infoBlock('error', data.message);
      }
    })
    .catch(error => {
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    })
}
/* Copy repairs */
function copyRepair(el) {
  // Get id table 'repairs'
  const obj = {
    id: el.querySelector(':first-child').innerHTML,
  };
  const url = document.querySelector('#modal-form').action;
  postData(url, obj, 'copy')
    .then(data => {
      if (data.status) {
        infoBlock('info', data.message, 2000);
        loadRepairs();
      } else {
        infoBlock('error', data.message);
      }
    })
    .catch(error => {
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    });
}
/* Open modal for add Repair */
function addRepair() {
  const url = document.querySelector('#modal-form').action;
  // Send the data using post
  postData(url, {}, 'open_new_form')
    .then(data => {
      if (data.readOnly) {
        infoBlock('info', 'У вас нет прав для создания новой записи.', 5000);
        return;
      }
      readOnly('#modal-current-row').off();
      // Modal show
      modal.open('modal-current-row');
      document.querySelector('#modal-id').innerHTML = `${data.newid}*`;

      // Put the result in a form
      const dateIn = flatpickr('#modal-date-in', cfgFlatpickr);
      const dateOut = flatpickr('#modal-date-out', cfgFlatpickr);
      dateIn.setDate(new Date());
      dateOut.clear();
      const departments = setOptions(data.departments, 'departments');
      const equipmentTypes = setOptions(data.types, 'types');
      const equipmentBrands = setOptions(data.brands, 'brands');
      const employees = setOptions(data.employees, 'names');
      const buildings = setOptions(data.buildings, 'buildings');
      document.querySelector('#modal-department').innerHTML = '';
      document.querySelector('#modal-location').innerHTML = '';
      document.querySelector('#modal-new-location-building').innerHTML = '';
      document.querySelector('#modal-department-for-new-employee').innerHTML = '';
      document.querySelector('#modal-department-for-new-location').innerHTML = '';
      document.querySelector('#modal-equipment-type').innerHTML = '';
      document.querySelector('#modal-new-equipment-type-id').innerHTML = '';
      document.querySelector('#modal-equipment-brand').innerHTML = '';
      document.querySelector('#modal-new-equipment-brand').innerHTML = '';
      document.querySelector('#modal-equipment-model').innerHTML = '';
      document.querySelector('#modal-customer-in').innerHTML = '';
      document.querySelector('#modal-employee').innerHTML = '';
      document.querySelector('#modal-customer-out').innerHTML = '';
      document.querySelector('#modal-department').appendChild(departments.cloneNode(true));
      document.querySelector('#modal-department-for-new-employee').appendChild(departments.cloneNode(true));
      document.querySelector('#modal-department-for-new-location').appendChild(departments);
      document.querySelector('#modal-equipment-type').appendChild(equipmentTypes.cloneNode(true));
      document.querySelector('#modal-new-equipment-type-id').appendChild(equipmentTypes);
      document.querySelector('#modal-equipment-brand').appendChild(equipmentBrands.cloneNode(true));
      document.querySelector('#modal-new-equipment-brand').appendChild(equipmentBrands);
      document.querySelector('#modal-employee').appendChild(employees);
      document.querySelector('#modal-new-location-building').appendChild(buildings);

      document.querySelector('#modal-department').value = '';
      document.querySelector('#modal-location').value = '';
      document.querySelector('#modal-phone').value = '';
      document.querySelector('#modal-customer-in').value = '';
      document.querySelector('#modal-equipment-type').value = '';
      document.querySelector('#modal-new-equipment-type-id').value = '';
      document.querySelector('#modal-equipment-brand').value = '';
      document.querySelector('#modal-new-equipment-brand').value = '';
      document.querySelector('#modal-inv').value = '';
      document.querySelector('#modal-employee').value = data.defaultEmployee;
      document.querySelector('#modal-defect').value = '';
      document.querySelector('#modal-repair').value = '';
      document.querySelector('#modal-current-state').value = '';
      document.querySelector('#modal-customer-out').value = '';
      checkDepartment();
      checkEquipmentTypeAndBrand();
    })
    .catch(error => {
      modal.close('modal-current-row');
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    });
}
/* Add row to auxiliary table */
function addRowToAuxiliaryTable(url, tableName) {
  const obj = getAuxiliaryForm(tableName);
  // Send the data using post
  postData(url, obj, 'add_row_to_auxiliary_table')
    .then(data => {
      if (!data.status) {
        infoBlock('error', data.message);
        return;
      }
      modal.close('modal-auxiliary');
      infoBlock('info', data.message, 2000);
      switch (obj.table) {
        case 'locations':
        case 'employees':
          changeDepartment();
          break;
        case 'equipment':
          changeEquipmentTypeOrBrand();
          break;
        default:
          return getAuxiliaryTable(url, obj.table);
      }
    })
    .then(data => {
      if (data !== undefined) {
        updateAuxiliaryForm(data.data, tableName);
      }
    })
    .catch(error => {
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    });
}
/* Get auxiliary tables */
function getAuxiliaryTable(url, tableName) {
  const obj = {table: tableName};
  // Send the data using post
  return postData(url, obj, 'get_auxiliary_table')
    .then(data => data);
}
/* Update auxiliary form */
function updateAuxiliaryForm(data, tableName) {
  switch (tableName) {
    case 'modal-department-add':
      let departments = setOptions(data, 'departments');
      // Update departments
      document.querySelector('#modal-department').innerHTML = '';
      document.querySelector('#modal-department').appendChild(departments.cloneNode(true));
      // Update departments(new)
      document.querySelector('#modal-department-for-new-employee').innerHTML = '';
      document.querySelector('#modal-department-for-new-employee').appendChild(departments.cloneNode(true));
      document.querySelector('#modal-department-for-new-location').innerHTML = '';
      document.querySelector('#modal-department-for-new-location').appendChild(departments);
      break;
    case 'modal-location-add':
      let locations = setOptions(data, 'locations');
      // Update locations
      document.querySelector('#modal-location').innerHTML = '';
      document.querySelector('#modal-location').appendChild(locations);
      break;
    case 'modal-employee-add':
      let employees = setOptions(data, 'names');
      // Update customers(in)
      document.querySelector('#modal-customer-in').innerHTML = '';
      document.querySelector('#modal-customer-in').appendChild(employees.cloneNode(true));
      // Update employees
      document.querySelector('#modal-employee').innerHTML = '';
      document.querySelector('#modal-employee').appendChild(employees.cloneNode(true));
      // Update customers(out)
      document.querySelector('#modal-customer-out').innerHTML = '';
      document.querySelector('#modal-customer-out').appendChild(employees.cloneNode(true));
      break;
    case 'modal-equipment-model-add':
      let equipment = setOptions(data, 'equipment');
      // Update equipment
      document.querySelector('#modal-equipment-name').innerHTML = '';
      document.querySelector('#modal-equipment-name').appendChild(equipment);
      break;
    case 'modal-equipment-type-add':
      let typeOfEquipment = setOptions(data, 'types');
      // Update type of equipment
      document.querySelector('#modal-equipment-type').innerHTML = '';
      document.querySelector('#modal-equipment-type').appendChild(typeOfEquipment.cloneNode(true));
      // Update type of equipment for new equipment
      document.querySelector('#modal-new-equipment-type-id').innerHTML = '';
      document.querySelector('#modal-new-equipment-type-id').appendChild(typeOfEquipment);
      break;
    case 'modal-brand-add':
      let brands = setOptions(data, 'brands');
      // Update brand of equipment
      document.querySelector('#modal-equipment-brand').innerHTML = '';
      document.querySelector('#modal-equipment-brand').appendChild(brands.cloneNode(true));
      // Update brand of equipment for new equipment
      document.querySelector('#modal-new-equipment-brand').innerHTML = '';
      document.querySelector('#modal-new-equipment-brand').appendChild(brands);
      break;
  }
}
/* load 'locations' and 'employees' */
function changeDepartment() {
  const el = document.querySelector('#modal-department');
  checkDepartment();
  if (el.selectedIndex === 0) {
    return;
  }
  if (document.querySelector('#modal-date-in').value === '') {
    docDate = new Date();
  } else {
    docDate = flatpickr.parseDate(document.querySelector('#modal-date-in').value, 'd.m.y H:i');
  }
  const obj = {
    id: el.value,
    date: docDate,
  };
  console.log(obj);
  const url = document.querySelector('#modal-form').action;
  // Send the data using post
  postData(url, obj, 'change_department')
    .then(data => {
      // Update locations
      let locations = setOptions(data['locations'], 'locations');
      document.querySelector('#modal-location').innerHTML = '';
      document.querySelector('#modal-location').appendChild(locations);
      // Update customers(in)
      let employees = setOptions(data['employees'], 'names');
      document.querySelector('#modal-customer-in').innerHTML = '';
      document.querySelector('#modal-customer-in').appendChild(employees.cloneNode(true));
      // Update customers(out)
      document.querySelector('#modal-customer-out').innerHTML = '';
      document.querySelector('#modal-customer-out').appendChild(employees);
    })
    .catch(error => {
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    });
}
/* load 'equipment' */
function changeEquipmentTypeOrBrand() {
  checkEquipmentTypeAndBrand();
  const type = document.querySelector('#modal-equipment-type');
  const brand = document.querySelector('#modal-equipment-brand');
  if (type.selectedIndex === 0 || brand.selectedIndex === 0) {
    return;
  }
  const obj = {type: type.value,
               brand: brand.value};
  const url = document.querySelector('#modal-form').action;
  // Send the data using post
  postData(url, obj, 'change_equipment_type_or_brand')
    .then(data => {
      let equipment = setOptions(data['equipment'], 'equipment');
      // Update equipment
      document.querySelector('#modal-equipment-model').innerHTML = '';
      document.querySelector('#modal-equipment-model').appendChild(equipment);
    })
    .catch(error => {
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    });
}
/* load 'equipment' */
function updateIDSeq() {
  const obj = {};
  const url = document.querySelector('#modal-form').action;
  // Send the data using post
  postData(url, obj, 'update_id_seq')
    .then(data => {
      console.log(data.data);
      infoBlock('success', data.message, 2000);
    })
    .catch(error => {
      infoBlock('error', `${arguments.callee.name} | ${error}`);
    });
}
/* Lock or unlock location and employee */
function checkDepartment() {
  const dep = document.querySelector('#modal-department').selectedIndex;
  const location = document.querySelector('#modal-location');
  const customerIn = document.querySelector('#modal-customer-in');
  const customerOut = document.querySelector('#modal-customer-out');
  if (dep !== 0) {
    location.disabled = false;
    customerIn.disabled = false;
    customerOut.disabled = false;
  }
  else {
    location.innerHTML = '';
    customerIn.innerHTML = '';
    customerOut.innerHTML = '';
    location.disabled = true;
    customerIn.disabled = true;
    customerOut.disabled = true;
  }
}
/* Lock or unlock equipment */
function checkEquipmentTypeAndBrand() {
  const et = document.querySelector('#modal-equipment-type').selectedIndex;
  const eb = document.querySelector('#modal-equipment-brand').selectedIndex;
  const equipment = document.querySelector('#modal-equipment-model');
  if (et !== 0 && eb !== 0) {
    equipment.disabled = false;
  }
  else {
    equipment.innerHTML = '';
    equipment.disabled = true;
  }
}
/* Set 'options' tags for <select> element*/
function setOptions(array, type='') {
  let fragment = new DocumentFragment();
  let content = '';
  fragment.appendChild(document.createElement('option'));
  for (let x of array) {
    for (let key in x) {
      if (x.hasOwnProperty(key) && x[key] === null) {
        x[key] = '';
      }
    }
    let option = document.createElement('option');
    switch (type) {
      case 'locations':
        content = `${x.office}`;
        break;
      case 'names':
        content = `${x.l_name} ${x.f_name} ${x.patronymic}`;
        break;
      case 'equipment':
        content = `${x.model}`;
        break;
      default:
        content = `${x.name}`;
        break;
    }
    option.value = x.id;
    option.innerText = content;
    x.phone && option.setAttribute('data-phone', x.phone);
    fragment.appendChild(option);
  }
  return fragment;
}
/* Set readonly attribute on all child elements of 'selector' */
const readOnly = (selector) => {
  const imput = document.querySelectorAll(`${selector} input`);
  const select = document.querySelectorAll(`${selector} select`);
  const button = document.querySelectorAll(`${selector} button`);
  this.off = () => {
    imput.forEach((item, i) => {
      if (item.id !== 'modal-phone') {
        item.disabled = false;
      }
    });
    select.forEach((item, i) => {
      item.disabled = false;
    });
    button.forEach((item, i) => {
      item.disabled = false;
    });
  };
  this.on = () => {
    imput.forEach((item, i) => {
      item.disabled = true;
    });
    select.forEach((item, i) => {
      item.disabled = true;
    });
    button.forEach((item, i) => {
      if (!item.classList.contains('btn-secondary')) {
        item.disabled = true;
      }
    });
  };
  return this;
};
/* Get or set default settings */
const defaultSettings = {
  update: () => {
    const data = {
      numberRowsPerPage: document.querySelector('#rows-per-page').value,
      repairsDetails: document.querySelector('#show-all-columns').checked,
      activeRepairs: document.querySelector('#active-repairs').checked,
      updateRepair: document.querySelector('#update-repairs').checked,
    };
    localStorage.setItem('repairs', JSON.stringify(data));
  },
  apply: () => {
    if (localStorage.repairs) {
      const data = JSON.parse(localStorage.getItem('repairs'));
      document.querySelector('#rows-per-page').value = data.numberRowsPerPage;
      document.querySelector('#show-all-columns').checked = data.repairsDetails;
      document.querySelector('#active-repairs').checked = data.activeRepairs;
      document.querySelector('#update-repairs').checked = data.updateRepair;
    } else {
      document.querySelector('#rows-per-page').value = '20';
      document.querySelector('#show-all-columns').checked = false;
      document.querySelector('#active-repairs').checked = false;
      document.querySelector('#update-repairs').checked = false;
    }
  },
}

docReady(function() {
  // DOM is loaded and ready for manipulation here

  // Apply default settings
  defaultSettings.apply();

  // Table: Details or short form (default short)
  repairsDetails(document.querySelector('#show-all-columns').checked);

  // Load repairs
  loadRepairs();

  // Flatpickr: Clear date
  document.querySelectorAll('.btn-x').forEach((item, i) => {
    const id = `#${item.previousElementSibling.id}`;
    item.addEventListener('click', () => {
      flatpickr(id, cfgFlatpickr).clear();
    });
  });

  // Table: Show the current row in table
  document.querySelector('.table-conteiner').addEventListener('click', function(e) {
    this.querySelectorAll('li.item-conteiner').forEach((item, i) => {
      if (item.classList.contains('table-active-row')) {
        item.classList.remove('table-active-row');
      }
    });
    const row = e.target.closest('li.item-conteiner:not(:first-child)');
    row && row.classList.add('table-active-row');
  });
  // Open modal: Edit element (double click on a row)
  document.querySelector('.table-conteiner').addEventListener('dblclick', function(e) {
    const row = e.target.closest('li.item-conteiner:not(:first-child)');
    row && openRepair(row);
  });
  // Open modal: Edit element (button on the top bar)
  document.querySelector('#edit-row').addEventListener('click', () => {
    const row = document.querySelector('.table-conteiner .table-active-row');
    if (row) {
      openRepair(row);
    } else {
      infoBlock('info', 'Нет выделенных строк.', 5000);
    }
  });
  // Table: Remove element (button on the top bar)
  document.querySelector('#remove-row').addEventListener('click', () => {
    const row = document.getElementsByClassName('table-conteiner')[0].querySelector('.table-active-row');
    if (row) {
      removeRepair(row);
    } else {
      infoBlock('info', 'Нет выделенных строк.', 5000);
    }
  });
  // Open modal: Add element (button on the top bar)
  document.querySelector('#add-row').addEventListener('click', () => {
    addRepair();
  });
  // Table: Copy element (button on the top bar)
  document.querySelector('#copy-row').addEventListener('click', () => {
    const row = document.querySelector('.table-conteiner .table-active-row');
    if (row) {
      copyRepair(row);
    } else {
      infoBlock('info', 'Нет выделенных строк.', 5000);
    }
  });
  // Modal: Submit modal form
  document.querySelector('#modal-form').addEventListener('submit', function(event) {
    event.preventDefault();
    event.stopPropagation();
    saveRepair();
  });
  // Table: Show only active repairs
  document.querySelector('#active-repairs').addEventListener('click', () => {
    defaultSettings.update();
    loadRepairs();
  });
  // Table: Change the number of lines per page and reload repairs
  document.querySelector('#rows-per-page').addEventListener('change', () => {
    defaultSettings.update();
    loadRepairs();
  });
  // Table: Pagigation buttons
  document.querySelector('.pagination').addEventListener('click', (e) => {
    event.preventDefault();
    event.stopPropagation();
    const n = e.target.closest('a');
    n && loadRepairs(n.dataset.page);
  });
  // Table: Auto update
  var setUpdateTime;
  document.querySelector('#update-repairs').addEventListener('click', function() {
    defaultSettings.update();
    if (this.checked == true) {
      setUpdateTime && window.clearInterval(setUpdateTime);
      // 1min (60000ms)
      setUpdateTime = window.setInterval(loadRepairs, 60000);
    } else {
      window.clearInterval(setUpdateTime);
    }
  });
  // Modal: Set 'date-out' when changing 'customer-out'
  document.querySelector('#modal-customer-out').addEventListener('change', function() {
    if (this.selectedIndex > 0) {
      flatpickr('#modal-date-out', cfgFlatpickr).setDate(new Date());
    } else {
      flatpickr('#modal-date-out', cfgFlatpickr).clear();
    }
  });
  // Modal: Select location (set phone)
  document.querySelector('#modal-location').addEventListener('change', () => {
    const selectEl = document.querySelector('#modal-location').selectedOptions;
    document.querySelector('#modal-phone').value = selectEl[0].getAttribute('data-phone');
  });
  // Auxiliary-modal: Open
  document.querySelectorAll('.open-auxiliary-modal').forEach((item, i) => {
    const id = item.previousElementSibling.id;
    item.addEventListener('click', () => {
      openAuxiliaryModal(id);
    });
  });
  // Modal: Select department (load locations and employees)
  document.querySelector('#modal-department').addEventListener('change', changeDepartment);
  // Modal: Select type of equipment (load equipment)
  document.querySelector('#modal-equipment-type').addEventListener('change', changeEquipmentTypeOrBrand);
  // Modal: Select brand of equipment (load equipment)
  document.querySelector('#modal-equipment-brand').addEventListener('change', changeEquipmentTypeOrBrand);
  // Auxiliary-modal: Submit modal form
  document.querySelectorAll('.modal-auxiliary-form').forEach((item, i) => {
    item.addEventListener('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.style.display !== 'none') {
        addRowToAuxiliaryTable(this.action, this.id);
      }
    });
  });


});

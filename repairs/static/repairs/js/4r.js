/* Table: details or short form */
function repairsDetails(details=true) {
  let setShort = function() {
    displayElementsByClassName('input-names', 'none');
    displayElementsByClassName('phone', 'none');
    displayElementsByClassName('inv', 'none');
    displayElementsByClassName('customer-out', 'none');
    document.getElementsByClassName('table-conteiner')[0].style.fontSize = '1rem';
  };
  let setDetails = function() {
    displayElementsByClassName('input-names', 'initial');
    displayElementsByClassName('phone', 'initial');
    displayElementsByClassName('inv', 'initial');
    displayElementsByClassName('customer-out', 'initial');
    document.getElementsByClassName('table-conteiner')[0].style.fontSize = '.625rem';
  };
  document.querySelector('#show-all-columns').addEventListener('click', function() {
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
function displayElementsByClassName(className, value) {
  let el = document.getElementsByClassName(className);
  for (let i = 0; i < el.length; i++) {
    el[i].style.display = value;
  }
}

/* Load repairs table */
function loadRepairs(page=0) {
  page = getNumberPage(page);
  let rowsPerPage = parseInt(document.querySelector('#rows-per-page').value);
  let obj = {
    number: (rowsPerPage === 0 ? null : rowsPerPage),
    currentPage: 1,
    activeRepairs: document.querySelector('#active-repairs').checked,
  };

  const table = document.querySelector('.table-conteiner');
  postData(table.dataset.fetch, obj, 'load_repairs')
    .then(data => {
      console.log(data);
      // Clear table
      const rows = document.querySelectorAll('.table-conteiner .item-conteiner');
      rows.forEach((item, i) => {
        if (i > 0) {
          item.remove();
        }
      });
      // Fill table
      let fragment = new DocumentFragment();
      data.repairs.data.forEach((item, i) => {
        let row = rows[0].cloneNode(true);
        row.querySelector('.attribute').innerText = item.id;
        row.querySelector('.attribute.date-in').innerText = item.dateIn;
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
        row.querySelector('.attribute.date-out').innerText = item.dateOut;

        row.querySelector('.attribute.date-in').title = item.dateIn;
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
        row.querySelector('.attribute.date-out').title = item.dateOut;
        fragment.appendChild(row);
      });
      table.appendChild(fragment);

      showPagination(page, data.numberRows, rowsPerPage, 5)
      document.querySelector('#db-time-update').innerText = data.time;
    })
    .catch(error => {
      infoBlock('error', error);
    });
}

/* Update repairs table */
function updateRepairs() {
  // TODO: ...
  let obj = {
    time: document.querySelector('#db-time-update').innerText,
  };

  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/repairs', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', 'update_repairs');
  xhttp.send(JSON.stringify(obj));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // Put the result in a form
      let data = JSON.parse(this.responseText);
      if (data === null) {
        alert('Error: data could not be loaded.');
      } else {
        console.log(data);

      }
    }
  }
}

/* Save repair */
function saveRepair() {
  let dateIn;
  let dateOut;
  if (document.querySelector('#modal-date-in').value == '') {
    dateIn = '';
  }
  else {
    dateIn = flatpickr.parseDate(document.querySelector('#modal-date-in').value, 'd.m.y H:i');
  }
  if (document.querySelector('#modal-date-out').value == '') {
    dateOut = '';
  }
  else {
    dateOut = flatpickr.parseDate(document.querySelector('#modal-date-out').value, 'd.m.y H:i');
  }
  let obj = {
    date_in: dateIn,
    department_id: document.querySelector('#modal-department').value,
    location_id: document.querySelector('#modal-location').value,
    equipment_id: document.querySelector('#modal-equipment-name').value,
    defect: document.querySelector('#modal-defect').value,
    inv_number: document.querySelector('#modal-inv').value,
    customer_id_in: document.querySelector('#modal-customer-in').value,
    employee_id: document.querySelector('#modal-employee').value,
    repair: document.querySelector('#modal-repair').value,
    current_state: document.querySelector('#modal-current-state').value,
    date_out: dateOut,
    customer_id_out: document.querySelector('#modal-customer-out').value,
  };
  let id = document.querySelector('#modal-id').innerText;
  // If id temporary don't send it
  if (id.search('\\*') < 0) {
    obj.id = id;
  }

  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/repairs', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', 'save');
  xhttp.send(JSON.stringify(obj));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // Put the result in a form
      let data = JSON.parse(this.responseText);
      if (data === null) {
        alert('Error: data could not be loaded.');
      } else if (data.status !== true) {
        alert(`Error: ${data.message}`);
      } else {
        modal.close('modal-current-row');
        // Reload page
        let page = document.querySelector('.pagination > a.active');
        loadRepairs(page ? page.innerText - 1 : 0);
      }
    }
  }
}

/* Open Repair */
function openRepair(el) {
  // Get id table 'repairs'
  const repairId = el.querySelector(':first-child').innerHTML;
  const obj = {
    id: repairId,
  };

  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/repairs', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', 'open');
  xhttp.send(JSON.stringify(obj));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // Put the result in a form
      const data = JSON.parse(this.responseText);
      if (data === null) {
        alert('Error: id(' + repairId + ') not found in database.');
      } else {
        // Modal show
        modal.open('modal-current-row');
        document.querySelector('#modal-id').innerHTML = data.id;

        let dateIn = flatpickr('#modal-date-in', cfgFlatpickr);
        let dateOut = flatpickr('#modal-date-out', cfgFlatpickr);
        if (data.date_in == null || data.date_in == '') {
          dateIn.clear();
        } else {
          dateIn.setDate(new Date(data.date_in));
        }
        if (data.date_out == null || data.date_out == '') {
          dateOut.clear();
        } else {
          dateOut.setDate(new Date(data.date_out));
        }
        let departments = setOptions(data.departments_data, 'departments');
        let locations = setOptions(data.locations_data, 'locations');
        let buildings = setOptions(data.buildings_data, 'buildings');
        let phone = data.locations_data.find(e => e.id === data.location_id).phone;
        let equipmentType = setOptions(data.type_of_equipment_data, 'typeOfEquipment');
        let equipmentName = setOptions(data.equipment_data, 'equipment');
        let employees = setOptions(data.employees_data, 'names');
        let customers = setOptions(data.customers_data, 'names');
        document.querySelector('#modal-department').innerHTML = '';
        document.querySelector('#modal-location').innerHTML = '';
        document.querySelector('#modal-new-location-building').innerHTML = '';
        document.querySelector('#modal-department-for-new-employee').innerHTML = '';
        document.querySelector('#modal-department-for-new-location').innerHTML = '';
        document.querySelector('#modal-equipment-type').innerHTML = '';
        document.querySelector('#modal-new-equipment-type-id').innerHTML = '';
        document.querySelector('#modal-equipment-name').innerHTML = '';
        document.querySelector('#modal-customer-in').innerHTML = '';
        document.querySelector('#modal-employee').innerHTML = '';
        document.querySelector('#modal-customer-out').innerHTML = '';
        document.querySelector('#modal-department').appendChild(departments.cloneNode(true));
        document.querySelector('#modal-location').appendChild(locations);
        document.querySelector('#modal-new-location-building').appendChild(buildings);
        document.querySelector('#modal-department-for-new-employee').appendChild(departments.cloneNode(true));
        document.querySelector('#modal-department-for-new-location').appendChild(departments);
        document.querySelector('#modal-equipment-type').appendChild(equipmentType.cloneNode(true));
        document.querySelector('#modal-new-equipment-type-id').appendChild(equipmentType);
        document.querySelector('#modal-equipment-name').appendChild(equipmentName);
        document.querySelector('#modal-customer-in').appendChild(customers.cloneNode(true));
        document.querySelector('#modal-employee').appendChild(employees);
        document.querySelector('#modal-customer-out').appendChild(customers);

        document.querySelector('#modal-department').value = data.department_id;
        document.querySelector('#modal-location').value = data.location_id;
        document.querySelector('#modal-phone').value = phone;
        document.querySelector('#modal-customer-in').value = data.customer_id_in;
        document.querySelector('#modal-equipment-type').value = data.equipment_type_id;
        document.querySelector('#modal-new-equipment-type-id').value = '';
        document.querySelector('#modal-equipment-name').value = data.equipment_id;
        document.querySelector('#modal-inv').value = data.inv_number;
        document.querySelector('#modal-employee').value = data.employee_id;
        document.querySelector('#modal-defect').value = data.defect;
        document.querySelector('#modal-repair').value = data.repair;
        document.querySelector('#modal-current-state').value = data.current_state;
        document.querySelector('#modal-customer-out').value = data.customer_id_out;
        checkDepartment();
        checkEquipmentType();
      }
    }
  };
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
  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/repairs', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', 'remove');
  xhttp.send(JSON.stringify(obj));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // Put the result in a form
      const data = JSON.parse(this.responseText);
      if (data === null) {
        alert('Error: id(' + repairId + ') not found in database.');
      } else {
        console.log(data);
        if (data.status !== true) {
          alert(data.message);
        } else {
          loadRepairs();
        }
      }
    }
  };
}
/* Open modal for add Repair*/
function addRepair() {
  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/repairs', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', 'get_new_id');
  xhttp.send(JSON.stringify(null));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // Put the result in a form
      const data = JSON.parse(this.responseText);
      if (data === null) {
        alert('Error: can\'t load database.');
      } else {
        // Modal show
        modal.open('modal-current-row');
        document.querySelector('#modal-id').innerHTML = data.id + '*';

        let dateIn = flatpickr('#modal-date-in', cfgFlatpickr);
        let dateOut = flatpickr('#modal-date-out', cfgFlatpickr);
        dateIn.setDate(new Date());
        dateOut.clear();
        let departments = setOptions(data.departments_data, 'departments');
        let equipmentType = setOptions(data.type_of_equipment_data, 'typeOfEquipment');
        let employees = setOptions(data.employees_data, 'names');
        let buildings = setOptions(data.buildings_data, 'buildings');
        document.querySelector('#modal-department').innerHTML = '';
        document.querySelector('#modal-location').innerHTML = '';
        document.querySelector('#modal-new-location-building').innerHTML = '';
        document.querySelector('#modal-department-for-new-employee').innerHTML = '';
        document.querySelector('#modal-department-for-new-location').innerHTML = '';
        document.querySelector('#modal-equipment-type').innerHTML = '';
        document.querySelector('#modal-new-equipment-type-id').innerHTML = '';
        document.querySelector('#modal-equipment-name').innerHTML = '';
        document.querySelector('#modal-customer-in').innerHTML = '';
        document.querySelector('#modal-employee').innerHTML = '';
        document.querySelector('#modal-customer-out').innerHTML = '';
        document.querySelector('#modal-department').appendChild(departments.cloneNode(true));
        document.querySelector('#modal-department-for-new-employee').appendChild(departments.cloneNode(true));
        document.querySelector('#modal-department-for-new-location').appendChild(departments);
        document.querySelector('#modal-equipment-type').appendChild(equipmentType.cloneNode(true));
        document.querySelector('#modal-new-equipment-type-id').appendChild(equipmentType);
        document.querySelector('#modal-employee').appendChild(employees);
        document.querySelector('#modal-new-location-building').appendChild(buildings);

        document.querySelector('#modal-department').value = '';
        document.querySelector('#modal-location').value = '';
        document.querySelector('#modal-phone').value = '';
        document.querySelector('#modal-customer-in').value = '';
        document.querySelector('#modal-equipment-type').value = '';
        document.querySelector('#modal-new-equipment-type-id').value = '';
        document.querySelector('#modal-inv').value = '';
        document.querySelector('#modal-employee').value = '';
        document.querySelector('#modal-defect').value = '';
        document.querySelector('#modal-repair').value = '';
        document.querySelector('#modal-current-state').value = '';
        document.querySelector('#modal-customer-out').value = '';
      }
      checkDepartment();
      checkEquipmentType();
    }
  };
}
/* Add row to auxiliary table */
function addRowToAuxiliaryTable(tableName) {
  const obj = getAuxiliaryForm(tableName);
  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/repairs', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', 'add_to_auxiliary_table');
  xhttp.send(JSON.stringify(obj));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // Put the result in a form
      let data = JSON.parse(this.responseText);
      if (data === null) {
        alert('Error: can\'t load database.');
      } else {
        setAuxiliaryForm(data, tableName);
        modal.close('modal-auxiliary');
      }
    }
  };
}
/* Set value in auxiliary form */
function setAuxiliaryForm(data, tableName) {
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
    case 'modal-equipment-name-add':
      let equipment = setOptions(data, 'equipment');
      // Update equipment
      document.querySelector('#modal-equipment-name').innerHTML = '';
      document.querySelector('#modal-equipment-name').appendChild(equipment);
      break;
    case 'modal-equipment-type-add':
      let typeOfEquipment = setOptions(data, 'typeOfEquipment');
      // Update equipment
      document.querySelector('#modal-equipment-type').innerHTML = '';
      document.querySelector('#modal-equipment-type').appendChild(typeOfEquipment);
      break;
  }
}
/* load 'locations' and 'employees' */
function changeDepartment(val) {
  const obj = {department_id: val};
  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/repairs', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', 'change_department');
  xhttp.send(JSON.stringify(obj));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // Put the result in a form
      let data = JSON.parse(this.responseText);
      if (data === null) {
        alert('Error: can\'t load database.');
      } else {
        let locations = setOptions(data['locations_data'], 'locations');
        // Update departments
        // Update locations
        document.querySelector('#modal-location').innerHTML = '';
        document.querySelector('#modal-location').appendChild(locations);
        let employees = setOptions(data['customers_data'], 'names');
        // Update customers(in)
        document.querySelector('#modal-customer-in').innerHTML = '';
        document.querySelector('#modal-customer-in').appendChild(employees.cloneNode(true));
        // Update customers(out)
        document.querySelector('#modal-customer-out').innerHTML = '';
        document.querySelector('#modal-customer-out').appendChild(employees);
        checkDepartment();
      }
    }
  };
}
/* load 'equipment' */
function changeEquipmentType(val) {
  const obj = {type_id: val};
  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/repairs', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', 'change_equipment_type');
  xhttp.send(JSON.stringify(obj));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      // Put the result in a form
      let data = JSON.parse(this.responseText);
      if (data === null) {
        alert('Error: can\'t load database.');
      } else {
        let equipment = setOptions(data['equipment_data'], 'equipment');
        // Update equipment
        document.querySelector('#modal-equipment-name').innerHTML = '';
        document.querySelector('#modal-equipment-name').appendChild(equipment);
        checkEquipmentType();
      }
    }
  };
}
/* Lock or unlock location and employee */
function checkDepartment() {
  let dep = document.querySelector('#modal-department').selectedIndex;
  if (dep !== 0) {
    document.querySelector('#modal-location').disabled = false;
    document.querySelector('#modal-customer-in').disabled = false;
    document.querySelector('#modal-customer-out').disabled = false;
  }
  else {
    document.querySelector('#modal-location').disabled = true;
    document.querySelector('#modal-customer-in').disabled = true;
    document.querySelector('#modal-customer-out').disabled = true;
  }
}
/* Lock or unlock equipment */
function checkEquipmentType() {
  let et = document.querySelector('#modal-equipment-type').selectedIndex;
  if (et !== 0) {
    document.querySelector('#modal-equipment-name').disabled = false;
  }
  else {
    document.querySelector('#modal-equipment-name').disabled = true;
  }
}
/* Set 'options' tags for <select> element*/
function setOptions(array, type) {
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
      case 'departments':
        content = `${x.name}`;
        break;
      case 'locations':
        content = `${x.office}; ${x.building_id}`;
        break;
      case 'buildings':
        content = `${x.name}`;
        break;
      case 'names':
        content = `${x.l_name} ${x.f_name} ${x.patronymic}`;
        break;
      case 'equipment':
        content = `${x.brand} ${x.model}`;
        break;
      case 'typeOfEquipment':
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

docReady(function() {
  // DOM is loaded and ready for manipulation here

  // Table: Details or short form (default short)
  repairsDetails(false);

  // Load repairs
  loadRepairs();

  // Flatpickr: Clear date
  document.querySelectorAll('.btn-x').forEach((item, i) => {
    let id = '#' + item.previousElementSibling.id;
    item.addEventListener('click', () => {
      flatpickr(id, cfgFlatpickr).clear();
    });
  });

  // Table: Show the current row in table
  document.getElementsByClassName('table-conteiner')[0].addEventListener('click', (e) => {
    e.target.querySelectorAll('li.item-conteiner').forEach((item, i) => {
      if (item.classList.contains('table-active-row')) {
        item.classList.remove('table-active-row');
      }
    });
    let row = e.target.closest('li.item-conteiner:not(:first-child)');
    row && row.classList.add('table-active-row');
  });
  // Open modal: Edit element (double click on a row)
  document.getElementsByClassName('table-conteiner')[0].addEventListener('dblclick', (e) => {
    let row = e.target.closest('li.item-conteiner:not(:first-child)');
    row && openRepair(row);
  });
  // Open modal: Edit element (button on the top bar)
  document.querySelector('#edit-row').addEventListener('click', () => {
    let row = document.getElementsByClassName('table-conteiner')[0].querySelector('.table-active-row');
    if (row) {
      openRepair(row);
    } else {
      alert('Нет выделенных строк.');
    }
  });
  // Table: Remove element (button on the top bar)
  document.querySelector('#remove-row').addEventListener('click', () => {
    let row = document.getElementsByClassName('table-conteiner')[0].querySelector('.table-active-row');
    if (row) {
      removeRepair(row);
    } else {
      alert('Нет выделенных строк.');
    }
  });
  // Open modal: Add element (button on the top bar)
  document.querySelector('#add-row').addEventListener('click', () => {
    addRepair();
  });
  // Modal: Submit modal form
  document.querySelector('#modal-form').addEventListener('submit', function(event) {
    event.preventDefault();
    event.stopPropagation();
    saveRepair();
  });
  // Table: Show only active repairs
  document.querySelector('#active-repairs').addEventListener('click', () => {
    loadRepairs();
  });
  // Table: Change the number of lines per page and reload repairs
  document.querySelector('#rows-per-page').addEventListener('change', () => {
    loadRepairs();
  });
  // Table: Pagigation buttons
  document.querySelector('.pagination').addEventListener('click', (e) => {
    event.preventDefault();
    event.stopPropagation();
    let n = e.target.closest('a');
    n && loadRepairs(n.innerText);
  });
  // Table: Auto update
  var setUpdateTime;
  document.querySelector('#update-repairs').addEventListener('click', function() {
    if (this.checked == true) {
      setUpdateTime && window.clearInterval(setUpdateTime);
      // 1min (60000ms)
      setUpdateTime = window.setInterval(loadRepairs, 60000);
    } else {
      window.clearInterval(setUpdateTime);
    }
  });
  // Modal: Set 'date-out' when changing 'customer-out'
  document.querySelector('#modal-customer-out').addEventListener('change', () => {
    flatpickr('#modal-date-out', cfgFlatpickr).setDate(new Date());
  });
  // Modal: Select location (set phone)
  document.querySelector('#modal-location').addEventListener('change', () => {
    let selectEl = document.querySelector('#modal-location').selectedOptions;
    document.querySelector('#modal-phone').value = selectEl[0].getAttribute('data-phone');
  });
  // Auxiliary-modal: Open
  document.querySelectorAll('.open-auxiliary-modal').forEach((item, i) => {
    let id = item.previousElementSibling.id;
    item.addEventListener('click', () => {
      openAuxiliaryModal(id);
    });
  });
  // Modal: Select department (load locations and employees)
  document.querySelector('#modal-department').addEventListener('change', function() {
    changeDepartment(this.value);
  });
  // Modal: Select type of equipment (load equipment)
  document.querySelector('#modal-equipment-type').addEventListener('change', function() {
    changeEquipmentType(this.value);
  });
  // Auxiliary-modal: Submit modal form
  document.querySelectorAll('.modal-auxiliary-form').forEach((item, i) => {
    item.addEventListener('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.style.display !== 'none') {
        addRowToAuxiliaryTable(this.id);
      }
    });
  });


});

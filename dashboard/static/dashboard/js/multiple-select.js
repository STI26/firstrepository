(() => {
  'use strict';

  document.multipleSelect = (elementID) => {
    const multipleSelectInput = document.querySelector(`#${elementID}`);
    const multipleSelectMenu = document.querySelector(`[data-multiple-select-menu=${elementID}]`);

    const template = '<li><input type="checkbox" class="check-btn"><label></label></li>';

    this.init = () => {
      multipleSelectInput.addEventListener('keydown', (event) => {
        event.preventDefault();
      });
      multipleSelectInput.addEventListener('click', (event) => {
        event.stopPropagation();
        if (multipleSelectMenu.style.display === 'none') {
          multipleSelectMenu.style.display = 'block';
        } else {
          multipleSelectMenu.style.display = 'none';
        }
      });
    };

    this.getSelection = (toString=false, menu=null) => {
      if (!menu) {
        menu = multipleSelectMenu;
      }
      let itemIDs = [];
      let itemNames = [];
      menu.querySelectorAll('input:checked').forEach((item) => {
        itemIDs.push(item.value);
        itemNames.push(item.nextSibling.innerHTML);
      });
      if (toString) {
        return itemNames.join('; ');
      }
      return [itemIDs, itemNames];
    };

    this.update = (data, radioMode=false, btnFunc=false) => {
      multipleSelectMenu.innerHTML = '';
      const fr = new DocumentFragment();
      const parser = new DOMParser();
      const ul = document.createElement('ul');
      ul.classList.add('multiple-select');

      data.forEach((item) => {
        item = Object.values(item);
        // length 2: item[0] - dataset.id; item[1] - innerHTML
        // length 3: item[0] - dataset.id; item[1] - title; item[2] - innerHTML
        const id = `${elementID}-${item[0]}`;
        const btn = parser.parseFromString(template, 'text/html');

        btn.querySelector('input').id = id;
        btn.querySelector('input').value = item[0];
        btn.querySelector('input').addEventListener('click', (event) => {
          event.stopPropagation();
          if (btnFunc) {
            btnFunc();
          } else {
            multipleSelectInput.value = getSelection(true, multipleSelectMenu);
          }
        });

        if (radioMode) {
          btn.querySelector('label').addEventListener('click', (event) => {
            event.stopPropagation();
            multipleSelectMenu.querySelectorAll('input:checked').forEach((item) => {
              item.checked = false;
            });
          });
        }

        btn.querySelector('label').htmlFor = id;
        if (item[2]) {
          btn.querySelector('label').innerHTML = item[2];
          btn.querySelector('label').title = item[1];
        } else {
          btn.querySelector('label').innerHTML = item[1];
        }

        fr.appendChild(btn.querySelector('li'));
      });
      ul.appendChild(fr);
      multipleSelectMenu.appendChild(ul);
    };

    return this;
  };
})();

/* Login: Open contexts modal menu */
function openContextsMenu() {
  document.getElementsByClassName('modal-contexts-menu')[0].classList.add('open-modal');
  // Set tree contexts view.
  $.fn.zTree.init($("#treeContexts"), setting);
}
/* Login - contexts: Apply context */
function applyContext() {
  document.getElementsByClassName('modal-contexts-menu')[0].classList.remove('open-modal');
  // TODO: rework without jQuery...
  const treeObj = $.fn.zTree.getZTreeObj('treeContexts');
  const sNodes = treeObj.getSelectedNodes();
  if (sNodes.length > 0) {
    let node = sNodes[0].getPath();
    node.reverse();
    let context = [];
    for (let x of node) {
      context.push(x['name']);
    }
    $('#userContext').val(context.join('.'));
  }
}
/* Authentication */
function authentication(form, typeAuth) {
  const obj = {
    username: form.querySelector('input[name="username"]').value,
    password: form.querySelector('input[name="password"]').value,
    context: document.querySelector('#userContext').value,
  };
  // Send the data using post
  const xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/login', true);
  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhttp.setRequestHeader('operation', typeAuth);
  xhttp.send(JSON.stringify(obj));
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const data = JSON.parse(this.responseText);
      if (data.result === true) {
        window.location.href = '/';
      } else {
        alert(data.message);
      }
    }
  };
}

docReady(function() {
  // DOM is loaded and ready for manipulation here

  // Login: Show a simple login form
  document.querySelector('#display-simple-form').addEventListener('click', function() {
    document.getElementsByClassName('login-form-inner')[0].classList.remove('rotate180');
  });
  // Login: Show a OES login form
  document.querySelector('#display-oes-form').addEventListener('click', function() {
    document.getElementsByClassName('login-form-inner')[0].classList.add('rotate180');
  });

  // Login: Open contexts menu
  document.querySelector('#menu-contexts').addEventListener('click', openContextsMenu);

  // Login - contexts: Close contexts menu
  document.querySelector('#close-modal-contexts').addEventListener('click', function() {
    document.getElementsByClassName('modal-contexts-menu')[0].classList.remove('open-modal');
  });

  // Login - contexts: Select contexts menu
  document.querySelector('#apply-modal-contexts').addEventListener('click', applyContext);

  // Forms: Submit
  let forms = document.getElementsByClassName('main-form');
  for (let i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function(event) {
      if (this.getAttribute('action') == '/login') {
        event.preventDefault();
        event.stopPropagation();
        authentication(this, this.getAttribute('data-auth'));
      }
    });
  }
});

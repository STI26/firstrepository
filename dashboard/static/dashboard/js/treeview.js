const treeView = (elementID=undefined) => {
  const treeSelector = '.treeView';
  const trees = document.querySelectorAll(treeSelector);
  let currentTree;
  const checkTree = () => {
    try {
      currentTree = document.querySelector(`${treeSelector}#${elementID}`);
    } catch(e) {
      throw `Can't found element with ID '${elementID}'`;
    }
  }
  // Add event for 't-item'
  const helperInit = (el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const li = e.target.closest('.t-item');
      const liEmpty = e.target.closest('.t-item-empty');
      const span = e.target.closest('.t-item span');
      if (span) {
        el.querySelectorAll('.t-item span').forEach((item) => {
          if (item.classList.contains('t-item--selected')) {
            item.classList.remove('t-item--selected');
          }
        });
        span.classList.add('t-item--selected');
      } else if (li && !liEmpty) {
        li.classList.toggle('t-item--show');
      }
    });
  }
  // Initialize trees
  this.init = () => {
    trees.forEach((item) => {
      helperInit(item);
    });
  }
  // Get current node
  this.getSelectedNode = () => {
    checkTree();
    let selectedNode;
    const selectClass = document.querySelector('.t-item--selected');
    if (currentTree.contains(selectClass)) {
      selectedNode = document.querySelector(`${treeSelector}#${elementID} .t-item--selected`);
    }
    return selectedNode;
  }
  // Get the path of the current node
  this.getPath = () => {
    let path = [];
    let selectedNode = this.getSelectedNode();
    if (typeof selectedNode !== 'object') {
      return;
    }
    const level = selectedNode.dataset.level;
    for (let i = 0; i <= level; i++) {
      path.push(selectedNode.innerHTML);
      selectedNode = selectedNode.parentNode.parentNode.parentNode.firstChild;
    }
    return path;
  }
  const helperRender = (node, el, level=0) => {
    node.forEach((item, i) => {
      let span = document.createElement('span');
      span.innerHTML = item.name;
      span.dataset.level = level;
      if (typeof item.description[0] === 'string') {
        span.title = item.description[0].trim();
      }
      let li = document.createElement('li');
      li.appendChild(span);
      if (item.children.length === 0) {
        li.classList.add('t-item-empty');
      } else {
        li.classList.add('t-item');
        let ul = document.createElement('ul');
        ul.classList.add('t-node');
        helperRender(item.children, ul, level + 1);
        li.appendChild(ul);
      }
      el.appendChild(li);
    });
    return el;
  }
  // Render tree
  this.render = (data) => {
    this.clear();
    let fragment = new DocumentFragment();
    currentTree.appendChild(helperRender(data, fragment));
  }
  // Clear tree
  this.clear = () => {
    checkTree();
    currentTree.innerHTML = '';
  }
  return this;
}

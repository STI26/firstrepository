function get_browser() {
  var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE', version: (tem[1] || '') };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/)
    if (tem != null) { return { name: 'Opera', version: tem[1] }; }
  }
  if (window.navigator.userAgent.indexOf('Edge') > -1) {
    tem = ua.match(/\Edge\/(\d+)/)
    if (tem != null) { return { name: 'Edge', version: tem[1] }; }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
  return {
    name: M[0],
    version: +M[1]
  };
}
function isSupported(browser) {
  var supported = false;
  // Browser Support for ES6 (ECMAScript 2015)
  if (browser.name === 'Chrome' && browser.version >= 58) {
    supported = true;
  } else if (browser.name === 'Firefox' && browser.version >= 54) {
    supported = true;
  } else if (browser.name === 'Edge') {
    supported = true;
  }
  return supported;
}

var browser = get_browser()
var isSupported = isSupported(browser);

if (!isSupported) {
<<<<<<< HEAD
  window.location = '/browsernotsupported';
=======
  window.location = location.hostname + "/browsernotsupported";
>>>>>>> refs/remotes/origin/develop
}

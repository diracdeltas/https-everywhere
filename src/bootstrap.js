/*
 * Author: yan@eff.org
 * Modified from Adblock Plus
 * License: GPL3
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

var addonData = null;

function startup(params, reason) {
  addonData = params;
  Services.obs.addObserver(requireObserver, "httpse-require", true);
  onShutdown.add(function() Services.obs.removeObserver(requireObserver, "httpse-require"));
  require("httpse");
}

function shutdown(params, reason) {
  var windowNames = [];
  for (var i = 0; i < windowNames.length; i++) {
    let enumerator = Services.wm.getEnumerator(windowNames[i]);
    while (enumerator.hasMoreElements()) {
      let window = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
      window.setTimeout("window.close()", 0);
      window.close();
    }
  }
  onShutdown.done = true;
  for (var i = shutdownHandlers.length - 1; i >= 0; i--){
    shutdownHandlers[i]();
  }
  shutdownHandlers = null;
  for (var key in require.scopes) {
    let scope = require.scopes[key];
    let list = Object.keys(scope);
    for (var i = 0; i < list.length; i++) {
      scope[list[i]] = null;
    }
  }
  require.scopes = null;
  addonData = null;
}

function install(params, reason) {}

function uninstall(params, reason) {}

var shutdownHandlers = [];

var onShutdown = {
  done: false,
  add: function(handler) {
    if (shutdownHandlers.indexOf(handler) < 0) {
      shutdownHandlers.push(handler);
    }
  },
  remove: function(handler) {
    let index = shutdownHandlers.indexOf(handler);
    if (index >= 0) {
      shutdownHandlers.splice(index, 1);
    }
  }
};

function require(module) {
  var scopes = require.scopes;
  if (!(module in scopes)) {
    var url = addonData.resourceURI.spec+"lib/"+module+".js";
  }
  scopes[module] = {
    Cc: Cc,
    Ci: Ci,
    Cr: Cr,
    Cu: Cu,
    require: require,
    onShutdown: onShutdown,
    exports: {}
  };
  Services.scriptloader.loadSubScript(url, scopes[module]);
  return scopes[module].exports;
}

require.scopes = {
  __proto__: null
};

var requireObserver = {
  observe: function(subject, topic, data) {
    if (topic === "httpse-require") {
      subject.wrappedJSObject.exports = require(data);
    }
  },
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference,
                      Ci.nsIObserver])
};

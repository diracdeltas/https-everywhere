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
  Services.obs.addObserver(RequireObserver, "httpse-require", true);
  onShutdown.add(function() Services.obs.removeObserver(RequireObserver, "httpse-require"));
  require("httpse");
}

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

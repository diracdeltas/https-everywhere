/* vim: set expandtab tabstop=2 shiftwidth=2 softtabstop=2 foldmethod=marker: */

/**
 * HTTPS Everywhere Firefox Extension: https://www.eff.org/https-everywhere/
 *
 * Licensed under the GPL v3+.
 * 
 * @copyright Copyright (C) 2010-2013 Mike Perry <mikeperry@fscked.org> 
 *                                    Peter Eckersley <pde@eff.org>
 *                                    and many others.
 */

// Define https everywhere variable object that will act as a namespace, so that 
// global namespace pollution is avoided, although technically not required for
// windows created by add-on.
// See: https://developer.mozilla.org/en-US/docs/Security_best_practices_in_extensions#Code_wrapping
VERB=1;
DBUG=2;
INFO=3;
NOTE=4;
WARN=5;

const CC = Components.classes;
const CI = Components.interfaces;

var HTTPSEverywhere = CC["@eff.org/https-everywhere;1"]
                      .getService(Components.interfaces.nsISupports)
                      .wrappedJSObject;

if (!httpsEverywhere) { var httpsEverywhere = {}; }
/**
 * JS Object for reporting disabled rulesets.
 *
 * @author Yan Zhu <yan@mit.edu>
 */

httpsEverywhere.reportRule = {
 
  TIMEOUT: 60000,
  prefs: HTTPSEverywhere.get_prefs(),

  init: function() {
    var rr = httpsEverywhere.reportRule;
    // get arguments for submitReport from window if necessary
    if("arguments" in window && window.arguments.length > 0) {
      var rulename = window.arguments[0].xmlName;
      var id = window.arguments[0].GITCommitID; //GIT commit ID
      var comment = document.getElementById("comment").value;
    } else {
      // Should never happen
      throw 'Invalid window arguments.';
    }
    rr.submitReport(rulename,id,comment);
  },

  getOSBrowser: function(p) {
    // https://developer.mozilla.org/en-US/docs/Code_snippets/Miscellaneous#System_info
    try {
      var osString = CC["@mozilla.org/xre/app-info;1"].getService(CI.nsIXULRuntime).OS;
    } catch (ex) {
    // needed for Seamonkey 2.0
      var osString = CC["@mozilla.org/network/protocol;1?name=http"]
                         .getService(CI.nsIHttpProtocolHandler).oscpu;
    }
    p.push("os="+osString);
    var appInfo = CC["@mozilla.org/xre/app-info;1"].getService(CI.nsIXULAppInfo);
    p.push("app_name="+appInfo.name); // ex: firefox
    p.push("app_version="+appInfo.version); // ex: 2.0.0.1
  },

  getDomain: function(p) {},

  getFullUrl: function(p) {},

  getExtensions: function(p) {},

  getSysInfoSync: function(p) {
    var rr = httpsEverywhere.reportRule;
    var hlog = HTTPSEverywhere.log;
    var pref = rr.prefs;
    if (pref.getBoolPref("report_os_and_browser")) {
      try {
        rr.getOSBrowser(p);
      } catch (ex) {
        p.push("os=");
        p.push("app_name=");
        p.push("app_version=");
        hlog(WARN, 'Failed to get OS and Browser for report due to: '+ex);
      }
    }
    if (pref.getBoolPref("report_domain")) {
      try {
        rr.getDomain(p);
      } catch (ex) {
        p.push("domain=");
        hlog(WARN, 'Failed to get domain for report due to: '+ex);
      }
    }
    if (pref.getBoolPref("report_full_url")) {
      try {
        rr.getFullUrl(p);
      } catch (ex) {
        p.push("url=");
        hlog(WARN, 'Failed to get full URL for report due to: '+ex);
      }
    }
    if (pref.getBoolPref("report_extensions")) {
      try {
        rr.getExtensions(p);
      } catch (ex) {
        p.push("extensions=");
        hlog(WARN, 'Failed to get extensions for report due to: '+ex);
      }
    }
  },

  getSysInfoAsync: function(p) {
    // Get the HTTPS Everywhere version. 
    // Note that getAddonByID is asynchronous.
    // Since we need to wait for it to return before the POST request can be submitted,
    // we give it finishRequest as a callback.
    var rr = httpsEverywhere.reportRule;
    try {
      // Firefox 4 and later; Mozilla 2 and later
      Components.utils.import("resource://gre/modules/AddonManager.jsm");
      AddonManager.getAddonByID("https-everywhere@eff.org", function(addon) {
        p.push("ext_version="+addon.version);
        rr.finishRequest(p);
      });
    } catch (ex) {
      try {
        HTTPSEverywhere.log(WARN, ex);
        // Firefox 3.6 and before; Mozilla 1.9.2 and before
        var em = CC["@mozilla.org/extensions/manager;1"].getService(CI.nsIExtensionManager);
        var addon = em.getItemForID("https-everywhere@eff.org");
        p.push("ext_version="+addon.version);
      } catch (ex2) {
        HTTPSEverywhere.log(WARN, 'Failed to get https-version info due to: '+ex2);
      } finally {
        rr.finishRequest(p);
      }
    }
  },
  
  finishRequest: function(p) {
    var rr = httpsEverywhere.reportRule;
    var params = p.join("&");
    var req = rr.buildRequest(params);
    HTTPSEverywhere.log(INFO, "submitting bug report with POST params: "+params);
    req.timeout = rr.TIMEOUT;
    req.onreadystatechange = function(params) {
      if (req.readyState == 4) {
        // HTTP Request was successful
        if (req.status == 200) {
          HTTPSEverywhere.log(INFO, "Submission successful");
        } else {
          HTTPSEverywhere.log(DBUG, "HTTP request status: "+req.status);
          // at least we tried...
          rr.submitFailed();
        }
      }
    };
    req.send(params); 
  },

  submitReport: function(rulename, commit_id, comment) {
    var rr = httpsEverywhere.reportRule;
    var reqParams = [];
    reqParams.push("rulename="+rulename);
    reqParams.push("commit_id="+commit_id);
    reqParams.push("comment="+comment);
    try {
      rr.getSysInfoSync(reqParams); 
    } catch(e) {
      HTTPSEverywhere.log(WARN, 'Error getting system info: '+e);
    } finally {
      rr.getSysInfoAsync(reqParams);
    }
  },

  buildRequest: function(params) {
    var rr = httpsEverywhere.reportRule;
    var req = CC["@mozilla.org/xmlextras/xmlhttprequest;1"]
                 .createInstance(CI.nsIXMLHttpRequest);
    var submit_host = rr.prefs.getCharPref("report_host");
    var submit_url = "https://"+submit_host+"/submit_report/submit.py";
    HTTPSEverywhere.log(DBUG, "report submission URL: "+submit_url);
    req.open("POST", submit_url, true);
    //send proper header info
    req.setRequestHeader("X-Privacy-Info", "EFF Privacy Policy: https://www.eff.org/policy");
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", params.length);
    req.setRequestHeader("Connection", "close");
    // clear headers for privacy
    req.setRequestHeader("User-Agent", "");
    req.setRequestHeader("Accept", "");
    req.setRequestHeader("Accept-Encoding", "");
    req.setRequestHeader("Accept-Charset", "");
    return req;
  },

  /**
   * Handle a submit ruleset failure.
   */
  submitFailed: function() {
    HTTPSEverywhere.log(INFO, "submit failed");
  },

  setFilenameText: function() {
    var rulename = window.arguments[0].xmlName;
    var dialog_header = document.getElementById("dialog-header");
    dialog_header.setAttribute("title", dialog_header.getAttribute("title")+rulename);
  },

  setCheckbox: function(setting, elem) {
    // check boxes according to current settings
    var pref = httpsEverywhere.reportRule.prefs;
    var current = pref.getBoolPref(setting);
    var box = document.getElementById(elem);
    box.checked = current;
  },

  showElem: function(elem) {
    document.getElementById(elem).setAttribute("hidden", "false");
  },

  toggleReportSetting: function(setting) {
    var pref = httpsEverywhere.reportRule.prefs;
    var current = pref.getBoolPref(setting);
    pref.setBoolPref(setting, !current);
  }
};
     

// set the title of the dialog window and the checkbox states
window.addEventListener("load", function() {
  var rr = httpsEverywhere.reportRule;
  rr.setCheckbox("report_disabled_rules_tor_only", "tor-box");
  rr.setCheckbox("report_os_and_browser", "send-os-and-browser-box");
  rr.setCheckbox("report_full_url", "send-url-box");
  rr.setCheckbox("report_domain", "send-domain-box");
  rr.setCheckbox("report_extensions", "send-extensions-box");
  reportComments.setRadio();
  rr.setFilenameText();
}, false);

var reportComments = {

  setRadio: function() {
    var pref = httpsEverywhere.reportRule.prefs;
    var radiogroup = document.getElementById("report-radio-group");
    radiogroup.selectedItem.setAttribute("selected", "false");
    if (pref.getBoolPref("report_comments") && pref.getBoolPref("report_disabled_rules")) {
      document.getElementById("ask-comments").setAttribute("selected", true);
    } else if (pref.getBoolPref("report_disabled_rules")) {
      document.getElementById("dont-ask-comments").setAttribute("selected", true);
    } else {
      // Person has disabled bug reporting but is seeing this dialog.
      // Probably means they are seeing the popup for the first time
      // and clicked on the "Details" button. Set to ask-comments for now.
      document.getElementById("ask-comments").setAttribute("selected", true);
      reportComments.onCommentsCheck();
    }
  },

  onEnableCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.prefs.setBoolPref("report_comments", false);
    rr.prefs.setBoolPref("report_disabled_rules", true);
  },

  onDisableCheck: function() {
    httpsEverywhere.reportRule.prefs.setBoolPref("report_disabled_rules", false);
  },

  onTorCheck: function() {
    reportComments.toggle("report_disabled_rules_tor_only");
  },

  onCommentsCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.prefs.setBoolPref("report_disabled_rules", true);
    rr.prefs.setBoolPref("report_comments", true);
  },

  toggle: function(setting) {
    httpsEverywhere.reportRule.toggleReportSetting(setting);
  },

  closeOuter: function() {
    var outer = Components.classes["@eff.org/https-everywhere;1"]
      .getService(Components.interfaces.nsISupports)
      .wrappedJSObject.get_outer(window);
    if (outer) {
      outer.close();
    }
  }
};

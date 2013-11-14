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
    var elem;
    var radiogroup = document.getElementById("report-radio-group");
    radiogroup.selectedItem.setAttribute("selected", "false");
    if (pref.getBoolPref("report_comments") && pref.getBoolPref("report_disabled_rules")) {
      elem = "ask-comments";
    } else if (pref.getBoolPref("report_disabled_rules")) {
      elem = "dont-ask-comments";
    } else {
      elem = "dont-ask";
    }
    document.getElementById(elem).setAttribute("selected", true);
  },
 
  onEnableCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.prefs.setBoolPref("report_comments", false);
    rr.prefs.setBoolPref("report_disabled_rules", true);
  },

  onDisableCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.prefs.setBoolPref("report_disabled_rules", false);
  },

  onTorCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.prefs.setBoolPref("report_disabled_rules", true);
    rr.prefs.setBoolPref("report_disabled_rules_tor_only", true);
  },

  onCommentsCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.prefs.setBoolPref("report_disabled_rules", true);
    rr.prefs.setBoolPref("report_comments", true);
  },

  toggle: function(setting) {
    httpsEverywhere.reportRule.toggleReportSetting(setting);
  }
};

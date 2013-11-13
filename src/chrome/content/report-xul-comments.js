// set the title of the dialog window and the checkbox states
window.addEventListener("load", function() {
  var rr = httpsEverywhere.reportRule;
  rr.setCheckbox("report_os_and_browser", "send-os-and-browser-box");
  rr.setCheckbox("report_full_url", "send-url-box");
  rr.setCheckbox("report_domain", "send-domain-box");
  rr.setCheckbox("report_extensions", "send-extensions-box");
  reportComments.setRadioForTor();
  rr.setFilenameText();
}, false);


var reportComments = {

  setRadioForTor: function() {
    var pref = httpsEverywhere.reportRule.prefs;
    var elem;
    var radiogroup = document.getElementById("report-radio-group");
    radiogroup.selectedItem.setAttribute("selected", "false");
    if (pref.getBoolPref("report_disabled_rules_tor_only")){
      elem = 'tor-ask';
      document.getElementById(elem).setAttribute("selected", true);
    }
  },

  onDisableCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.showElem("helper-text");
    rr.prefs.setBoolPref("report_disabled_rules", false);
  },

  onTorCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.showElem("helper-text");
    rr.prefs.setBoolPref("report_disabled_rules", true);
    rr.prefs.setBoolPref("report_disabled_rules_tor_only", true);
  },

  onCommentsCheck: function() {
    var rr = httpsEverywhere.reportRule;
    rr.showElem("helper-text");
    rr.prefs.setBoolPref("report_comments", false);
  },

  toggle: function(setting) {
    httpsEverywhere.reportRule.toggleReportSetting(setting);
  }
}

var HTTPSEverywhere = CC["@eff.org/https-everywhere;1"]
                      .getService(Components.interfaces.nsISupports)
                      .wrappedJSObject;
var windowData = window.arguments[0];

var rr = httpsEverywhere.reportRule;

function reportPopupYes() {
  var prefs = HTTPSEverywhere.get_prefs();
  prefs.setBoolPref("report_disabled_rules", true);
  prefs.setBoolPref("report_comments", false);
  var tor_report = prefs.getBoolPref("report_disabled_rules_tor_only");
  if (!tor_report || windowData.torbutton_avail) {
    rr.autoreport(windowData);
  }
  return true;
}

function reportPopupDetails() {
  HTTPSEverywhere.dialog_opener("chrome://https-everywhere/content/report-comments.xul",
      windowData.xmlName, "chrome,centerscreen", windowData);
}

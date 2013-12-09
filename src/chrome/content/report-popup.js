var HTTPSEverywhere = CC["@eff.org/https-everywhere;1"]
                      .getService(Components.interfaces.nsISupports)
                      .wrappedJSObject;
var windowData = window.arguments[0];

var rr = httpsEverywhere.reportRule;

function reportPopupYes() {
  var prefs = HTTPSEverywhere.get_prefs();
  prefs.setBoolPref("report_disabled_rules", true);
  prefs.setBoolPref("report_comments", false);
  if (!tor_report || torbutton_avail) {
    rr.autoreport(windowData);
  }
}

function reportPopupDetails() {
  HTTPSEverywhere.dialog_opener("chrome://https-everywhere/content/report-comments.xul",
      windowData.xmlName, "chrome,centerscreen", windowData);
}

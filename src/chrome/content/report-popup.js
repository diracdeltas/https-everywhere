const CC = Components.classes;
var HTTPSEverywhere = CC["@eff.org/https-everywhere;1"]
                      .getService(Components.interfaces.nsISupports)
                      .wrappedJSObject;

function reportPopupYes() {
  var prefs = HTTPSEverywhere.get_prefs();
  prefs.setBoolPref("report_disabled_rules", true);
  prefs.setBoolPref("report_comments", false);
}

function reportPopupDetails() {
  window.open("chrome://https-everywhere/content/report-comments.xul");
}

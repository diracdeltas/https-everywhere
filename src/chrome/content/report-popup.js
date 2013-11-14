const CC = Components.classes;
var HTTPSEverywhere = CC["@eff.org/https-everywhere;1"]
                      .getService(Components.interfaces.nsISupports)
                      .wrappedJSObject;

function reportPopupYes() {
  var prefs = HTTPSEverywhere.get_prefs();
  prefs.setBoolPref("report_disabled_rules", true);
}

function reportPopupDetails() {
  alert('todo: open bug reporting preferences');
}

// set the title of the dialog window and the checkbox states
window.addEventListener("load", function() {
  var rr = httpsEverywhere.reportRule;
  rr.setCheckbox("report_os_and_browser", "send-os-and-browser-box");
  rr.set_radio();
  rr.setFilenameText();
}, false);


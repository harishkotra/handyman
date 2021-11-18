/* global app,client, utils */
var timeout;
/**
 * App lifecycle method to initialize the app and to obtain the `client` object
 * More details on Dynamic Installation parameters can be found at the link below ⬇️
 * https://developers.freshdesk.com/v2/docs/installation-parameters/#dynamic_install_page
 */
app.initialized().then(
  function (_client) {
    window.client = _client;
  },
  function (error) {
    //If unsuccessful
    console.error(error);
  }
);

/**
 * When the enableBookmarksTimeOut is set to "Yes", also enable the field where the time in number of days can be set.
 *
 */
function enableBookmarksTimeoutChanged() {
  //get the selected value of the field in the installation page
  const cm = utils.get("enableBookmarksTimeout");
  if(cm == "Yes"){
    utils.set('bookmarksTimeout', {visible: true, required: true});
  } else {
    utils.set('bookmarksTimeout', {visible: false, required: false});
  }
}
(function () {

  console.log("abc");
})();
var a = 1;
console.log("a");
chrome.browserAction.onClicked.addListener(function() {
  console.log("browser_action");

});

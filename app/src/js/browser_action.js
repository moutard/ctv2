chrome.browserAction.onClicked.addListener(function() {
  console.log("browser_action");
  chrome.tabs.create({
                  'url': 'woody.html',
                  'index': 1,
                });
});

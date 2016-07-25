(function () {
  chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({
                    'url': 'woody.html',
                    'index': 1,
                  });
  });
  console.log("browser_action");
})();

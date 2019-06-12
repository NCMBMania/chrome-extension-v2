chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request)
  if (request.contentScriptQuery == "dataStoreAccess") {
    fetch(request.url, request.options)
      .then(response => response.json())
      .then(response => sendResponse(response.results))
  }
  return true;
});
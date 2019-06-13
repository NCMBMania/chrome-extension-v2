function getCookie(name){
    var r = null;
    var c = name + '=';
    var allcookies = document.cookie;
    var position = allcookies.indexOf( c );
    if( position != -1 ){
        var startIndex = position + c.length;
        var endIndex = allcookies.indexOf( ';', startIndex );
        if( endIndex == -1 ){
            endIndex = allcookies.length;
        }
        r = decodeURIComponent(allcookies.substring( startIndex, endIndex ) );
    }
    return r;
}

const session = JSON.parse(getCookie("session")).sessionToken;

const main = () => {
  const jsInitCheckTimer = setInterval(jsLoaded, 1000);
  function jsLoaded() {
    if (document.querySelector('.left-item') == null) {
      return true;
    }
    clearInterval(jsInitCheckTimer);
    setInterval(() => {
      if ($($('a.stay')[0]).text().trim() === 'データストア') {
        if ($('.download').length === 0) {
          $('.left-item').append('<li class="item download"><button class="btn">↓ダウンロード</button></li>');
          $('.left-item').append('<li class="item clear"><button class="btn">×値を消す</button></li>');
          $('.download').on('click', function(e) {
            e.preventDefault();
            download();
          });
          // datastore-cols ng-scope 
          $(document).on('keyup', '.datastore-cols-hilight', e => {
            console.log(e);
          })
        }
      }
    }, 2000)
  }
}

const download = () => {
  var application = location.href.replace(/.*applications\/(.*?)\/.*/g, "$1");
  var classname = $("li.item-class-name").text().replace(/ |\r|\n/g, '');
  if (!classname && $('.account .title strong').text() === 'ロール') {
    classname = 'user';
  }
  if (!classname && $('.filestore .title strong').text() === '一覧') {
    classname = 'file';
  }
  if (!classname && $('.pushinfo .title strong').text() === '一覧') {
    classname = 'push';
  }
  if (['installation', 'role', 'user', 'file', 'push'].indexOf(classname) > -1) {
    if (['installation', 'file', 'role', 'user'].indexOf(classname) > -1) classname = classname + 's';
    var url = "https://console.mbaas.api.nifcloud.com/2013-09-01/applications/"+application+"/"+classname;
  } else {
    var url = "https://console.mbaas.api.nifcloud.com/2013-09-01/applications/"+application+"/classes/"+classname;
  }

  var total = $(".paging-set .item-paging .item-view").text().trim().replace(/^([0-9]+).*/, "$1");
  var limit = 100;
  var order = $(".white.right.arrow-down").parent().parent().text().replace(/ |\r|\n*/g, '');
  if (order == "") {
    order = $(".white.right.arrow-up").parent().parent().text().replace(/ |\r|\n*/g, '');
    if (order === '') {
      order = '-createDate';
    }
  }else{
    order = "-" + order;
  }
  var skip = 0;
  var results = [];

  var total_pages = Math.ceil(total / limit);
  var finish = {};
  var results = [];
  
  function getData(i) {
    finish[i] = false;
    var skip = i * limit;
    chrome.runtime.sendMessage(null, {
      contentScriptQuery: "dataStoreAccess",
      url: url + "?limit="+limit+"&order="+order+"&skip="+skip+"&where=%7B%7D",
      options: {
        headers: {"X-NCMB-Devs-Session-Token": session},
        method: "GET"
      }
    }, (ary) => {
      for (k in ary) {
        delete ary[k]['objectId'];
        ary[k].createDate = {
          '__type': 'Date',
          'iso': ary[k].createDate
        }
        ary[k].updateDate = {
          '__type': 'Date',
          'iso': ary[k].updateDate
        }
        results.push(ary[k])
      }
      finish[i] = true;
      for (var j = 0; j < total_pages; j++) {
        if (finish[j] == false) {
          return true;
        }
      }
      var blob = new Blob([ JSON.stringify({results: results}) ], { "type" : "application/json" });
      saveAs(blob, classname + ".json");
    });
  }

  for (var i = 0; i < total_pages; i++) {
    getData(i);
  }
}

window.addEventListener("load", main, false);

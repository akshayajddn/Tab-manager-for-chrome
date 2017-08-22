function init() {
  document.getElementById("discardTab").addEventListener('click',discardTab);
  document.getElementById("discardall").addEventListener('click',discardAllTabs);
  document.getElementById("tabWhiteList").addEventListener('click',addTabToWhiteList);
  document.getElementById("removeTabWhiteList").addEventListener('click',removeTabFromWhiteList);
  document.getElementById("setParameters").addEventListener('click',set_Parameters);
  document.getElementById("setDefault").addEventListener('click',set_Default);
  
  set_Form_Values();   
  updateSuspendedtabs();
  updateWhitelistedtabs();
  updateRemovedTabs();
}

function set_Form_Values(){
  chrome.runtime.getBackgroundPage(function(bg){
  var suspendThres= bg.suspendThreshold;
  var tabslimit=bg.removeThresholdTab;
  document.getElementById("suspendThreshold").value=suspendThres;
  document.getElementById("maxTabs").value=tabslimit;
  });
}

function set_Default(){
  chrome.runtime.getBackgroundPage(function(bg){
    bg.suspendThreshold=15;
    bg.removeThresholdTab=5; 
    set_Form_Values();
  });
}


function set_Parameters(){
  chrome.runtime.getBackgroundPage(function(bg){
    var suspendthreshold=document.getElementById("suspendThreshold").value;
    bg.suspendThreshold=suspendthreshold;

    var maxTabs=document.getElementById("maxTabs").value;
    bg.removeThresholdTab=maxTabs; 
  })
}
  
function updateSuspendedtabs(){
  chrome.runtime.getBackgroundPage(function(bg) {
      var suspendDiv=document.getElementById("ul_suspended");
      var list=bg.suspendedTabs;
      var urlDict=bg.suspendTabsUrl;
      var titleDict=bg.suspendTabsTitle;
    suspendDiv.innerHTML="";
    for (i=0;i<list.length;i++) {
        suspendDiv.innerHTML+="<li><a href="+urlDict[list[i]]+ " target='_blank'>"+(titleDict[list[i]]).split('#')[1]+"</a></li>";
    }
});
}

function updateWhitelistedtabs()
{

    //for loading whitelisted tabs
     chrome.runtime.getBackgroundPage(function(bg) {
      var whDiv=document.getElementById("ul_whitelisted");
      var list=bg.whiteListedtabs;
    whDiv.innerHTML="";
    for(i=0;i<list.length;i++){
      chrome.tabs.get(list[i],function(tab){
          whDiv.innerHTML+="<li><a href="+tab.url+ " target='_blank'>"+tab.title+"</a></li>";
          });
        }
    });
}


function updateRemovedTabs(){
     chrome.runtime.getBackgroundPage(function(bg) {
      var removeDiv=document.getElementById("ul_removed");
      var urlDict=bg.removedTabsUrl;
      var titleDict=bg.removedTabsTitle;
      
    removeDiv.innerHTML="";
    for (var key in urlDict) {
      if (urlDict.hasOwnProperty(key)){
        removeDiv.innerHTML+="<li><a href="+urlDict[key]+ " target='_blank'>"+titleDict[key]+"</a></li>";
      }
    }
    });  
}

function discardAllTabs(){
  chrome.windows.getAll({populate: true}, function(newWindowList) {
  newWindowList.forEach(function(window){
      chrome.tabs.query({windowId:window.id,active:false}, function(tabs) {
        for(i = 0;i<tabs.length;i++){
          chrome.tabs.executeScript(tabs[i].id, {code:"document.title='discarded#'+document.title;"},function(){
            setTimeout(updateSuspendedtabs,500);
          });
        }
    });
});
});
}

function discardTab(){

  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs){
     chrome.tabs.create({active:false,url:tabs[0].url}, function(tab){
     	chrome.tabs.executeScript(tab.id,{code:"document.title='discarded#'+document.title;"},function(){});
     	setTimeout(function(){
     		chrome.tabs.query({active:true},function(activeTabs){
     			chrome.tabs.remove(activeTabs[0].id,function(){
            chrome.tabs.create({active:true},function(){});
          });
     	});
     },1000);
});
});
}

function addTabToWhiteList(){

  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo,function(tabs){
    setTimeout(function(){
      chrome.runtime.sendMessage({'whitelist':tabs[0].id,'todo':'1'},function(){updateWhitelistedtabs();});
    },200);  
});

}

function removeTabFromWhiteList(){
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo,function(tabs){
    setTimeout(function(){
      chrome.runtime.sendMessage({'whitelist':tabs[0].id,'todo':'0'},function(){updateWhitelistedtabs();});
    },200);  
});
}

// Kick things off.
document.addEventListener('DOMContentLoaded', init);


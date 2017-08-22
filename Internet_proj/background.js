var tabToLastActiveTime={};
var tabHistory=[];
var suspendThreshold=15;
var whiteListedtabs=[];
var suspendedTabs=[];
var removeThresholdTab=5;
var tabToDiscardTime={};
var removedTabsTitle={};
var removedTabsUrl={};
var removedTabsLimit=10;
var afterDiscardTabIds={};
var beforeDiscardTabIds={};
var suspendTabsUrl={};
var suspendTabsTitle={};
var tabToWin={};


chrome.tabs.onUpdated.addListener(function suspendTab(tabid,tab){
	chrome.tabs.get(tabid,function(tab){
		if(tab.active!=true && tab.discarded==false){
			if(tab.title.indexOf('discarded')>=0){
	        	if(suspendedTabs.indexOf(tab.id) < 0){
	            	suspendedTabs.push(tab.id);
	                
	            	var currentDate=new Date();
            		var currentTime=currentDate.getTime()/1000;
            		tabToDiscardTime[tab.id] = currentTime;
                    
            		suspendTabsUrl[tab.id] = tab.url;
                    suspendTabsTitle[tab.id] = tab.title;
                    
                    console.log(tab.title+" "+tab.id);
                    	
            		  
	            	chrome.tabs.discard(tabid,function(tab){
	            		afterDiscardTabIds[tabid]=tab.id;
	            		beforeDiscardTabIds[tab.id]=tabid;
	            	});
	        	}
        	}
		}	
    });
});




chrome.alarms.onAlarm.addListener(function(alarm)
{
	var currDate=new Date();
	var currentTime=currDate.getTime()/1000;
	chrome.windows.getAll({populate: true}, function(newWindowList) 
    {
  	 newWindowList.forEach(function(window)
     {
      chrome.tabs.query({windowId:window.id,active:false}, function(tabs) 
      {
        for(i = 0;i<tabs.length;i++)
        {
            if(suspendedTabs.indexOf(tabs[i].id) < 0){
          	if(whiteListedtabs.indexOf(tabs[i].id)<0)
            {
	          	tabInActivityPeriod=currentTime-tabToLastActiveTime[tabs[i].id];
	          	if(tabInActivityPeriod > suspendThreshold)
                {
		          	//console.log("Going to discard:"+tabs[i].title+"id:"+tabs[i].id);
		          	chrome.tabs.executeScript(tabs[i].id, {code:"document.title='discarded#'+document.title;"},
                        function()
                        {
                               
	                            setTimeout(function(){
	                                var x = chrome.extension.getViews({type:"popup"});
	                                if (x.length>0)
	                                {
	                                    var suspendDiv=x[0].document.getElementById('ul_suspended');
	                                    suspendDiv.innerHTML="";
	                                    for(i=0;i<suspendedTabs.length;i++)
	                                      {
                                                var tab=suspendedTabs[i];
                                                var url = suspendTabsUrl[tab];
                                                var title = suspendTabsTitle[tab];
                                                title = title.split('#')[1];
                                                
	                                      		//chrome.tabs.get(suspendedTabs[i],function(tab){
	                                      		console.log("while printing:-"+title);
	                                            //suspendDiv.innerHTML+="<li><a href="+tab.url+ " target='_blank'>"+tab.title.split('#')[1]+"</a></li>";
	                                      		//});
                                                
                                                suspendDiv.innerHTML+="<li><a href="+url+ " target='_blank'>"+title+"</a></li>";	
	                                      }
	                                }

	                            },1000);
                        	
                        });
                }
            }
        }


        }

    });

      chrome.tabs.query({windowId:window.id},function(tabs){

                var windowSpecificKeys = Object.keys(tabToDiscardTime).filter(function(key){
                    return tabToWin[key]==window.id; 
                });

                var result = windowSpecificKeys.sort(function(a, b) {
                  return tabToDiscardTime[a] - tabToDiscardTime[b];
                });

                var removableTabs=result.map(Number);
                removeThresholdTab = parseInt(removeThresholdTab);

                if(Object.keys(removedTabsUrl).length > removedTabsLimit){
                    /*delete the record of removed tabs if it goes > 10*/
                    for(var key in removedTabsUrl){
                        if(removedTabsUrl.hasOwnProperty(key)){
                            delete removedTabsUrl[key];
                            delete removedTabsTitle[key];
                        }
                    }
                }
                
                for(i=0;i<(tabs.length-removeThresholdTab);i++)
                {   
                    console.log("inside for of removal:"+removableTabs[i]);
                    var tabToRemoveId=afterDiscardTabIds[removableTabs[i]];

                    removedTabsUrl[removableTabs[i]]=suspendTabsUrl[removableTabs[i]];
                    removedTabsTitle[removableTabs[i]]=suspendTabsTitle[removableTabs[i]];

                    chrome.tabs.remove(tabToRemoveId,function(){
                    removableTabs.splice(i,1);
                    result.splice(i,1);
                    });    
      			}
    		});
      
 });
 }); 
 });


chrome.tabs.onRemoved.addListener(function deleteClosed(tabid){
	console.log("inside remove listener:"+tabid);
    
    if(tabid in beforeDiscardTabIds){
        var tab=beforeDiscardTabIds[tabid];
    	var index=suspendedTabs.indexOf(tab);
    	if(index>=0){
    		suspendedTabs.splice(index,1);
    	}

        if(tab in tabToWin){
            delete tabToWin[tab];
        }

    	if(tab in tabToLastActiveTime){
    		delete tabToLastActiveTime[tab];
    	}

        if(tab in afterDiscardTabIds){
            delete afterDiscardTabIds[tab];
        }

        if(tabid in beforeDiscardTabIds){
            delete beforeDiscardTabIds[tabid];
        }

        if(tab in tabToDiscardTime){
            delete tabToDiscardTime[tab];
        }

        if(tab in suspendTabsUrl){
            delete suspendTabsUrl[tab];
        }

        if(tab in suspendTabsTitle){
            delete suspendTabsTitle[tab];
        }
    }
    

    else{
        var index=suspendedTabs.indexOf(tabid);
        if(index>=0){
        suspendedTabs.splice(index,1);
        }

        if(tabid in tabToLastActiveTime){
        delete tabToLastActiveTime[tabid];
        }

        if(tab in suspendTabsUrl){
            delete suspendTabsUrl[tab];
        }

        if(tab in suspendTabsTitle){
            delete suspendTabsTitle[tab];
        }

        if(tabid in tabToWin){
            delete tabToWin[tabid];
        }
    }
    
    var index=whiteListedtabs.indexOf(tabid);
    if(index>=0){
    whiteListedtabs.splice(index,1);
    }

});




chrome.tabs.onActivated.addListener(function(info) {

    var tab = info.tabId;

    if(info.tabId in beforeDiscardTabIds){
    tab=beforeDiscardTabIds[info.tabId];        
    }    

    var index=suspendedTabs.indexOf(tab);
    if(index>=0){
        suspendedTabs.splice(index,1);
    }
    

    tabHistory.push(info.tabId);
    var lastActiveTime = new Date();
    //console.log(info.windowId+" " +info.tabId+" "+t);
    var lastActiveTabId;
    if(tabHistory.length > 1){
    	lastActiveTabId=tabHistory[tabHistory.length-2];
    }
    else{
    	lastActiveTabId=tabHistory[tabHistory.length-1];
    }
    tabToLastActiveTime[lastActiveTabId]=lastActiveTime.getTime()/1000;

    /*delete the entry in afterdiscardTab and beforediscardTab*/
    if(tab in tabToWin){
        delete tabToWin[tab];
    }
    tabToWin[info.tabId]=info.windowId;


    if(info.tabId in beforeDiscardTabIds){
        delete beforeDiscardTabIds[info.tabId];
    }

    if(tab in afterDiscardTabIds){
        delete afterDiscardTabIds[tab];
    }

    if(info.tabId in tabToDiscardTime){
        delete tabToDiscardTime[info.tabId];
    }

    if(tab in tabToLastActiveTime){
        delete tabToLastActiveTime[tab];
    }

    if(info.tabId in tabToLastActiveTime){
        delete tabToLastActiveTime[info.tabId];
    }

    if(tab in suspendTabsUrl){
        delete suspendTabsUrl[tab];
    }

    if(tab in suspendTabsTitle){
        delete suspendTabsTitle[tab];
    }

    tabToWin[info.tabId]=info.windowId;

});





chrome.runtime.onMessage.addListener(function(message){ 
        // Call the callback function
        if(message.todo=='1'){
        	var index=whiteListedtabs.indexOf(message.whitelist);
        	if(index < 0){
        		whiteListedtabs.push(message.whitelist);		
        	}
        	else{
        		alert("already whitelisted");
        	}
        }

        else if(message.todo=='0'){
        	var index=whiteListedtabs.indexOf(message.whitelist);
        	if(index>=0){
        		whiteListedtabs.splice(index,1);
        	}
        	else{
        		alert("tab not in the whitelisted tablist!!");
        	}
        }
}); 


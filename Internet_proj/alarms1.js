(function(){
	'use strict';
	var alarmName='remindme';
	function checkAlarm(callback){
		chrome.alarms.getAll(function(Alarms){
			var hasAlarm=Alarms.some(function(a){
				return a.name==alarmName;
			});
			var newLabel;
			if(hasAlarm){
				newLabel='Cancel alarm';
			}
			else{
				newLabel='Activate alarm';
			}
			//document.getElementById('toggleAlarm').innerText=newLabel;
		});
		if(callback){
			callback(hasAlarm);
		}
	}

	function createAlarm(){
		console.log("Alarm created");
		chrome.alarms.create(alarmName,{delayInMinutes:0.1,periodInMinutes:0.1});
	}

	function cancelAlarm(){
		chrome.alarms.clear(alarmName);
	}

	function doToggleAlarm(){
		checkAlarm(function(hasAlarm){
			if(hasAlarm){
				cancelAlarm();
			}
			else{
				createAlarm();
			}
			checkAlarm();
		});
	}
	//document.getElementById('toggleAlarm').addEventListener('click',doToggleAlarm);
	createAlarm();
})();
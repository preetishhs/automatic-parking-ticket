var $motionBox = $('.motion-box');
var $turret = $('img');

var scale = 10;	// capture resolution over motion resolution
var isActivated = false;
var isTargetInSight = false;
var isKnockedOver = false;
var lostTimeout;

var start = false;
var front = true;
var vehicles = 42;

var vhno_arr = [];
var rfid_arr = [12345,23456,546457,534532,54353];
var k = 0;

document.getElementById('slots').innerHTML = vehicles;

	window.startMonitor = function(){
	start = true;
	document.getElementById('button-text').innerHTML = "Restart Monitoring";
	document.getElementById('monitor').style.display = "block";
	document.getElementById('monitor').innerHTML = "Monitoring started"
	var a = document.getElementsByClassName('elements');
		for(var i =0; i<a.length; i++) {
			a[i].innerHTML = "";
		}
	}
	
window.listVehicles = function(){
	for(var i =0; i<vhno_arr.length; i++) {
		document.write(vhno_arr[i]);
	}
}

window.changeView = function(){
	if(front) {
		front = false;
		var exit = document.getElementsByClassName('exit');
		exit[0].style.visibility = "visible";
		exit[1].style.visibility = "visible";
	} else {
		front = true;
		var exit = document.getElementsByClassName('exit');
		exit[0].style.visibility = "visible";
		exit[1].style.visibility = "visible";
	}
	var name = document.getElementById('view');
	var a = document.getElementsByClassName('elements');
	document.getElementById('monitor').innerHTML = ""
	document.getElementById('button-text').innerHTML = "Click to start Monitoring";
		for(var i =0; i<a.length; i++) {
			a[i].innerHTML = "";
		}
	if(name.innerHTML == "Mall Entrance View") {
		name.innerHTML ="Mall Exit View";
		
	} else {
		name.innerHTML = "Mall Entrance View";
	}
}

function detectPlate(imageBytes) {
	
	imageBytes = imageBytes.replace('data:image/png;base64,','');
	var OpenalprApi = require('openalpr_api');
	 
	var api = new OpenalprApi.DefaultApi()

	var secretKey = "sk_d1dfe2cd7e2dcd36631640fa"; // {String} The secret key used to authenticate your account.  You can view your  secret key by visiting  https://cloud.openalpr.com/ 

	var country = "us"; // {String} Defines the training data used by OpenALPR.  \"us\" analyzes  North-American style plates.  \"eu\" analyzes European-style plates.  This field is required if using the \"plate\" task  You may use multiple datasets by using commas between the country  codes.  For example, 'au,auwide' would analyze using both the  Australian plate styles.  A full list of supported country codes  can be found here https://github.com/openalpr/openalpr/tree/master/runtime_data/config 

	var opts = { 
	  'recognizeVehicle': 0, // {Integer} If set to 1, the vehicle will also be recognized in the image This requires an additional credit per request 
	  'state': "", // {String} Corresponds to a US state or EU country code used by OpenALPR pattern  recognition.  For example, using \"md\" matches US plates against the  Maryland plate patterns.  Using \"fr\" matches European plates against  the French plate patterns. 
	  'returnImage': 0, // {Integer} If set to 1, the image you uploaded will be encoded in base64 and  sent back along with the response 
	  'topn': 10, // {Integer} The number of results you would like to be returned for plate  candidates and vehicle classifications 
	  'prewarp': "" // {String} Prewarp configuration is used to calibrate the analyses for the  angle of a particular camera.  More information is available here http://doc.openalpr.com/accuracy_improvements.html#calibration 
	};
	
	var callback = function(error, data, response) {
	  if (error) {
		console.error(error);
	  } else {
		console.log('API called successfully. Returned data: ' + data);
		changeOnUI(data.results[0].plate);
	  }
	};

	api.recognizeBytes(imageBytes, secretKey, country, opts, callback);
	
}

function changeOnUI(plate) {
	if(plate) {	
		if(front){
			document.getElementById('vehicle-no').innerHTML = plate;
			document.getElementById('rfid-no').innerHTML = rfid_arr[k];
			document.getElementById('type').innerHTML = "4 wheeler";
			k++;
			vehicles = vehicles -1;
			document.getElementById('slots').innerHTML = vehicles;
			vhno_arr.push(plate);
		} else {
			document.getElementById('vehicle-no').innerHTML = plate;
			document.getElementById('rfid-no').innerHTML = rfid_arr[k];
			document.getElementById('type').innerHTML = "4 wheeler";
			document.getElementById('fare').innerHTML = "Rs. 40/-";
			document.getElementById('time').innerHTML = "2 hours 23 minutes";
			k--;
			vehicles = vehicles + 1;
			document.getElementById('slots').innerHTML = vehicles;
			vhno_arr.pop(plate);
		}
	} 
}
function initSuccess() {
	DiffCamEngine.start();
}

function initError() {
	alert('Something went wrong.');
}

function startComplete() {
	setTimeout(activate, 500);
}

function activate() {
	isActivated = true;
	play('activated');
}

function capture(payload) {
	var t = document.getElementById('treshold');
	t.innerHTML = "Treshold: " + payload.score;
	if (!isActivated || isKnockedOver) {
		return;
	}

	if(payload.score>80 && start) {
		start = false;
		detectPlate(payload.getURL());
		document.getElementById('monitor').innerHTML = "Vehicle Detected!!"
	}
	
	var box = payload.motionBox;
	if (box) {
		// video is flipped, so we're positioning from right instead of left
		var right = box.x.min * scale + 1;
		var top = box.y.min * scale + 1;
		var width = (box.x.max - box.x.min) * scale;
		var height = (box.y.max - box.y.min) * scale;

		$motionBox.css({
			display: 'block',
			right: right,
			top: top,
			width: width,
			height: height
		});

		if (!isTargetInSight) {
			isTargetInSight = true;
			play('i-see-you');
		} else {
			play('fire');
		}

		clearTimeout(lostTimeout);
		lostTimeout = setTimeout(declareLost, 2000);
	}

	// video is flipped, so (0, 0) is at top right
	
}

function declareLost() {
	isTargetInSight = false;
	play('target-lost');
}

function knockOver() {
	isKnockedOver = true;
	clearTimeout(lostTimeout);

	$turret.addClass('knocked-over');
	$motionBox.hide();

	play('ow');
}

function play(audioId) {
	$('#audio-' + audioId)[0].play();
}

DiffCamEngine.init({
	video: document.getElementById('video'),
	captureIntervalTime: 50,
	includeMotionBox: true,
	includeMotionPixels: true,
	initSuccessCallback: initSuccess,
	initErrorCallback: initError,
	startCompleteCallback: startComplete,
	captureCallback: capture
});

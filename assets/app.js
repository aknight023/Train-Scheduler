$(document).ready( function () {

	// Initialize Firebase
  var config = {
	apiKey: "AIzaSyC8Ey-wwueipmN9Clx7-lVfxce1QutttzA",
	authDomain: "train-scheduler-8bf08.firebaseapp.com",
	databaseURL: "https://train-scheduler-8bf08.firebaseio.com",
	projectId: "train-scheduler-8bf08",
	storageBucket: "train-scheduler-8bf08.appspot.com",
	messagingSenderId: "309605505011"
  };

  firebase.initializeApp(config);

	// Create a variable to reference the database
	var database = firebase.database();

	$('#submit').on('click', function(event) {
		
		event.preventDefault();

		var nameInput = $('#train-name-input').val().trim();
		var destinationInput =  $('#train-destination-input').val().trim();
		var firstTimeInput = $('#train-first-time-input').val().trim();
		var frequencyInput = $('#train-frequency-input').val().trim();

		if (firstTimeInput.length > 5 ) {

			alert ('Please enter a vaild time: Example: HH:MM in Military Time Only');
			return
		}	
		
		database.ref().push({
			trainName: nameInput,
			destination: destinationInput,
			firstTrainTime: firstTimeInput,  
			frequency: frequencyInput

		});

		// Clear input
		$("#train-name-input, #train-destination-input, #train-first-time-input, #train-frequency-input").val('');


	});
	
	database.ref().on("child_added", function (snapshot) {	

	function refreshTable () {
		var data = snapshot.val();

		var newTrain = data.trainName;
		var newDestination = data.destination;
		var newFirstTrainTime = data.firstTrainTime;  	
		var newFrequency = data.frequency;	

		var firstTimeConverted = moment(newFirstTrainTime, "hh:mm").subtract(1, "years");		
		var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
		var remainder = diffTime % newFrequency;
		var newMinutesTillTrain = newFrequency - remainder;
		var nextTrain = moment().add(newMinutesTillTrain, "minutes");
		var newNextTrainFormat = moment(nextTrain).format("hh:mm");

		// Display On Page in the Tbody element class content
		$('.content').append(
			'<tr id="'+snapshot.key+'"><td>' + newTrain +
			'</td><td>' + newDestination +
			'</td><td>' + newFrequency +
			'</td><td>' + newNextTrainFormat +
			'</td><td>' + newMinutesTillTrain +
			'</td><td><button class="btn btn-primary removebut" data-key="'+snapshot.key+'">Remove</button></td></tr>');
			
	}

	refreshTable();
   
  },
	//Handle the errors
	function (errorObject) {
	  console.log("Errors handled: " + errorObject.code);
	});		

	function removeState () {

		var obj = $(this);
		var keyR = obj.attr('data-key');

		//removes from DOM
		obj.parent().parent().attr("id", keyR).remove();
		//Removes node from firebase
		database.ref(keyR).remove();      

	}

	function currentTime (){
	  var timeNow = moment().format("hh:mm:ss A");
	  $("#current-time").text("Current Time: " + timeNow);
	  // seconds right now
	  var seconds = moment().format("ss");

	// Trying to get the data to refresh every minute but had troble with the page reload when a user was entering data. Clearly this isnt the right
	// way to do it. 

	  if(seconds == "00"){
	    // Refresh the Page every minute
	    location.reload();
	    refreshTable();
	  }



	}

	// Update the Current Time every second
	var timer = setInterval(currentTime, 1000);	

	$(document).on('click', '.removebut', removeState);

});

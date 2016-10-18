//API KEY = AIzaSyCC1esCeAIHUljEEc-ZCuoogjxN14vHL_o
/*
	TODO
	1) display intro screen first - minimal buttons for walking, driving
	2) get user's location -> https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation
						   -> https://developers.google.com/web/fundamentals/native-hardware/user-location/obtain-location?hl=en
						   //in chrome 50+ it doesn't work if you aren't using https.  needs to be on a web server for full testing.  Might need to implement this last
	3) Distance lookup -> https://developers.google.com/maps/documentation/javascript/examples/distance-matrix
*/
var userLoc;
var map;
var service;
var infowindow;
var marker;
var travelDistance;
var travelTable =	
	{ 
		walk : 800,
		drive: 5000
	}






function initMap(myCallback){

	//if browser not supported, display error.
	if(!navigator.geolocation)
	{
		alert("Please enable geolocation to use this service.");
	}
	
	//passed as callback function to navigator.geolocation.getCurrentPosition()
	function success(){
		//lat and lng will be passed to maps API
		userLoc = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		}
		console.log('Latitude is ' + userLoc.lat + ', Longitude is ' + userLoc.lng + '.');
	
		if(userLoc === false)
		{
			console.log("Error: Unable to get your location.");
		}
		
		map = new google.maps.Map(document.getElementById('map'), {
			center: userLoc,
			zoom: 15,
			disableDefaultUI: true
		});
		/*
		var marker = new google.maps.Marker({
			position: {lat:35.77, lng:-78.61},
			map: map,
			title: 'Click to zoom'
		});
		*/
		
		infowindow = new google.maps.InfoWindow();
		service = new google.maps.places.PlacesService(map);
		var request = {
			location: userLoc,
			radius: travelDistance,
			keyword: 'restaurant',
			openNow: true,
			//minPriceLevel: 0,
			//maxPriceLevel: 2
		}
		service.radarSearch(request, callback);
	}
	
	//passed as callback function to navigator.geolocation.getCurrentPosition()
	function error()
	{
		alert("Please enable geolocation to use this service.");
		return false;
	}
	
	//run geolocation//
	navigator.geolocation.getCurrentPosition(success, error);
	///////////////////
	
	//execute callback function (used for loading transitions)
	myCallback();
}

function callback(results, status) {
	if(status === google.maps.places.PlacesServiceStatus.OK){
		//get place_id of a random item from the results.
		var rando = results[Math.floor(Math.random()*results.length)].place_id;
		var detailsRequest = { placeId: rando };
		
		//get place details using the place ID.
		//use callback function to handle the object returned by the place ID.
		service.getDetails(detailsRequest, function(place, status){
			if(status === google.maps.places.PlacesServiceStatus.OK){
				createMarker(place);
			}
			console.log(place);
		});

	

		//create marker from random result.
		//createMarker();
	}
}

function createMarker(place, callback) {
	var placeLoc = place.geometry.location;
	marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});
	
	//concat string based on price_level attribute.
	var priceString = "";
	for(var i = 0; i < place.price_level; i++)
	{
		priceString += "$";
	}

	//example string of directions URL : https://www.google.com/maps/dir/'35.7951739,-78.6512208'/6019+Applewood+Ln,+Raleigh,+NC+27609/@35.82923,-78.6665861
	//set content of info window based on place.
	//TODO - add directions, calculate distance.
	//construct URL
	infowindow.setContent("<h2> You should eat at " + place.name + ".</h2>"
								 + place.formatted_address + "<br>"
								 + place.rating + " Stars - " + priceString + " - " + "<a href=" + place.website + ">Website</a><br>"
								 + "<a class=\"btn btn-default\" href=\"https://www.google.com/maps/dir/" + "'" + userLoc.lat + "," + userLoc.lng + "'/" + place.formatted_address + "\"" + ">OK!</a><a class=\"btn btn-default\" onclick='reload()'>Nah</a>");
	infowindow.open(map, marker);
	
	

	//prevent user from zooming/moving the map/etc
	map.setOptions({
		center: placeLoc,
		zoom: 18,
		mapTypeControl: false,
		draggable: false,
		scrollwheel: false,
		navigationControl: false,
		streetViewControl: false,
		clickableIcons: false,
		zoomControl: false
	});

	

}

function gotoMap(){
	$("#control").fadeOut(600, function(){
		console.log("Test");
		$(".loader").fadeIn(600);
		initMap(hideLoader);		//pass function to hide loading screen as a callback, execute when finished.

	});
}

$(".menu-option").click(function(){
	if(!($(this).hasClass("selected")))
	{
		$(".menu-option").toggleClass("selected");
	}
});

$(".init").click(function(){
	//lookup in travel table radial distance in which to search for food.
	travelDistance = travelTable[$(".selected").children(0).attr('id')];
	gotoMap(hideLoader);
});

/*ANIMATIONS*/

//hide load screen when map is loaded.
function hideLoader(){
	$(".loader").fadeOut(600);
	$("#map").fadeIn(600);
}

//re-display load icon when map is loading.
function reload(){
	$('.loader').fadeIn(600, function(){
		initMap(hideLoader);
	});
}


$(window).load(function(){
	$(".loader").fadeOut(600)
});
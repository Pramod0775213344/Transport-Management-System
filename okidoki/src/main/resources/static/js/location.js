
let map, placesService, marker, infoWindow;

function initMap() {
    try {
        // Initialize map centered on a default location (e.g., New York)
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 40.7128, lng: -74.0060 },
            zoom: 10
        });

        placesService = new google.maps.places.PlacesService(map);
        infoWindow = new google.maps.InfoWindow();

        // Add event listeners
        document.getElementById('search-button').addEventListener('click', searchLocation);
        document.getElementById('searchinput').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });
    } catch (error) {
        handleError('Failed to initialize map: ' + error.message);
    }
}

function searchLocation() {
    const searchInput = document.getElementById('searchinput').value.trim();
    const errorDiv = document.getElementById('error-message');

    // Clear previous results

    errorDiv.innerHTML = '';
    if (marker) marker.setMap(null);

    if (!searchInput) {
        handleError('Please enter a location');
        return;
    }

    // Search for the location
    placesService.textSearch({ query: searchInput }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
            const place = results[0];

            // Center map on the location
            map.setCenter(place.geometry.location);
            map.setZoom(15);

            // Add a marker
            marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                title: place.name
            });

            locationName.value = place.name;
            locationAddress.value = place.formatted_address;

            // locations.name = place.name;


            // Obhject ekata asign karanwa
            // location.name = place.name;
            let locationNameInput = document.getElementById("locationName");
             // location name eka input value ekata samana nam eka object ekata assigning karanawa
             if(locationNameInput.value == place.name) {
                locations.name = place.name;
            }
            locations.address = place.formatted_address;
            // location.address = place.formatted_address;

            // Add info window
            marker.addListener('click', () => {
                infoWindow.setContent(`
                    <div style="max-width:250px;">
                        <h4>${place.name || 'Location'}</h4>
                        <p>${place.formatted_address || 'No address available'}</p>
                        ${place.rating ? `<p>Rating: ${place.rating}/5</p>` : ''}
                    </div>
                `);
                infoWindow.open(map, marker);
            });
        } else {
            handleError('Location not found. Please try a different search.');
        }
    });
}

function handleError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    console.error(message);
}

// Handle API loading errors
window.addEventListener('error', function (event) {
    if (event.message.includes('Google Maps JavaScript API')) {
        handleError('Failed to load Google Maps. Please check your API key and internet connection.');
    }
});

// Attempt to initialize map when page loads
window.onload = function () {
    if (window.google && window.google.maps) {
        initMap();
    } else {
        handleError('Google Maps API not loaded. Please check your API key.');
    }

    refreshLocationForm();
};

// --------------------------------------------------------------------------------------------------------------------------------------------------
//Need to check all the fields are fill 
const checkFormError = () => {
    let errors = "";

    if (locations.customer_id == null) {
        errors = errors + "Select Company Name..! \n";
    }
    if (locations.name == null) {
        errors = errors + "Please Enter Location Name..! \n";
    }

    return errors;
}

const pickupLocationChkbox = document.getElementById("pickupLocationChkbox")
const viaLocationChkbox = document.getElementById("viaLocationChkbox")
const deliveryLocationChkbox = document.getElementById("deliveryLocationChkbox")
//Booking from submit event function
const locationFormSubmit = () => {
    console.log(locations);

    // check form error for required element
    let errors = checkFormError();
    if (errors == "") {
        // errors not exit
        //need to get user confirmation

        let userConfirm = Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, save it!",
            allowOutsideClick: false,
            customClass :{
                cancelButton :'btn-3d btn-3d-cancel',
                confirmButton :'btn-3d btn-3d-submit'
            }

        }).then((userConfirm) => {
            if (userConfirm.isConfirmed) {
                //call post service
                if (pickupLocationChkbox.checked) {
                    var postResponse = httpServiceRequest("/pickuplocation/insert", "POST", locations);

                }
                if (deliveryLocationChkbox.checked) {
                    var postResponse = httpServiceRequest("/deliverylocation/insert", "POST", locations);
                }
                if (viaLocationChkbox.checked) {
                    var postResponse = httpServiceRequest("/location/insert", "POST", locations);
                }
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    refreshLocationForm();
                } else {
                    Swal.fire({
                        title: "Failed to Submit....?",
                        text: postResponse,
                        icon: "question",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                }
            } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Details not Saved!",
                    icon: "error",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            }
        });
    } else {
        Swal.fire({
            title: 'Error!',
            text: errors,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
    }

}

// Reset form function
const refreshLocationForm = () => {

    locations = new Object();

    locationForm.reset();
    setDefault([selectCompanyNameForLocation,locationName]);

    let compnayNames = getServiceRequest('/customer/bycustomerstatus');
    dataFilIntoSelect(selectCompanyNameForLocation, "Select Company Name", compnayNames, "company_name")


    searchinput.value = "";

};

//Alert Box Call function
Swal.isVisible();

window.addEventListener("load", () => {

    refresh();
    $('#vehicleAssigningTable').DataTable().clear().draw(); // Clear table if no data
    $('#vehicleAssigningTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
    showLoadingOverlayOnTable("loaderId","vehicleAssigningTable");

});
// reset button
const reset = () =>{

    $('#vehicleAssigningTable').DataTable().clear().draw(); // Clear table if no data
    $('#vehicleAssigningTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
    showLoadingOverlayOnTable("loaderId","vehicleAssigningTable");

    let customer = getServiceRequest('/customer/alldata');
    dataFilIntoSelect(selectCustomerSearch, "Select Customer ", customer, "company_name")

    dateFrom.value = ""
    dateTo.value = ""
}

// load booking deatils
const search = () =>{

    if ($.fn.dataTable.isDataTable('#vehicleAssigningTable')) {
        $('#vehicleAssigningTable').DataTable().clear().destroy();
    }

    let customerIdElement = document.getElementById('selectCustomerSearch').value;
    bookingList = getServiceRequest('/booking/bydaterangeandcustomerid?startdate='+ dateFrom.value +'&enddate='+ dateTo.value +'&customerid=' + JSON.parse(customerIdElement).id);
    loadVehicleAssigningTable(bookingList);
}

// load booking deatils
const loadVehicleAssigningTable = (bookingList) => {

    let propertyList = [
        { propertyName: "booking_no", dataType: "string" },
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: getCustomerContactPersonName, dataType: "function" },
        { propertyName: getCustomerContactPersonMobile, dataType: "function" },
        { propertyName: getVehicleTypeForBooking, dataType: "function" },
        { propertyName: getPickupLoaction, dataType: "function" },
        { propertyName: "pickup_date_time", dataType: "string" },
        { propertyName: getViaLoaction, dataType: "function" },
        { propertyName: getDeliveryLoaction, dataType: "function" },
        { propertyName: "delivery_date_time", dataType: "string" },
        { propertyName: getDistance, dataType: "function" },
        { propertyName: getTransportNameForBooking, dataType: "function" },
        { propertyName: getSupplierDeatils, dataType: "function" },
        { propertyName: getVehicleNoForBooking, dataType: "function" },
        { propertyName: getVehicleTypeOfVehicle, dataType: "function" },
        { propertyName: getDriver, dataType: "function" },
        { propertyName: getDriverContactDetails, dataType: "function" },
        { propertyName: "arrived_at_pickup_datetime", dataType: "datetime" },
        { propertyName: "departed_from_pickup_datetime", dataType: "datetime" },
        { propertyName: "arrived_at_delivery_datetime", dataType: "datetime" },
        { propertyName: "departed_from_delivery_datetime", dataType: "datetime" },
        { propertyName: getStatus, dataType: "function" }
    ];

    if (bookingList.length <= 0){
        $('#vehicleAssigningTable').DataTable().clear().draw(); // Clear table if no data
        $('#vehicleAssigningTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
        showLoadingOverlayOnTable("loaderId","vehicleAssigningTable");

    }else {

        fillDataIntoVehicleAssigningTable(vehicleAssigningTableBody, bookingList, propertyList, vehicleAssigningForm, datetimeFunctionForm);
        // $('#vehicleAssigningTable').DataTable();

        new DataTable('#vehicleAssigningTable', {
            scrollX: true,
            scrollY: 600
        });
        showLoadingOverlayOnTable("loaderId","vehicleAssigningTable");
        // error massage eka hide karanwa datatable wala
        // $.fn.dataTable.ext.errMode = 'none';

    }


    // new DataTable('#vehicleAssigningTable', {
    //     scrollX: true,
    //     scrollY: 200
    // });

}

// get customer name
const getCustomer = (dataOb) => {
    return dataOb.customer_id.company_name;
}

// get pickuplocation
const getPickupLoaction = (dataOb) => {
    return dataOb.pickup_locations_id.name;
}

// get delivery Location
const getDeliveryLoaction = (dataOb) => {
    return dataOb.delivery_locations_id.name;
}

// get contact person name
const getCustomerContactPersonName = (dataOb) => {
    return dataOb.booking_contact_person_name
}

// get contact person mobile no
const getCustomerContactPersonMobile = (dataOb) => {
    return dataOb.booking_contact_person_mobileno
}

// get vehicle type
const getVehicleTypeForBooking = (dataOb) => {
    return dataOb.vehicle_type_id.name;
}

// get via locations if available
const getViaLoaction = (dataOb) => {
    if (dataOb.locations.length > 0) {
        let locations = "";
        dataOb.locations.forEach((vialocation, index) => {
            if (dataOb.locations.length - 1 == index) {
                locations += vialocation.name;
            } else {
                locations += vialocation.name + ",<br>";
            }
        });
        return locations;
    } else {
        return " - "
    }

}

// distance eka ganna
const getDistance = (dataOb) => {
    return dataOb.distance + " km";
}

// get suppllier transport name
const getTransportNameForBooking = (dataOb) => {
    if (dataOb.vehicle_id != null) {
        return dataOb.vehicle_id.supplier_id.transportname;
    } else {
        return "";
    }
}

// get supplier name
const getSupplierDeatils = (dataOb) => {
    if (dataOb.vehicle_id != null) {
        return dataOb.vehicle_id.supplier_id.fullname;
    } else {
        return "";
    }
}

// get vehicle no
const getVehicleNoForBooking = (dataOb) => {
    if (dataOb.vehicle_id != null) {
        return "<p class='vehicleno'>" + dataOb.vehicle_id.vehicle_no + "</p>"
    } else {
        return "";
    }
}

// get assignng vehcle type
const getVehicleTypeOfVehicle = (dataOb) => {
    if (dataOb.vehicle_id != null) {
        return dataOb.vehicle_id.vehicle_type_id.name;
    } else {
        return "";
    }
}

// get driver
const getDriver = (dataOb) => {
    if (dataOb.vehicle_id != null) {
        return dataOb.driver_id.fullname;
    } else {
        return "";
    }
}

// get driver contact deatils
const getDriverContactDetails = (dataOb) => {
    if (dataOb.vehicle_id != null) {
        return dataOb.driver_id.mobileno;
    } else {
        return "";
    }
}

// get status
let getStatus = (dataOb) => {
    if (dataOb.booking_status_id.status == "Inproccess") {
        return "<div class = 'status-cell status-inprocess'> <span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Attend") {
        return "<div  class = 'status-cell status-attend'> <span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Arrived At Pickup") {
        return "<div  class = 'status-cell status-arrived-pickup'><span class='status-indicator'></span> " + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Departed From Pickup") {
        return "<div  class = 'status-cell status-departed-pickup'><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Arrived At Delivery") {
        return "<div  class = 'status-cell status-arrived-delivery '><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Departed From Delivery") {
        return "<div  class = 'status-cell status-departed'><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Cancelled") {
        return "<div  class = 'status-cell status-cancelled'><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
}

// assigning form open wena function eka
const vehicleAssigningForm = (dataOb) => {
    if (dataOb.booking_status_id.status == "Cancelled") {
        Swal.fire({
            title: "Opps?",
            text: "Can't Assigning a vehicle for cancelled booking",
            icon: "question",
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
        return;
    }

    if (dataOb.booking_status_id.status == "Inproccess" || dataOb.booking_status_id.status == "Attend") {
        console.log(dataOb);
        console.log(dataOb.vehicle_id);

        // vehicle details null neme nam refill wenna oni
        if (dataOb.vehicle_id != null) {
            selectVehicleNo.value = JSON.stringify(dataOb.vehicle_id);

            updateButton.style.display = "";
            submitButton.style.display = "none";
            let vehicleList = getServiceRequest("vehicle/vehiclebyvehiclegroupandvehicletype?customer_id="+dataOb.customer_id +"&vehicletype_id="+dataOb.vehicle_type_id);
            dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicleList, "vehicle_no")
            console.log(vehicleList);
        }


        // driver details nul neme nam refill wenna oni
        if (dataOb.driver_id != null) {
            selectdriver.value = JSON.stringify(dataOb.driver_id);

            updateButton.style.display = "";
            submitButton.style.display = "none";
        }

        $("#vehicleAssigning").modal('show');

    }

    booking = JSON.parse(JSON.stringify(dataOb));
    oldBooking = JSON.parse(JSON.stringify(dataOb));

//     -------------------------revenue----------------------------

    // select month eka filter karala gnnw
    let selectDateMonth = new Date(dateFrom.value).getMonth()
    // current month eka filter karala gnnw
    let currentMonth = new Date().getMonth();

    // current month ekai select karana month ekai samana nam table eka load wenawa
    if (selectDateMonth === currentMonth ){
        revenueTable.style.display =""

        let datalist = getServiceRequest('report/vehicleRevenueByVehicleType?customerId='+dataOb.customer_id.id +'&vehicleTypeId=' +dataOb.vehicle_type_id.id );

        let reportDatalist = new Array();


        for (const index in datalist) {
            let object = new Object();
            object.vehicle_no = datalist[index][0];
            object.distance = datalist[index][1].toFixed(2)+" KM";
            reportDatalist.push(object);

        }
        // Sort by distance descending(distance eka wadiya thiyena eka first)
        reportDatalist.sort((a, b) => b.distance - a.distance);


        let propertyList = [
            {propertyName: "vehicle_no", dataType: "string"},
            {propertyName: "distance", dataType: "string"}
        ]

        dataFillIntoTheReportTable(revenueViewTableBody, reportDatalist, propertyList);

    }else{

        revenueTable.style.display ="none"
        revenueViewTableBody.innerHTML ="";
    }

//     -------------------------revenue----------------------------

}

// datetime adding modal form open function
const datetimeFunctionForm = (dataOb) => {

    // cancelled karapu booking wala date time add karann ba
    if (dataOb.booking_status_id.status == "Cancelled") {
        Swal.fire({
            title: "Opps?",
            text: "Can't Add Date and times for cancelled booking",
            icon: "question",
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
        return;
    }
    if (dataOb.booking_status_id.status == "Inproccess") {
        Swal.fire({
            title: "Opps?",
            text: "Please Assigning a Vehicle",
            icon: "question",
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
        return;
    }

    if (dataOb.arrived_at_pickup_datetime != null) {
        pickupDateAndTime.value = dataOb.arrived_at_pickup_datetime;

        dateEditButton.style.display = "";
        dateAddButton.style.display = "none";
    }
    if (dataOb.departed_from_pickup_datetime != null) {
        departedPickupDateAndTime.value = dataOb.departed_from_pickup_datetime;

        pickupDateAndTime.disabled = true;

        dateEditButton.style.display = "";
        dateAddButton.style.display = "none";
    }
    if (dataOb.arrived_at_delivery_datetime != null) {
        arrivedDeliveryDateAndTime.value = dataOb.arrived_at_delivery_datetime;

        pickupDateAndTime.disabled = true;
        departedPickupDateAndTime.disabled = true;

        dateEditButton.style.display = "";
        dateAddButton.style.display = "none";
    }
    if (dataOb.departed_from_delivery_datetime != null) {
        departedDeliveryDateAndTime.value = dataOb.departed_from_delivery_datetime;

        pickupDateAndTime.disabled = true;
        departedPickupDateAndTime.disabled = true;
        arrivedDeliveryDateAndTime.disabled = true;

        dateEditButton.style.display = "";
        dateAddButton.style.display = "none";
    }

    //floating rate nam meter reading area eka hide wenawa
    if (dataOb.customer_agreement_id.package_id.package_type == "Floating Rate") {
        meterReadingDiv.style.display = "none"
    }
    if(dataOb.customer_agreement_id.package_id.package_type == "Fix Rate")  {
        meterReadingDiv.style.display = ""
    }

    textStartMeterReading.value = dataOb.strat_meter_reading;
    textEndtMeterReading.value = dataOb.end_meter_reading;

    console.log(dataOb);
    $("#datetimeAddingFormModal").modal('show');


    booking = JSON.parse(JSON.stringify(dataOb));
    oldBooking = JSON.parse(JSON.stringify(dataOb));



}

// data fill function for table
const fillDataIntoVehicleAssigningTable = (tableBodyId, dataList, propertyList, editFunction, datetimeFunctionForm) => {

    tableBodyId.innerHTML = "";

    dataList.forEach((dataob, index) => {
        let tr = document.createElement("tr");

        let tdIndex = document.createElement("td");
        tdIndex.innerHTML = parseInt(index) + 1;
        tr.appendChild(tdIndex);

        for (const property of propertyList) {
            let td = document.createElement("td");

            if (property.dataType == "string") {
                td.innerText = dataob[property.propertyName];
            }
            if (property.dataType == "function") {
                td.innerHTML = property.propertyName(dataob);
            }
            // status eke td ekata color eka set karaganna oni nisa hama status ekema td ekata id eka assigning karanaawa
            if (property.dataType == "function" && typeof property.propertyName === "function" && property.propertyName(dataob) === getStatus(dataob)) {
                if (dataob.booking_status_id.status == "Inproccess") {
                    td.id = "statusInprocess"
                }
                if (dataob.booking_status_id.status == "Attend") {
                    td.id = "statusAttend"
                }
                if (dataob.booking_status_id.status == "Arrived At Pickup") {
                    td.id = "statusArrivedAtPickup"
                }
                if (dataob.booking_status_id.status == "Departed From Pickup") {
                    td.id = "statusDepartedFromPickup"
                }
                if (dataob.booking_status_id.status == "Arrived At Delivery") {
                    td.id = "statusArrivedAtDelivery"
                }
                if (dataob.booking_status_id.status == "Departed From Delivery") {
                    td.id = "statusDepartedFromDelivery"
                }

                if (dataob.booking_status_id.status == "Cancelled") {
                    td.id = "statusCancelled"
                }
            }
            if (property.dataType == "datetime") {
                divdatetime = document.createElement("div");
                if (dataob[property.propertyName] != null) {

                    divdatetime.className = "datetimecolumn";
                    divdatetime.innerText = datetimeformat(dataob[property.propertyName]);
                    td.appendChild(divdatetime);
                }



                // Prevent modal from opening when clicking this column
                td.addEventListener("click", (event) => {
                    event.stopPropagation();
                });
                // datetime adding form open karanne methanin
                td.onclick = () => {
                    datetimeFunctionForm(dataob, index);
                    window['editOb'] = dataob;
                    window['editRowIndex'] = index;

                };
            }
            tr.appendChild(td);
        }

        // if you want to open button with clicking the row.you should change the button.onclick to tr.onclick
        tr.onclick = () => {
            editFunction(dataob, index);
            window['editOb'] = dataob;
            window['editRowIndex'] = index;
        };

        tableBodyId.appendChild(tr);

    });
}

// form errors check karana function eka
const checkFormError = () => {
    let errors = "";

    if (booking.driver_id == null) {
        errors = errors + "Please Select Driver Name..! \n";
    }
    if (booking.vehicle_id == null) {
        errors = errors + "Please Select Vehicle No..! \n";
    }
    return errors;
}

// form submittion button eka
const vehicleAssigningFormSubmitButton = () => {
    console.log(booking);
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
                let putResponse = httpServiceRequest("/vehicleassigning/update", "PUT", booking);
                if (putResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }                    });
                    search();
                    refreshVehicleAssigningForm();
                    $("#vehicleAssigning").modal("hide");
                } else {
                    Swal.fire({
                        title: "Failed to Submit....? ",
                        text: putResponse,
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
    console.log(booking);
}

// check form update function eka
const checkFormUpdates = () => {
    let updates = "";

    if (booking != null && oldBooking != null) {

        if (booking.vehicle_id.vehicle_no != oldBooking.vehicle_id.vehicle_no) {
            updates = updates + "Vehicle No changed ";
        }
        if (booking.driver_id.fullname != oldBooking.driver_id.fullname) {
            updates = updates + "Driver changed ";
        }
    }
    return updates;
}

// vehicle assigning form update button eka
const vehicleAssigningFormUpdate = () => {

    // check form error for required element
    let errors = checkFormError();
    if (errors == "") {
        let updates = checkFormUpdates();
        // updates not exit
        if (updates == "") {
            Swal.fire({
                title: "Opps?",
                text: "Nothing To Update?",
                icon: "question",
                allowOutsideClick: false,
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        } else {
            let userConfirm = Swal.fire({
                title: "Are you sure?",
                text: "You want to update this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Update it!",
                allowOutsideClick: false,
                customClass :{
                    cancelButton :'btn-3d btn-3d-cancel',
                    confirmButton :'btn-3d btn-3d-update'
                }
            }).then((userConfirm) => {
                if (userConfirm.isConfirmed) {
                    //call putt service
                    let putResponse = httpServiceRequest("/vehicleassigning/update", "PUT", booking);;
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        search();
                        refreshVehicleAssigningForm();
                        $("#vehicleAssigning").modal("hide");

                    } else {
                        Swal.fire({
                            title: "Failed to Submit....?",
                            text: putResponse,
                            icon: "question",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                    }
                } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire({
                        title: "Cancelled",
                        text: "Details not Updated!",
                        icon: "error",
                        allowOutsideClick: false,
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                }
            });
        }
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

const checkDateFormError = () => {
    let errors = "";
    if (booking.arrived_at_pickup_datetime == null) {
        errors = errors + "Please Select arrive date.";
    }
    return errors;
}

// date adding button finction
const dateAddingButton = () => {
    let errors = checkDateFormError();
    if (errors == "") {
        let customeResponse = httpServiceRequest("/vehicleassigning/arrivedatpickupdatetime", "PUT", booking);
        if (customeResponse == "ok") {
            Swal.fire({
                title: "Saved!",
                text: "Saved Successfully",
                icon: "success",
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
            search();
            refreshVehicleAssigningForm();
            $("#datetimeAddingFormModal").modal("hide");

        } else {
            Swal.fire({
                title: "Failed to Submit....?",
                text: customeResponse,
                icon: "question",
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        }
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

// check form update function eka
const checkDateFormUpdates = () => {
    let updates = "";

    if (booking != null && oldBooking != null) {

        if (booking.arrived_at_pickup_datetime != oldBooking.arrived_at_pickup_datetime) {
            updates = updates + "Arrived at Pickup date and time changed ";
        }
        if (booking.departed_from_pickup_datetime != oldBooking.departed_from_pickup_datetime) {
            updates = updates + " Departed from Pickup date and time changed";
        }
        if (booking.arrived_at_delivery_datetime != oldBooking.arrived_at_delivery_datetime) {
            updates = updates + " Arrived at Delivery date and time changed";
        }
        if (booking.departed_from_delivery_datetime != oldBooking.departed_from_delivery_datetime) {
            updates = updates + " Departed from Delivery date and time changed";
        }
        if (booking.strat_meter_reading != null) {
            if (booking.strat_meter_reading != oldBooking.strat_meter_reading) {
                updates = updates + " Meter Reading changed";
            }
        }
        if (booking.end_meter_reading != null) {
            if (booking.end_meter_reading != oldBooking.end_meter_reading) {
                updates = updates + " Distance changed";
            }
        }

    }
    return updates;
}

// date form form update button eka
const dateUpadteButton = () => {

    // check form error for required element
    let errors = checkFormError();
    if (errors == "") {
        let updates = checkDateFormUpdates();
        // updates not exit
        if (updates == "") {
            Swal.fire({
                title: "Opps?",
                text: "Nothing To Update?",
                icon: "question",
                allowOutsideClick: false,
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        } else {
            let userConfirm = Swal.fire({
                title: "Are you sure?",
                text: "You want to update this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Update it!",
                allowOutsideClick: false,
                customClass :{
                    cancelButton :'btn-3d btn-3d-cancel',
                    confirmButton :'btn-3d btn-3d-update'
                }

            }).then((userConfirm) => {
                if (userConfirm.isConfirmed) {
                    //call putt service
                    let putResponse = httpServiceRequest("/vehicleassigning/arrivedatpickupdatetime", "PUT", booking);;
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        search();
                        refreshVehicleAssigningForm();
                        $("#datetimeAddingFormModal").modal("hide");
                    } else {
                        Swal.fire({
                            title: "Failed to Submit....?",
                            text: putResponse,
                            icon: "question",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                    }
                } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire({
                        title: "Cancelled",
                        text: "Details not Updated!",
                        icon: "error",
                        allowOutsideClick: false,
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                }
            });
        }
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

// refresh form funtion eka
const refresh = () => {
    booking = new Object();

    datetimeAddingForm.reset();

    // let transportnames = getServiceRequest('/supplier/alldatabystatus');
    // dataFilIntoSelect(selectTransportName, "Select Transport Name", transportnames, "transportname")

    let vehicles = getServiceRequest('/vehicle/alldata');
    dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicles, "vehicle_no")

    let driver = getServiceRequest('/driver/alldata');
    dataFilIntoSelect(selectdriver, "Select Driver ", driver, "fullname")


    updateButton.style.display = "none";
    submitButton.style.display = "";

    dateEditButton.style.display = "none";
    dateAddButton.style.display = "";

    pickupDateAndTime.disabled = false;
    departedPickupDateAndTime.disabled = false;
    arrivedDeliveryDateAndTime.disabled = false;

    setDefault([selectVehicleNo,selectdriver,pickupDateAndTime,departedPickupDateAndTime,arrivedDeliveryDateAndTime,departedDeliveryDateAndTime,textStartMeterReading,textEndtMeterReading]);

    let customer = getServiceRequest('/customer/alldata');
    dataFilIntoSelect(selectCustomerSearch, "Select Customer ", customer, "company_name")


    dateFrom.value = ""
    dateTo.value = ""
}

const refreshVehicleAssigningForm = ()=>{
    let vehicleList = getServiceRequest("vehicle/vehiclebyvehiclegroupandvehicletype?customer_id="+booking.customer_id.id +"&vehicletype_id="+booking.vehicle_type_id.id);
    dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicleList, "vehicle_no")

    let driver = getServiceRequest('/driver/alldata');
    dataFilIntoSelect(selectdriver, "Select Driver ", driver, "fullname")

    updateButton.style.display = "none";
    submitButton.style.display = "";

    datetimeAddingForm.reset();
    setDefault([selectVehicleNo,selectdriver,pickupDateAndTime,departedPickupDateAndTime,arrivedDeliveryDateAndTime,departedDeliveryDateAndTime,textStartMeterReading,textEndtMeterReading]);

}

// select vehicle no with supplier transport name
// let transportNameElement = document.querySelector("#selectTransportName");
// transportNameElement.addEventListener("change", () => {
//
//     let supplier = JSON.parse(transportNameElement.value);
//     booking.vehicle_id = booking.vehicle_id || {}; // Ensure vehicle_id is initialized
//     booking.vehicle_id.supplier_id = JSON.parse(transportNameElement.value);
//
//     selectTransportName.classList.remove("is-invalid");
//     selectTransportName.classList.add("is-valid");
//
//     selectVehicleNo.disabled = false;
//
//     let vehicleBySupplier = getServiceRequest('/vehicle/bysupplierid?supplierid=' + supplier.id);
//     dataFilIntoSelect(selectVehicleNo, "Select Vehicle", vehicleBySupplier, "vehicle_no")
//
//     let driverBySupplier = getServiceRequest('/driver/bysupplierid?supplierid=' + supplier.id);
//     dataFilIntoSelect(selectdriver, "Select Driver", driverBySupplier, "fullname")
// });

// select driver name by suppliier id using vehicle id
selectVehicleNo.addEventListener("change", () => {

    let vehicle = JSON.parse(selectVehicleNo.value);
    console.log(vehicle);
    let supplier = vehicle.supplier_id;
    console.log(supplier);
    selectVehicleNo.classList.add("is-valid");
    booking.vehicle_id = JSON.parse(selectVehicleNo.value);


    let driverBySupplier = getServiceRequest('/driver/bysupplierid?supplierid=' + supplier.id);
    dataFilIntoSelect(selectdriver, "Select Driver ", driverBySupplier, "fullname")
});

//Alert Box Call function
Swal.isVisible();

// datetime format function
const datetimeformat = (selecttime) => {

    let date = new Date(selecttime);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    // Get month name abbreviated
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];

    // Format day and year
    const day = date.getDate();
    const year = date.getFullYear();

    // Return the formatted string
    return `${hours}:${minutes}\n ${month} ${day}, ${year}`;

}

// end meter reading validator
textEndtMeterReading.addEventListener("keyup", () => {

    const elementValue = textEndtMeterReading.value;
    const regExp = new RegExp("^[0-9]{2,15}$");

    if (elementValue != "") {
        if (regExp.test(elementValue)) {
            const startMeterReading = parseFloat(booking.strat_meter_reading);
            const endMeterReading = parseFloat(elementValue);

            // end meter reading eka vishala wenna oni start meter reading ekataw wada
            if (!isNaN(startMeterReading) && !isNaN(endMeterReading) && startMeterReading < endMeterReading) {
                textEndtMeterReading.classList.remove("is-invalid");
                textEndtMeterReading.classList.add("is-valid");
                booking.end_meter_reading = endMeterReading;
            } else {
                textEndtMeterReading.classList.remove("is-valid");
                textEndtMeterReading.classList.add("is-invalid");
                booking.end_meter_reading = null;
            }
        } else {
            textEndtMeterReading.classList.remove("is-valid");
            textEndtMeterReading.classList.add("is-invalid");
            booking.end_meter_reading = null;
        }
    } else {
        if (textEndtMeterReading.required) {
            textEndtMeterReading.classList.remove("is-valid");
            textEndtMeterReading.classList.add("is-invalid");
            booking.end_meter_reading = null;
        } else {
            textEndtMeterReading.classList.remove("is-invalid");
            booking.end_meter_reading = "";
        }
    }
    // customer package eka fix rate nam distance calculate wenna oni start meter reading eka saha end meter reading eke differences eken
    if (booking.strat_meter_reading != null && booking.end_meter_reading != null) {
        const distanceTotal = booking.end_meter_reading - booking.strat_meter_reading;
        console.log(`Distance: ${distanceTotal} km`);
        booking.distance = distanceTotal;
    } else {
        console.log("Start or end meter reading is missing.");
    }
})


const bookingListsForDate = getServiceRequest('/booking/alldata');

const fromDate = new Date("2024-03-24T01:03");
const toDate = new Date("2024-05-24T01:03");

const daterange = bookingListsForDate.filter(booking => {
    const pickupDate = new Date(booking.pickup_date_time);
    const deliveryDate = new Date(booking.delivery_date_time);

    return pickupDate >= fromDate && deliveryDate <= toDate;
});



//Common Validator
const validator = (element, dataPattern, object, property) => {
    const elementValue = element.value;
    const regExp = new RegExp(dataPattern);
    const ob = window[object];

    if (elementValue != "") {
        if (regExp.test(elementValue)) {
            element.classList.remove("is-invalid");
            element.classList.add("is-valid");
            ob[property] = elementValue;
        } else {
            element.classList.remove("is-valid");
            element.classList.add("is-invalid");
            ob[property] = null;
        }
    } else {
        if (element.required) {
            element.classList.remove("is-valid");
            element.classList.add("is-invalid");
            ob[property] = null;
        } else {
            element.classList.remove("is-invalid");
            ob[property] = "";
        }
    }
}

// date Validator for 
const dateElementValidator = (element, object, property) => {
    const elementValue = element.value;
    const ob = window[object];

    if (elementValue != "") {
        element.classList.remove("is-invalid");
        element.classList.add("is-valid");
        ob[property] = elementValue;
    } else {
        if (element.required) {
            element.classList.remove("is-valid");
            element.classList.add("is-invalid");
            ob[property] = null;
        } else {
            element.classList.remove("is-invalid");
            ob[property] = "";
        }
    }
}



// statice select Element Validator
const selectElementValidator = (element, object, property) => {
    const elementValue = element.value;
    const ob = window[object];

    if (elementValue != "") {
        element.classList.remove("is-invalid");
        element.classList.add("is-valid");
        ob[property] = elementValue;
    }else {
        if (element.required) {
            element.classList.remove("is-valid");
            element.classList.add("is-invalid");
            ob[property] = null;
        } else {
            element.classList.remove("is-invalid");
            ob[property] = "";
        }
    }
}

//Dynamic select validator
const selectDynamicElementValidator = (element, object, property) => {
    const elementValue = element.value;
    const ob = window[object];

    if (elementValue != "") {
        element.classList.remove("is-invalid");
        element.classList.add("is-valid");
        ob[property] = JSON.parse(elementValue);
    } else {
        if (element.required) {
            element.classList.remove("is-valid");
            element.classList.add("is-invalid");
            ob[property] = null;
        } else {
            element.classList.remove("is-invalid");
            ob[property] = "";
        }
    }
}

// --------------------------------date validators start-----------------------------------------------------------

// current date and time eken issraha date witharai pennanne
const currentdatetimevalidator = (elementId) =>{
    const currentDateTimeInput = document.getElementById(elementId);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    currentDateTimeInput.min = currentDateTime;

}

const customedatevalidator = (elementId,customedateId) =>{
    const currentDateTimeInput = document.getElementById(elementId);
    const customedateElement = document.getElementById(customedateId);

    // console.log("1"+customedateElement)
    // const customedate = new Date(customedateElement.value);
    // console.log("2"+customedate)
    // const year = customedate.getFullYear();
    // const month = String(customedate.getMonth() + 1).padStart(2, '0');
    // const day = String(customedate.getDate()).padStart(2, '0');
    // const hours = String(customedate.getHours()).padStart(2, '0');
    // const minutes = String(customedate.getMinutes()).padStart(2, '0');
    // const dateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    currentDateTimeInput.min = customedateElement.value;
}

// current date eken issraha date witharai pennanne
const currentdatevalidator = (elementId) =>{
    const currentDateInput = document.getElementById(elementId);
    // Date format[yyyy-mm-dd]
    const now = new Date();

    // year eka yyyy widihata ganna oni.
    const year = now.getFullYear();

    // get month eken enne apita [0-11].masa 12 k thiyen nisa api ekata 1 ekathu karagannawa.e wagama month eka mm widihata ganna oni.
    // month no eka 10 ta wada adu nam padStart(2, '0') karala ganna oni.10 ta wada wadiyen thibuneth padStart(2, '0') modify karanne na.
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // get day eka dd widihata ganna oni.
    // day no eka 10 ta wada adu nam padStart(2, '0') karala ganna oni.10 ta wada wadiyen thibuneth padStart(2, '0') modify karanne na.
    const day = String(now.getDate()).padStart(2, '0');

    // current date eka format karala ganna oni. yyyy-mm-dd widihata.
    const currentDate = `${year}-${month}-${day}`;

    currentDateInput.min = currentDate;
}

// date range validator
const dateRangeValidator = (end, start, object, property) => {
    const startDate = start;
    const endDate = end.value;
    console.log(startDate,endDate)
    const ob = window[object];

    if (endDate != "") {
        if (new Date(startDate) < new Date(endDate)) {
            end.classList.remove("is-invalid");
            end.classList.add("is-valid");
            ob[property] = endDate;
        } else {
            end.classList.remove("is-valid");
            end.classList.add("is-invalid");

            ob[property] = null;
        }
    } else {
        if (end.required) {
            end.classList.remove("is-valid");
            end.classList.add("is-invalid");
            ob[property] = null;
        } else {
            end.classList.remove("is-invalid");
            ob[property] = "";
        }
    }
}

// --------------------------------date validators end-----------------------------------------------------------


// image and file validator
const fileValidator = (elementId,object ,property,previewId,photoPreviewContainerId,uploadContainerId) =>{

    if(elementId.value != ""){

        // file eke tiyen data okkoma thiyenw(size eka,name eka)
        let file = elementId.files[0];
        let filereader = new FileReader();
        filereader.onload = (e)=>{
            previewId.src = e.target.result;
            window[object][property] = btoa(e.target.result);
            photoPreviewContainerId.style.display = 'block';
            uploadContainerId.style.display = 'none';

        }

        filereader.readAsDataURL(file);
    }

}

// create function for validation select2 library
const select2Validator = (element, object, property) => {

    const elementValue = element.value;
    const ob = window[object];

    if (elementValue !== "") {
        // Valid value: Set border to green and update the object property
        element.parentNode.children[2].children[0].children[0].style.borderColor = "#5DC983";
        element.parentNode.children[2].children[0].children[0].style.borderBottom = "4px solid #5DC983";
        element.parentNode.children[2].children[0].children[0].classList.add("form-select");
        element.parentNode.children[2].children[0].children[0].classList.add("is-valid");
        element.parentNode.children[2].children[0].children[0].classList.remove("is-invalid");

        ob[property] = JSON.parse(elementValue);
    } else {
        // Invalid value: Set border to red and reset the object property
        element.parentNode.children[2].children[0].children[0].style.border = "1px solid red";
        element.parentNode.children[2].children[0].children[0].classList.add("form-select");
        element.parentNode.children[2].children[0].children[0].classList.add("is-invalid");
        element.parentNode.children[2].children[0].children[0].classList.remove("is-valid");
        ob[property] = null; // Handle empty value appropriately
        // Set span background to red if required and empty

    }
};

//Dynamic datalist validator
// const dataListValidator = (element, object, property,array) => {
//     const elementValue = element.value;
//     const ob = window[object][property];
//
//     let extIndex = array.map( item => item.vehicle_no).indexOf(elementValue);
//     if (extIndex !== -1) {
//         element.classList.remove("is-invalid");
//         element.classList.add("is-valid");
//         ob[property] = array[extIndex];
//     }
//
// }

// ------------------------------------------------convert currency format--------------------------------------
// function for number convert to currency format

// input eke oninput attribute eke me function eka call karanawa.input eke value eka only two digits wlata limita karanwa saha number saha dot eka arenna anith ewa remove karawa.
const convertNoWithTwoDecimals =(inputElement) => {
    inputElement.value = inputElement.value
        .replace(/[^\d.]/g, '') // Remove non-digit and non-dot characters
        .replace(/^([^.]*\.)?([^.]*)$/, (m, g1, g2) => (g1 || '') + g2.replace(/\./g, '')) // Keep only the first dot
        .replace(/^(\d*\.\d{0,2}).*$/, '$1'); // Limit to two digits after decimal
}

// input eke focous out eke meka liyanwa.foucus out weddi auto convert wenawa currency format ekata eka number ekak nam witharai
const convertToCurrencyFormat =(inputElement) => {
    const number = parseFloat(inputElement.value);
    if (!isNaN(number)) {
        inputElement.value = new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    }
}

// input eka value eka widihata assigning karanwa without curency format
const assignValueToWithOutCurrencyFormat =(inputElement) => {
    const value = inputElement.value.replace(/[^0-9.]/g, '');
    inputElement.value = value;
}



//Common Validator
const validator = (element, dataPattern, object, property) => {
  // element eke value eka gnnawa
  const elementValue = element.value;
  // regex pattern eka gnnawa
  const regExp = new RegExp(dataPattern);
  // data object eka gnnawa
  const ob = window[object];

  // element value eka emptyda kiyala blanawa
  if (elementValue != "") {
    // element value eka regex pattern ekath ekka match karanwa
    //match wenawa nama invalid class thibunoth eka ayin wela valida class add wnea
    // match wenne nattan valida class thibunoth ewa ayin wela invalida class eka add wneawa
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
      element.classList.remove("is-valid");

      ob[property] = "";
    }
  }
};

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
};

// statice select Element Validator
const selectElementValidator = (element, object, property) => {
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
};

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
};
const selectMultipleDynamicElementValidator = (element, object, property) => {
  const selectedOptions = Array.from(element.selectedOptions);

  if (selectedOptions.length > 0) {
    element.classList.remove("is-invalid");
    element.classList.add("is-valid");
    // select karapu options tika array ekak widihata parse karala, object eke array property ekata danawa
    object[property] = selectedOptions.map((opt) => JSON.parse(opt.value));
  } else {
    if (element.required) {
      element.classList.remove("is-valid");
      element.classList.add("is-invalid");
      object[property] = null;
    } else {
      element.classList.remove("is-invalid");
      object[property] = [];
    }
  }
};

// tom select eka validation eka
const selectDynamicElementValidatorForTomSelect = (tomSelectInstance, object, property) => {
  // 1. Tom Select instance eken value eka gannawa
  const elementValue = tomSelectInstance.getValue();
  const nativeElement = tomSelectInstance.input; // Native select element eka
  const controlInput = tomSelectInstance.control; // User ta pena Tom Select main wrapper eka
  const ob = window[object];

  if (elementValue !== "") {
    // Native element ekai, Tom Select wrapper ekai dekama update karanawa
    nativeElement.classList.remove("is-invalid");
    nativeElement.classList.add("is-valid");
    controlInput.classList.remove("is-invalid");
    controlInput.classList.add("is-valid");

    ob[property] = JSON.parse(elementValue);
  } else {
    if (nativeElement.required) {
      nativeElement.classList.remove("is-valid");
      nativeElement.classList.add("is-invalid");
      controlInput.classList.remove("is-valid");
      controlInput.classList.add("is-invalid");

      ob[property] = null;
    } else {
      nativeElement.classList.remove("is-invalid");
      controlInput.classList.remove("is-invalid");

      ob[property] = "";
    }
  }
};


// --------------------------------date validators start-----------------------------------------------------------

// current date and time eken issraha date witharai pennanne
const currentdatetimevalidator = (elementId) => {
  const currentDateTimeInput = document.getElementById(elementId);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  currentDateTimeInput.min = currentDateTime;
};

const customedatevalidator = (elementId, customedateId) => {
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
};

// current date eken issraha date witharai pennanne
const currentdatevalidator = (elementId) => {
  const currentDateInput = document.getElementById(elementId);
  // Date format[yyyy-mm-dd]
  const now = new Date();

  // year eka yyyy widihata ganna oni.
  const year = now.getFullYear();

  // get month eken enne apita [0-11].masa 12 k thiyen nisa api ekata 1 ekathu karagannawa.e wagama month eka mm widihata ganna oni.
  // month no eka 10 ta wada adu nam padStart(2, '0') karala ganna oni.10 ta wada wadiyen thibuneth padStart(2, '0') modify karanne na.
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // get day eka dd widihata ganna oni.
  // day no eka 10 ta wada adu nam padStart(2, '0') karala ganna oni.10 ta wada wadiyen thibuneth padStart(2, '0') modify karanne na.
  const day = String(now.getDate()).padStart(2, "0");

  // current date eka format karala ganna oni. yyyy-mm-dd widihata.
  const currentDate = `${year}-${month}-${day}`;

  currentDateInput.min = currentDate;
};



// date range validator
const dateRangeValidator = (end, start, object, property) => {
  const startDate = start;
  const endDate = end.value;
  console.log(startDate, endDate);
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
};

// --------------------------------date validators end-----------------------------------------------------------

// image and file validator
const fileValidator = (elementId, object, property, previewId, photoPreviewContainerId, uploadContainerId) => {

  if (elementId.value != "") {

    let file = elementId.files[0];

    // ===== Maximum file size 2MB =====
    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {

      Swal.fire({
        icon: "warning",
        title: "File Too Large",
        text: "Please select an image smaller than 2 MB."
      });

      elementId.value = "";
      return;
    }

    // ===== File type validation =====
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Only JPG, JPEG, PNG and WEBP images are allowed."
      });

      elementId.value = "";
      return;
    }

    let filereader = new FileReader();

    filereader.onload = (e) => {

      previewId.src = e.target.result;

      window[object][property] = btoa(e.target.result);

      photoPreviewContainerId.style.display = "block";
      uploadContainerId.style.display = "none";
    };

    filereader.readAsDataURL(file);
  }
};

// create function for validation select2 library
const select2Validator = (element, object, property) => {
  const elementValue = element.value;
  const ob = window[object];

  const s2Container = element.nextElementSibling;
  let s2Selection = null;
  if (s2Container && s2Container.classList.contains("select2-container")) {
    s2Selection = s2Container.querySelector(".select2-selection");
  }

  if (elementValue !== "") {
    element.classList.remove("is-invalid");
    element.classList.add("is-valid");

    if (s2Selection) {
      s2Selection.style.setProperty("border-color", "#10b981", "important");
      s2Selection.style.setProperty("background-color", "#f0fdf4", "important");
      s2Selection.classList.remove("is-invalid", "select2-invalid");
      s2Selection.classList.add("is-valid", "select2-valid"); // <-- add karanna
    }

    ob[property] = JSON.parse(elementValue);
  } else {
    element.classList.remove("is-valid");
    element.classList.add("is-invalid");

    if (s2Selection) {
      s2Selection.style.setProperty("border-color", "#dc3545", "important");
      s2Selection.style.setProperty("background-color", "#fef2f2", "important");
      s2Selection.classList.remove("is-valid", "select2-valid"); // <-- remove karanna
      s2Selection.classList.add("is-invalid", "select2-invalid");
    }

    ob[property] = null;
  }
};

// proprty eka array eka nam meka use karanwa
const select2ValidatorForArrayProperty = (element, object, property) => {
  const elementValue = element.value;
  const ob = window[object];

  const s2Container = element.nextElementSibling;
  let s2Selection = null;
  if (s2Container && s2Container.classList.contains("select2-container")) {
    s2Selection = s2Container.querySelector(".select2-selection");
  }

  if (elementValue !== "") {
    element.classList.remove("is-invalid");
    element.classList.add("is-valid");

    if (s2Selection) {
      s2Selection.style.setProperty("border-color", "#10b981", "important");
      s2Selection.style.setProperty("background-color", "#f0fdf4", "important");
      s2Selection.classList.remove("is-invalid", "select2-invalid");
      s2Selection.classList.add("is-valid", "select2-valid"); // <-- add karanna
    }

    ob[property].push(JSON.parse(elementValue));
  } else {
    element.classList.remove("is-valid");
    element.classList.add("is-invalid");

    if (s2Selection) {
      s2Selection.style.setProperty("border-color", "#dc3545", "important");
      s2Selection.style.setProperty("background-color", "#fef2f2", "important");
      s2Selection.classList.remove("is-valid", "select2-valid"); // <-- remove karanna
      s2Selection.classList.add("is-invalid", "select2-invalid");
    }

    ob[property] = null;
  }
}


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
const convertNoWithTwoDecimals = (inputElement) => {
  inputElement.value = inputElement.value
    .replace(/[^\d.]/g, "") // Remove non-digit and non-dot characters
    .replace(
      /^([^.]*\.)?([^.]*)$/,
      (m, g1, g2) => (g1 || "") + g2.replace(/\./g, ""),
    ) // Keep only the first dot
    .replace(/^(\d*\.\d{0,2}).*$/, "$1"); // Limit to two digits after decimal
};

// input eke focous out eke meka liyanwa.foucus out weddi auto convert wenawa currency format ekata eka number ekak nam witharai
const convertToCurrencyFormat = (inputElement) => {
  const number = parseFloat(inputElement.value);
  if (!isNaN(number)) {
    inputElement.value = new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  }
};

// input eka value eka widihata assigning karanwa without curency format
const assignValueToWithOutCurrencyFormat = (inputElement) => {
  const value = inputElement.value.replace(/[^0-9.]/g, "");
  inputElement.value = value;
};


// image vaildation function eka (2 mb walata wada wadi wenna ba)
const validateImageSize = (inputElement, maxSizeMB = 2) => {

  if (inputElement.files.length === 0) {
    return true;
  }

  const file = inputElement.files[0];
  const maxSize = maxSizeMB * 1024 * 1024;

  if (file.size > maxSize) {

    Swal.fire({
      icon: "warning",
      title: "File Too Large",
      text: `Please select an image smaller than ${maxSizeMB} MB.`
    });

    inputElement.value = "";

    $("#photoPreviewVehicle").hide();
    $("#previewImageVehicle").attr("src", "");

    return false;
  }

  return true;
}
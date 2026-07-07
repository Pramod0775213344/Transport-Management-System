

const setDefault = (element) => {
    element.forEach(element => {
        element.classList.remove("is-invalid");
        element.classList.remove("is-valid");
    });
}

// define function for get service request

const getServiceRequest = (url) =>{

    let getServiceResponse = [];

  
    $.ajax({

        url: url,//the url to which the request is sent
        type: 'GET',//http method to use for the request(get or post)
        contentType: 'json',
        async: false,
        success: function (response) {

            console.log('Success', response);
            getServiceResponse = response

        },
        error: function (xhr, status, error) {

            console.log('Error',url, error);

        }
    });
    return getServiceResponse;  
}

// define function for post put and delete servicers request

const httpServiceRequest = (url,method,dataOb) =>{

    let httpServiceResponse = [];

  
    $.ajax({

        url: url,//the url to which the request is sent
        type: method,//http method to use for the request(put.delete or post)
        contentType: 'application/json',
        data : JSON.stringify(dataOb),//dataob eka string widihata backend ekata pass karanawa
        async: false,//data enkn bln innwa
        success: function (response) {

            console.log('Success', response);
            httpServiceResponse = response

        },
        error: function (xhr, status, error) {

            console.log('Error',url, error);

        }
    });
    return httpServiceResponse;  
}

const removePhoto= (photoPreviewContainerId,previewId,uploadContainerId) => {

    photoPreviewContainerId.style.display = 'none'; // Hide the preview
    photoPreviewContainerId.classList.remove("d-flex", "flex-column", "align-items-center");//class list  remove karanna oni
    previewId.src = '';
    uploadContainerId.style.display = 'block'; // Show the upload container
    photoPreviewContainerId.style.display = 'none'; // Hide the preview container
    // Optionally hide the preview container:
    // document.getElementById('photoPreview').style.display = 'none';
}

// datetime format
// const datetimeformat = (selecttime) => {
//
//     let date = new Date(selecttime);
//
//     const hours = date.getHours().toString().padStart(2, "0");
//     const minutes = date.getMinutes().toString().padStart(2, "0");
//
//     // Get month name abbreviated
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     const month = months[date.getMonth()];
//
//     // Format day and year
//     const day = date.getDate();
//     const year = date.getFullYear();
//
//     // Return the formatted string
//     return `${hours}:${minutes}\n ${month} ${day}, ${year}`;
//
// }

const dateformat = (selecttime) => {

    let date = new Date(selecttime);

    // Get month name abbreviated
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];

    // Format day and year
    const day = date.getDate();
    const year = date.getFullYear();

    // Return the formatted string
    return `${month} ${day}, ${year}`;

}
window.addEventListener('load', () => {
    refreshForgetPasswordForm();
});

const refreshForgetPasswordForm = () => {
    user = new Object();

}


const checkFormError = () => {
    let error = "";
    // check required element
    if (user.email == null || user.email == "") {
        error += "Email is required\n";
    }
    return error;
}

// email check button and sen otp function
const  sendOtp = () => {
        console.log(user);
        // check form error for required element
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

            }). then((userConfirm) => {
                if (userConfirm.isConfirmed) {
                    //call post service
                    let postResponse = httpServiceRequest("/forgetpassword/email", "PUT", user);
                    console.log(user)
                    if (postResponse == "ok") {
                        Swal.fire({
                            title: "Saved!",
                            text: "Saved Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        emailFormDiv.style.display = "none";
                        otpFormDiv.style.display = "block"
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
                text: errors ,
                icon: 'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        }
        console.log(user);
};

// check otp from database
const  EnteredOtpButton = () => {
    console.log(user);
    // check form error for required element
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

        }). then((userConfirm) => {
            if (userConfirm.isConfirmed) {
                //call post service
                let postResponse = httpServiceRequest("/forgetpassword/checkotp", "PUT", user);
                console.log(user)
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    otpFormDiv.style.display = "none";
                    passwordChangeDiv.style.display = "";
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
            text: errors ,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
    }
    console.log(user);
};

// password validator for retype password
const retypePasswordValidator = () => {

    if (textNewPassword.value == textRetypePassword.value) {
        user.password = textNewPassword.value;
        textRetypePassword.classList.remove("is-invalid");
        textRetypePassword.classList.add("is-valid");
        console.log("password match")

    } else {
        user.password = null;
        textRetypePassword.classList.remove("is-valid");
        textRetypePassword.classList.add("is-invalid");
        console.log("password not match")
    }
}

//submition of password
const  submitNewPassword = () => {
    console.log(user);
    // check form error for required element
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

        }). then((userConfirm) => {
            if (userConfirm.isConfirmed) {
                //call post service
                let postResponse = httpServiceRequest("/forgetpassword/update", "PUT", user);
                console.log(user)
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    window.location.href='/login';
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
            text: errors ,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
    }
    console.log(user);
};

// const validator = (element, dataPattern, object, property) => {
//     const elementValue = element.value;
//     const regExp = new RegExp(dataPattern);
//     const ob = window[object];
//
//     if (elementValue != "") {
//         if (regExp.test(elementValue)) {
//             element.classList.remove("is-invalid");
//             element.classList.add("is-valid");
//             ob[property] = elementValue;
//         } else {
//             element.classList.remove("is-valid");
//             element.classList.add("is-invalid");
//             ob[property] = null;
//         }
//     } else {
//         if (element.required) {
//             element.classList.remove("is-valid");
//             element.classList.add("is-invalid");
//             ob[property] = null;
//         } else {
//             element.classList.remove("is-invalid");
//             ob[property] = "";
//         }
//     }
// }

//Alert Box Call function
Swal.isVisible();
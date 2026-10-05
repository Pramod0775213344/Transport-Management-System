// Initialize profile creation form on page load
window.addEventListener("load", () => {
    setTimeout(() => {
        try {
            refreshForm();
        } catch (error) {
            console.error("Error during profile creation initialization:", error);
        }
    }, 100);
});


const checkFormError = () => {
    let errors = "";

    if (profile.fullname == null) {
        errors = errors + "Please enter the Full Name. <br>";
    }
    if (profile.callingname == null) {
        errors = errors + "Please enter the Calling Name. <br>";
    }
    if (profile.mobile_no == null) {
        errors = errors + "Please enter the Mobile Number. <br>";
    }
    if (profile.address == null) {
        errors = errors + "Please enter the Address. <br>";
    }
    if (profile.designation == null) {
        errors = errors + "Please enter the Designation. <br>";
    }
    return errors;
};

const refreshForm = () => {

    profileCreateForm.reset();

    window.profile = new Object();

    setDefault([
        profileFullName,
        profileAddress,
        profileNic,
        profileCivilStatus,
        profileEmail,
        profileMobileNo,
        profileDesignation,
    ]);
};

// submit button of the form
const profileFormSubmit = () => {
    console.log(profile);

    // user email eka bind karnawa profile object ekata
    profile.email = profileEmail.value;

    // user id eka bind karnawa profile object ekata

    const userId = getServiceRequest("/loggeduserdetails").id;
    const user = getServiceRequest("/user/byid?userid=" + userId);
    if (user) {
        profile.user_id = JSON.parse(JSON.stringify(user));
    }
    // check form error for required element

    let errors = checkFormError();
    if (errors == "") {
        // errors not exit
        //need to get user confirmation

        let userConfirm = Swal.fire({
            title: "Confirm Profile Update",
            text: "Are you sure you want to update this profile?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Update Profile",
            cancelButtonText: "Cancel",
            allowOutsideClick: false,
            customClass: {
                cancelButton: "btn btn-1",
                confirmButton: "btn btn-2",
                popup: "swal2-border-radius",
            },
        }).then((userConfirm) => {
            if (userConfirm.isConfirmed) {
                //call post service
                let postResponse = httpServiceRequest("/profile/create", "POST", profile);
                console.log(profile);

                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Profile Successfully Updated!",
                        text: "New profile record has been successfully created.",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: {
                            popup: "swal2-border-radius",
                        },
                    });
                    // Profile created successfully, reload after confirmation
                    setTimeout(() => {
                    //    logout karanwa userwa
                    window.location.href = "/logout";
                    }, 2000);
                } else {
                    Swal.fire({
                        title: "Update Failed",
                        text: postResponse,
                        icon: "error",
                        customClass: {
                            confirmButton: "btn btn-1",
                            popup: "swal2-border-radius",
                        },
                    });
                }
            } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Details not Saved!",
                    icon: "error",
                    customClass: {
                        confirmButton: "btn btn-1",
                        popup: "swal2-border-radius",
                    },
                });
            }
        });
    } else {
        Swal.fire({
            title: "Update Incomplete",
            html: `<div class="text-start">${errors}</div>`,
            icon: "error",
            confirmButtonText: "OK",
            allowOutsideClick: false,
            customClass: {
                confirmButton: "btn btn-1",
                popup: "swal2-border-radius",
            },
        });
    }
    console.log(profile);
};


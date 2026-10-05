document.addEventListener('DOMContentLoaded', function () {
    loadCustomerSettings();

    // Hide the loading overlay
    if (typeof finishPageLoading === 'function') {
        finishPageLoading();
    }
});

const loadCustomerSettings = () => {
    deleteButton.style.visibility = 'hidden';
    loggedInUser = getServiceRequest("/loggeduserdetails");
    console.log(loggedInUser);

    seletedprofile = getServiceRequest("/profile/buyuser?userid=" + loggedInUser.id);
    console.log(seletedprofile);

    // picture eka set karanna
    if (loggedInUser.user_photo != null || seletedprofile.profile_photo != null) {
        previewImage.src = atob(loggedInUser.user_photo);
        photoPreview.style.display = "block";
        uploadContainer.style.display = "none";
    } else {
        previewImage.src = "/images/user.png";
        photoPreview.style.display = "none";
        uploadContainer.style.display = "flex";
    }
    customerFullName.value = seletedprofile.fullname || '';
    customerCallingName.value = seletedprofile.callingname || '';
    customerDesignation.value = seletedprofile.designation || '';
    customerContact.value = seletedprofile.mobile_no || '';
    customerAddress.value = seletedprofile.address || '';

    displayEmail.innerText = seletedprofile.email || 'N/A';
    displayContact.innerText = seletedprofile.mobile_no || 'N/A';

    customerFullName.disabled = true;
    customerCallingName.disabled = true;
    customerDesignation.disabled = true;
    customerContact.disabled = true;
    customerAddress.disabled = true;



}

// edit mode on karana function eka
const editModeOn = () => {

    profile = JSON.parse(JSON.stringify(seletedprofile));
    oldprofile = JSON.parse(JSON.stringify(seletedprofile));

    customerFullName.disabled = false;
    customerCallingName.disabled = false;
    customerDesignation.disabled = false;
    customerContact.disabled = false;
    customerAddress.disabled = false;

    // id kihipaya ekama class eka remove karanna oni
    customerFullName.classList.remove('text-muted');
    customerCallingName.classList.remove('text-muted');
    customerDesignation.classList.remove('text-muted');
    customerContact.classList.remove('text-muted');
    customerAddress.classList.remove('text-muted');

    // Update button properly
    editButtonProfile.style.display = 'none';
    saveButtonProfile.style.display = '';
    deleteButton.style.visibility = 'visible';

    // Photo ekak thiyenawanam witharak delete button eka edit mode ekedi pennanna
    const photoData = seletedprofile.profile_photo || loggedInUser.user_photo;
    deleteButton.style.visibility = photoData ? '' : 'hidden';

}

const buttonCancel = () => {
    refreshForm();
    deleteButton.style.visibility = 'hidden';   // cancel karaddi hide
    loadCustomerSettings();
    editButtonProfile.style.display = '';
    saveButtonProfile.style.display = 'none';


    // id kihipaya ekama class eka remove karanna oni
    customerFullName.classList.add('text-muted');
    customerCallingName.classList.add('text-muted');
    customerDesignation.classList.add('text-muted');
    customerContact.classList.add('text-muted');
    customerAddress.classList.add('text-muted');

    setDefault([customerFullName,
        customerCallingName,
        customerDesignation,
        customerContact,
        customerAddress])
}

const refreshForm = () => {
    profile = new Object();

    setDefault([customerFullName,
        customerCallingName,
        customerDesignation,
        customerContact,
        customerAddress])

    deleteButton.style.visibility = 'hidden';
}

const checkFormError = () => {
    let errors = "";

    if (profile.fullname == null) {
        errors = errors + "Please enter the Full Name. <br>";
        customerFullName.classList.add("is-invalid");
    }
    if (profile.callingname == null) {
        errors = errors + "Please enter the Calling Name. <br>";
        customerCallingName.classList.add("is-invalid");
    }
    if (profile.mobile_no == null) {
        errors = errors + "Please enter the Contact Number. <br>";
        customerContact.classList.add("is-invalid");
    }
    if (profile.address == null) {
        errors = errors + "Please enter the Address. <br>";
        customerAddress.classList.add("is-invalid");
    }
    if (profile.designation == null) {
        errors = errors + "Please enter the Designation. <br>";
        customerDesignation.classList.add("is-invalid");
    }
    return errors;
}

const checkFormUpdates = () => {
    let updates = "";
    if (profile != null && oldprofile != null) {
        if (profile.fullname != oldprofile.fullname) {
            updates = updates + "Full Name updated. <br>";
        }
        if (profile.callingname != oldprofile.callingname) {
            updates = updates + "Calling Name updated. <br>";
        }
        if (profile.mobile_no != oldprofile.mobile_no) {
            updates = updates + "Contact Number updated. <br>";
        }
        if (profile.address != oldprofile.address) {
            updates = updates + "Address updated. <br>";
        }
        if (profile.designation != oldprofile.designation) {
            updates = updates + "Designation updated. <br>";
        }
        if (profile.profile_photo != oldprofile.profile_photo) {
            updates = updates + "Profile Photo updated. <br>";
        }
    }

    return updates;

}
const buttonSubmit = () => {
    console.log(profile);
    let errors = checkFormError();
    if (errors == "") {
        let updates = checkFormUpdates();
        // updates not exit
        if (updates == "") {
            Swal.fire({
                title: "Nothing to Update",
                text: "No changes were detected in the employee details.",
                icon: "info",
                allowOutsideClick: false,
                customClass: {
                    confirmButton: "btn btn-1",
                    popup: "swal2-border-radius",
                },
            });
        } else {
            let userConfirm = Swal.fire({
                title: "Confirm Profile Update",
                text: "Are you sure you want to update your profile details?",
                icon: "warning",
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
                    //call putt service
                    let putResponse = httpServiceRequest("/profile/update", "PUT", profile);
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Profile Updated!",
                            text: "Your profile details have been successfully updated.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                            customClass: {
                                popup: "swal2-border-radius",
                            },
                        });
                        buttonCancel();
                        refreshForm();
                        window.location.reload();
                    } else {
                        Swal.fire({
                            title: "Update Failed",
                            text: putResponse,
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
                        text: "Details not Updated!",
                        icon: "error",
                        allowOutsideClick: false,
                        customClass: {
                            confirmButton: "btn btn-1",
                            popup: "swal2-border-radius",
                        },
                    });
                }
            });
        }
    } else {
        Swal.fire({
            title: "Update Validation Error",
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
}

// remove photo function
const removeProfilePhoto = () => {
    profile.profile_photo = null;
    filePhotoEmployee.value = null;
    photoPreview.style.display = "none";
    uploadContainer.style.display = "flex";
};




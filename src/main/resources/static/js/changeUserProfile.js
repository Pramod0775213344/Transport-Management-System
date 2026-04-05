window.addEventListener("load", () => {
  refreshUserEditForm();
});

// refresh user edit form
const refreshUserEditForm = () => {
  logedUser = getServiceRequest("/loggeduserdetails");
  oldLogUser = getServiceRequest("/loggeduserdetails");

  if (logedUser.user_photo !== null) {
    changeUserPreviewImage.src = atob(logedUser.user_photo);
  } else {
    changeUserPreviewImage.src = "/images/user.png";
  }
  textChangeUsername.value = logedUser.username;
  textUserChangeEmail.value = logedUser.email;

  changeUserPreviewImage.disabled = true;
  textChangeUsername.disabled = true;
  textUserChangeEmail.disabled = true;
  textUserChangePassword.disabled = true;

  changeUserPhotoPreview.style.display = "block";
  changeUserPhotoRemoveButton.style.display = "none";
  changeUserPhotoPreview.classList.add(
    "d-flex",
    "flex-column",
    "align-items-center",
  );

  filePhotoUser.value = "";

  changeUserUploadContainer.style.display = "none";
  submitUserButton.style.display = "none";
  editButton.style.display = "";

  setDefault([
    textChangeUsername,
    textUserChangeEmail,
    textUserChangePassword,
    textUserChangeNewPassword,
    textUserChangeRetypeNewPassword,
  ]);

  textUserChangePassword.value = "";
  textUserChangeNewPassword.value = "";
  textUserChangeRetypeNewPassword.value = "";

  //     conatiner deka display none karawna
  newPasswordContainer.style.display = "none";
  retypePasswordContainer.style.display = "none";
};

// edit karana field tika active karanwaw
const ActiveEdirField = () => {
  // check form error for required element
  changeUserPreviewImage.disabled = false;
  textChangeUsername.disabled = false;
  textUserChangeEmail.disabled = false;
  textUserChangePassword.disabled = false;

  changeUserPhotoPreview.style.display = "";
  changeUserPhotoPreview.classList.remove(
    "d-flex",
    "flex-column",
    "align-items-center",
  );
  changeUserPhotoRemoveButton.style.display = "";

  changeUserUploadContainer.style.display = "";
  submitUserButton.style.display = "";
  editButton.style.display = "none";

  newPasswordContainer.style.display = "";
  retypePasswordContainer.style.display = "";
};

// password validator for retype password
const userRetypePasswordValidator = () => {
  if (
    textUserChangeNewPassword.value == textUserChangeRetypeNewPassword.value
  ) {
    logedUser.newpassword = textUserChangeNewPassword.value;
    textUserChangeRetypeNewPassword.classList.remove("is-invalid");
    textUserChangeRetypeNewPassword.classList.add("is-valid");
  } else {
    logedUser.newpassword = null;
    textUserChangeRetypeNewPassword.classList.remove("is-valid");
    textUserChangeRetypeNewPassword.classList.add("is-invalid");
  }
};

// check form updates
const checkFormChangers = () => {
  let changers = "";

  if (logedUser != null && oldLogUser != null) {
    if (logedUser.username != oldLogUser.username) {
      changers = changers + "Username is changed";
    }
    if (logedUser.user_photo != oldLogUser.user_photo) {
      changers = changers + "User Photo is changed";
    }
    if (logedUser.email != oldLogUser.email) {
      changers = changers + "email is changed";
    }
    if (logedUser.newpassword != oldLogUser.oldpassword) {
      changers = changers + "password is changed";
    }
  }
  return changers;
};

// update button of the user form
const userChangeFormSave = () => {
  // check form error for required element
  let changers = checkFormChangers();
  console.log(logedUser);
  // updates not exit
  if (changers == "") {
    Swal.fire({
      title: "Nothing to Update",
      text: "No changes were detected in your profile details.",
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
        let putResponse = httpServiceRequest(
          "/changeuserdetails/insert",
          "POST",
          logedUser,
        );
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
          document.getElementById("loadingOverlay").style.display = "flex"; // Show

          setTimeout(function () {
            window.location.href = "/logout";
          }, 1000);
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
};

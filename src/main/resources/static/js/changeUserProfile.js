window.addEventListener("load", () => {
  refreshUserEditForm();
});


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

// ============== passowrd change karana eke submit ==============================
// update button of the user form
const changePassword = () => {
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
      title: "Confirm Password Change",
      text: "Are you sure you want to change your password?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Change Password",
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
            title: "Password Changed!",
            text: "Your password has been successfully changed.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          window.location.href = "/logout";
          ;
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
          text: "Password change cancelled!",
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
// ============== end passowrd change karana eke submit ==============================



// ============== password validation =============================================
// Password Change Functions
const validatePasswordStrength = () => {
  const password = document.getElementById('newPassword').value;
  const matchStatus = document.getElementById('matchStatus');

  if (password.length < 6) {
    matchStatus.innerHTML = '<i class="fa-solid fa-exclamation-circle"></i> Password must be at least 6 characters';
    matchStatus.style.color = '#dc3545';
  } else {
    matchStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Password strength: Good';
    matchStatus.style.color = '#28a745';
  }
}

const validatePasswordMatch = () => {
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  const matchStatus = document.getElementById('matchStatus');

  if (newPass && confirmPass) {
    if (newPass === confirmPass) {
      matchStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Passwords match';
      matchStatus.style.color = '#28a745';
    } else {
      matchStatus.innerHTML = '<i class="fa-solid fa-exclamation-circle"></i> Passwords do not match';
      matchStatus.style.color = '#dc3545';
    }
  }
}
// ============= end password validation =========================================



//  ================== email validation ==============================================
// Email Change Functions
const validateEmailFormat = () => {
  const email = document.getElementById('newEmail').value;
  const emailValidStatus = document.getElementById('emailValidStatus');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email && !emailRegex.test(email)) {
    emailValidStatus.innerHTML = '<i class="fa-solid fa-exclamation-circle"></i> Invalid email format';
    emailValidStatus.style.color = '#dc3545';
  } else if (email) {
    emailValidStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Email format is valid';
    emailValidStatus.style.color = '#28a745';
  } else {
    emailValidStatus.innerHTML = '';
  }
}

const validateEmailMatch = () => {
  const newEmail = document.getElementById('newEmail').value;
  const confirmEmail = document.getElementById('confirmEmail').value;
  const emailMatchStatus = document.getElementById('emailMatchStatus');

  if (newEmail && confirmEmail) {
    if (newEmail === confirmEmail) {
      emailMatchStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Emails match';
      emailMatchStatus.style.color = '#28a745';
    } else {
      emailMatchStatus.innerHTML = '<i class="fa-solid fa-exclamation-circle"></i> Emails do not match';
      emailMatchStatus.style.color = '#dc3545';
    }
  }
}
//  ================== end email validation ==============================================



// =================== email chaneg eke submit ========================================
// email eka saha username eka change karana function eka
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
            title: "Email And Username Updated!",
            text: "Your profile details have been successfully updated.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          window.location.href = "/logout";
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
// ==================== end email change submit =======================================



// ================== reset functions email and pasword ===============================
// rest password form
const resetPasswordForm = () => {
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";

  document.getElementById('matchStatus').innerHTML = '';

  setDefault([
    currentPassword,
    newPassword,
    confirmPassword,
  ]);
}

// rest email change form
const resetEmailChangeForm = () => {

  newEmail.value = "";
  newUsername.value = "";
  document.getElementById('emailValidStatus').innerHTML = '';

  setDefault([
    newEmail,
    newUsername,
  ]);
}
// ================= end reset function email & password ==================================


// ================= refresh function =======================================================
// refresh user edit form
const refreshUserEditForm = () => {
  logedUser = getServiceRequest("/loggeduserdetails");
  oldLogUser = getServiceRequest("/loggeduserdetails");

  currentEmail.value = logedUser.email;
  currentUsername.value = logedUser.username;

};
// ================= end  refrsh function ==================================================




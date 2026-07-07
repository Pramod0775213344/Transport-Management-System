document.addEventListener('DOMContentLoaded', function () {
    loadCustomerSettings();

    // Hide the loading overlay
    if (typeof finishPageLoading === 'function') {
        finishPageLoading();
    }
});

const loadCustomerSettings = () => {
    const loggedInUser = getServiceRequest("/loggeduserdetails");
    console.log(loggedInUser);

    const profile = getServiceRequest("/profile/buyuser?userid=" + loggedInUser.id);
    console.log(profile);

    customerFullName.value = profile.fullname || '';
    customerCallingName.value = profile.callingname || '';
    customerDesignation.value = profile.designation || '';
    customerContact.value = profile.mobile_no || '';
    customerAddress.value = profile.address || '';

    displayEmail.innerText = profile.email || 'N/A';
    displayContact.innerText = profile.mobile_no || 'N/A';

    customerFullName.disabled = true;
    customerCallingName.disabled = true;
    customerDesignation.disabled = true;
    customerContact.disabled = true;
    customerAddress.disabled = true;
}

// edit mode on karana function eka
const editModeOn = () => {
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
}

const buttonCancel = () => {
    loadCustomerSettings();
    editButtonProfile.style.display = '';
    saveButtonProfile.style.display = 'none';

    
    // id kihipaya ekama class eka remove karanna oni
    customerFullName.classList.add('text-muted');
    customerCallingName.classList.add('text-muted');
    customerDesignation.classList.add('text-muted');
    customerContact.classList.add('text-muted');
    customerAddress.classList.add('text-muted');
}

const refreshForm = () => {

    profile = new Object();
}

const buttonSubmit = () => {
    const profileData = {
        id: getServiceRequest("/loggeduserdetails").id,
        fullname: customerFullName.value,
        callingname: customerCallingName.value,
        mobile_no: customerContact.value,
        address: customerAddress.value
    };

    postServiceRequest("/profile/update", profileData, function (response) {
        if (response.success || response.status === 'success') {
            alert('Profile updated successfully');
            loadCustomerSettings();
            editButtonProfile.style.display = '';
            saveButtonProfile.style.display = 'none';
        } else {
            alert('Error updating profile');
        }
    });
}




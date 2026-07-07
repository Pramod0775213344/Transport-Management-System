window.addEventListener("load", () => {

    loadPrivilageTable();
    refreshForm();

});


// load data into the table with dbms
const loadPrivilageTable = () => {

    privilage =getServiceRequest("/privilage/alldata");

    properties = [
        { propertyName: getRole, dataType: "function" },
        { propertyName: getModule, dataType: "function" },
        { propertyName: getSelect, dataType: "function" },
        { propertyName: getInsert, dataType: "function" },
        { propertyName: getUpdate, dataType: "function" },
        { propertyName: getDelete, dataType: "function" }
    ];

    dataFillIntoTheTable(privilageTableBody, privilage, properties, privilageView,privilageEdit, privilageDelete, true);


    $("#privilageTable").dataTable({
        "createdRow": function(row, data, dataIndex) {
            $(row).find("td").css({
                "text-align": "center",
                "height": "80px"
            });
        },
        "headerCallback": function(thead, data, start, end, display) {
            $(thead).find("th").css({
                "text-align": "center",
                "padding": "20px"
            });
        }
    });

};

// role function
const getRole = (dataOb) => {
    return dataOb.role_id.name;
};

// module function
const getModule = (dataOb) => {
    return dataOb.module_id.name;
}

// Select permisson function
const getSelect = (dataOb) => {

    if (dataOb.privi_select) {
        return "&#9989"
    } else {
        return "&#10060";
    }
}

// Insert permisson function
const getInsert = (dataOb) => {

    if (dataOb.privi_insert) {
        return "&#9989"
    } else {
        return "&#10060";
    }
}

// update permisson function
const getUpdate = (dataOb) => {

    if (dataOb.privi_update) {
        return "&#9989"
    } else {
        return "&#10060";
    }
}

// delete permisson function
const getDelete = (dataOb) => {
    if (dataOb.privi_delete) {
        return "&#9989"
    } else {
        return "&#10060";
    }
}

// view button of the table
const privilageView = (dataOb) => {
    console.log(dataOb);
    tdRole.innerText = dataOb.role_id.name;
    tdModule.innerText = dataOb.module_id.name;
    tdSelect.innerHtml = getSelect(dataOb);
    tdInsert.innerHtml = getInsert(dataOb);
    tdUpdate.innerHtml = getUpdate(dataOb);
    tdDelete.innerHtml = getDelete(dataOb);

    $("#privilageView").modal("show");

}

// delete button of the table
const privilageDelete = (dataOb) => {
    console.log(dataOb);

    let userConfirm = Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete it!",
        allowOutsideClick: false,
        customClass :{
            cancelButton :'btn-3d btn-3d-cancel',
            confirmButton :'btn-3d btn-3d-delete'
        }
    }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
            //call post service
            let postResponse = httpServiceRequest("/privilage/delete","DELETE",dataOb);
            if (postResponse == "ok") {
                Swal.fire({
                    title: "Deleted!",
                    text: "Deleted Successfully",
                    icon: "success",
                    iconColor: "#d33",
                    timer: 1000,
                    showConfirmButton: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                loadPrivilageTable();
                refreshForm();
            } else {
                Swal.fire({
                    title: "Failed to Submit....?",
                    text: postResponse,
                    icon: "question",
                    allowOutsideClick: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            };
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Details not Deleted!",
                icon: "error",
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        };
    });

}

// edit button of the table
const privilageEdit = (dataOb) => {
    console.log(dataOb);

    privilageRole.value = JSON.stringify(dataOb.role_id);
    privilageModule.value = JSON.stringify(dataOb.module_id)

    if (dataOb.privi_select) {
        chkBoxSelect.checked = true;
        labelSelect.innerText = "Access Granted";
    } else {
        chkBoxSelect.checked = false;
        labelSelect.innerText = "Access Denied";
    }

    if (dataOb.privi_insert) {
        chkBoxInsert.checked = true;
        labelInsert.innerText = "Access Granted";
    } else {
        chkBoxInsert.checked = false;
        labelInsert.innerText = "Access Denied";
    }

    if (dataOb.privi_update) {
        chkBoxUpdate.checked = true;
        labelUpdate.innerText = "Access Granted";
    } else {
        chkBoxUpdate.checked = false;
        labelUpdate.innerText = "Access Denied";
    }

    if (dataOb.privi_delete) {
        chkBoxDelete.checked = true;
        labelDelete.innerText = "Access Granted";
    } else {
        chkBoxDelete.checked = false;
        labelDelete.innerText = "Access Denied";
    }

    updateButton.style.display = "";
    submitButton.style.display = "none";

    privilage = JSON.parse(JSON.stringify(dataOb));
    oldprivilage = JSON.parse(JSON.stringify(dataOb));

    $("#privilageForm").modal("show");

}

// check form errors
const checkFormError = () =>{
    let errors = "";

    if (privilage.role_id == null) {
        errors = errors + "Please Select Role ...\n";
    }
    if (privilage.module_id == null) {
        errors = errors + "Please Select Module ...\n";
    }

    return errors;
}

//privilage from submit event function
const privilageFormSubmit = () => {
    console.log(privilage);
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
                   let postResponse = httpServiceRequest("/privilage/insert","POST",privilage);
                   if (postResponse == "ok") {
                        Swal.fire({
                             title: "Saved!",
                             text: "Saved Successfully",
                             icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        loadPrivilageTable();
                        refreshForm();
                   } else {
                        Swal.fire({
                             title: "Failed to Submit....? ",
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
              text: errors,
              icon: 'error',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
             customClass :{
                 confirmButton :'btn-3d btn-3d-other'
             }
         });
    }
    console.log(privilage);
};

// check form updates
const checkFormUpdates = () =>{

    let updates  = "";

    if(privilage != null && oldprivilage != null){

        if(privilage.role_id.name != oldprivilage.role_id.name){
            updates = updates + " Role is changed..\n";
        }

        if (privilage.module_id.name != oldprivilage.module_id.name) { 
            updates = updates + " Module is changed...\n";
        }
        if (privilage.privi_select != oldprivilage.privi_select) {
            updates = updates + " Select Privilage is changed...\n";
        }
        if (privilage.privi_insert != oldprivilage.privi_insert) {
            updates = updates + " Insert Privilage is changed...\n";
        }
        if (privilage.privi_update != oldprivilage.privi_update) {
            updates = updates + " Update Privilage is changed...\n";
        }
        if (privilage.privi_delete != oldprivilage.privi_delete) {
            updates = updates + " Delete Privilage is changed....\n";
        }

    }
    return updates;
}

// update button of the form
const privilageFormUpdate = () => {
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
                    //call post service
                    let postResponse = httpServiceRequest("/privilage/update","PUT",privilage);
                    if (postResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        loadPrivilageTable();
                        refreshForm();
                        $("#privilageForm").modal("hide");

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

// refresh the form
const refreshForm = () => {

    privilage = new Object();

    roles = getServiceRequest("/role/alldata");
    modules = getServiceRequest("/module/alldata");

    dataFilIntoSelect(privilageRole, "Select Role", roles, "name");
    dataFilIntoSelect(privilageModule, "Select Module", modules, "name");

    chkBoxSelect.checked = false;
    privilage.privi_select = false;
    labelSelect.innerText = "Access Denied";
    chkBoxInsert.checked = false;
    labelInsert.innerText = "Access Denied";
    privilage.privi_insert = false;
    chkBoxUpdate.checked = false;
    labelUpdate.innerText = "Access Denied";
    privilage.privi_update = false;
    chkBoxDelete.checked = false;
    labelDelete.innerText = "Access Denied";
    privilage.privi_delete = false;

    setDefault([privilageRole, privilageModule]);

    submitButton.style.display = "";
    updateButton.style.display = "none";
}

//Alert Box Call function
Swal.isVisible();

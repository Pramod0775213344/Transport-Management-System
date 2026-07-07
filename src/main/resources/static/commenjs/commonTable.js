// Data filing function to table
const dataFillIntoTheTable = (tableBodyId, dataList, propertyList, viewFunction, editFunction, deleteFunction, buttonVisibilty = true) => {
  tableBodyId.innerHTML = "";

  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;//dynamicially index no eka create karanwa
    tr.appendChild(tdIndex);

    for (const property of propertyList) {
      let td = document.createElement("td");
// property type eka nuawa data filter karanagannawa
      if (property.dataType == "string") {
        td.innerHTML = dataOb[property.propertyName];
      }
      if (property.dataType == "function") {
        td.innerHTML = property.propertyName(dataOb);
      }
      if (property.dataType == "decimal") {
        td.innerHTML = parseFloat(dataOb[property.propertyName]).toFixed(2);
      }
      if (property.dataType == "image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/user.png";
        }
        td.appendChild(img);
      }
      if (property.dataType == "truck-image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/truck.png";
        }
        td.appendChild(img);
      }
      tr.appendChild(td);
    }

    //Button List
    let tdbutton = document.createElement("td");
    tdbutton.style.position = "relative";

    let buttonDiv = document.createElement("div");
    buttonDiv.className = "actions";

    let editButton = document.createElement("button");
    editButton.className = "action-btn edit";
    editButton.innerHTML = "<i class='fas fa-edit'></i>";
    editButton.setAttribute("title", "Edit");
    editButton.onclick = () => {
      console.log("edit", dataOb);
      editFunction(dataOb, index);
    };
    buttonDiv.appendChild(editButton);

    let viewButton = document.createElement("button");
    viewButton.className = "action-btn share";
    viewButton.innerHTML = "<i class='fas fa-eye'></i>";
    viewButton.setAttribute("title", "View");
    viewButton.onclick = () => {
      console.log("View", dataOb);
      viewFunction(dataOb, index);
    };
    buttonDiv.appendChild(viewButton);

    let deleteButton = document.createElement("button");
    deleteButton.className = "action-btn delete";
    deleteButton.innerHTML = "<i class='fas fa-trash-alt'></i>";
    deleteButton.setAttribute("title", "Delete");
    deleteButton.onclick = () => {
      console.log("delete", dataOb);
      deleteFunction(dataOb, index);
    };
    buttonDiv.appendChild(deleteButton);
    tdbutton.appendChild(buttonDiv);
    tr.appendChild(tdbutton);
    tableBodyId.appendChild(tr);
  });
};

// view btn eka witharak thiyena table
const dataFillIntoTheTableWithViewBtn = (tableBodyId, dataList, propertyList, viewFunction, buttonVisibilty = true) => {
  tableBodyId.innerHTML = "";

  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    for (const property of propertyList) {
      let td = document.createElement("td");

      if (property.dataType == "string") {
        td.innerHTML = dataOb[property.propertyName];
      }
      if (property.dataType == "function") {
        td.innerHTML = property.propertyName(dataOb);
      }
      if (property.dataType == "decimal") {
        td.innerHTML = parseFloat(dataOb[property.propertyName]).toFixed(2);
      }
      if (property.dataType == "image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/user.png";
        }
        td.appendChild(img);
      }
      if (property.dataType == "truck-image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/truck.png";
        }
        td.appendChild(img);
      }
      tr.appendChild(td);
    }

    //Button List
    let tdbutton = document.createElement("td");
    tdbutton.style.position = "relative";

    let buttonDiv = document.createElement("div");
    buttonDiv.className = "actions";

    let viewButton = document.createElement("button");
    viewButton.className = "action-btn share";
    viewButton.innerHTML = "<i class='fas fa-eye'></i>";
    viewButton.setAttribute("title", "View");
    viewButton.onclick = () => {
      console.log("View", dataOb);
      viewFunction(dataOb, index);
    };
    buttonDiv.appendChild(viewButton);

    tdbutton.appendChild(buttonDiv);
    tr.appendChild(tdbutton);
    tableBodyId.appendChild(tr);
  });
};

// data fill in to the report tables
const dataFillIntoTheReportTable = (tableBodyId, dataList, propertyList) => {
  tableBodyId.innerHTML = "";

  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    for (const property of propertyList) {
      let td = document.createElement("td");

      if (property.dataType == "string") {
        // td.innerHTML = dataOb[property.propertyName];
        let value = dataOb[property.propertyName];
        td.innerHTML = value === undefined || value === null || value === "" ? property.defaultValue || "" : value;
      }
      if (property.dataType == "function") {
        td.innerHTML = property.propertyName(dataOb);
      }
      if (property.dataType == "decimal") {
        td.innerText = parseFloat(dataOb[property.propertyName]).toFixed(2);
      }
      if (property.dataType == "image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/user.png";
        }
        td.appendChild(img);
      }
      if (property.dataType == "truck-image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/truck.png";
        }
        td.appendChild(img);
      }
      if (property.dataType == "datetime") {
        if (dataOb[property.propertyName] != null) {
          // Remove 'T' if present in the datetime string
          td.innerHTML = dataOb[property.propertyName].replace("T", " ");
        } else {
          td.innerHTML = "-";
        }
      }
      tr.appendChild(td);
    }
    tableBodyId.appendChild(tr);
  });
};

// data fill in to the report tables with check boc
const dataFillIntoTheReportTableWithCheckBox = (tableBodyId, dataList, propertyList) => {
  tableBodyId.innerHTML = "";

  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    let tdICheckBox = document.createElement("td");
    let checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.className = "form-check-input";
    tdICheckBox.appendChild(checkBox);
    tr.appendChild(tdICheckBox);

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    for (const property of propertyList) {
      let td = document.createElement("td");

      if (property.dataType == "string") {
        // td.innerHTML = dataOb[property.propertyName];
        let value = dataOb[property.propertyName];
        td.innerHTML = value === undefined || value === null || value === "" ? property.defaultValue || "" : value;
      }
      if (property.dataType == "function") {
        td.innerHTML = property.propertyName(dataOb);
      }
      if (property.dataType == "decimal") {
        td.innerText = parseFloat(dataOb[property.propertyName]).toFixed(2);
      }
      if (property.dataType == "image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/user.png";
        }
        td.appendChild(img);
      }
      if (property.dataType == "truck-image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/truck.png";
        }
        td.appendChild(img);
      }
      if (property.dataType == "datetime") {
        if (dataOb[property.propertyName] != null) {
          // Remove 'T' if present in the datetime string
          td.innerHTML = dataOb[property.propertyName].replace("T", " ");
        } else {
          td.innerHTML = "-";
        }
      }
      tr.appendChild(td);
    }
    tableBodyId.appendChild(tr);
  });
};

// data fill table clicking the row
const dataFillIntoTheReportTableWithRowClick = (tableBodyId, dataList, propertyList, editFunction, buttonVisibility = false) => {
  tableBodyId.innerHTML = "";

  dataList.forEach((dataob, index) => {
    let tr = document.createElement("tr");

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    for (const property of propertyList) {
      let td = document.createElement("td");

      if (property.dataType == "string") {
        td.innerText = dataob[property.propertyName];
      }
      if (property.dataType == "function") {
        td.innerHTML = property.propertyName(dataob);
      }
      if (property.dataType == "decimal") {
        if (dataob[property.propertyName] == null || dataob[property.propertyName] == undefined) {
          td.innerHTML = "-";
        } else {
          td.innerHTML = parseFloat(dataob[property.propertyName]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }
      tr.appendChild(td);
    }

    // if you click the tr edita function call
    tr.onclick = () => {
      editFunction(dataob, index);
      window["editOb"] = dataob;
      window["editRowIndex"] = index;
    };

    tableBodyId.appendChild(tr);
  });
};

// Data filing function to innertable
const dataFillIntoTheInnerTable = (tableBodyId, dataList, propertyList, editFunction, deleteFunction, buttonVisibilty = true) => {
  tableBodyId.innerHTML = "";

  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    for (const property of propertyList) {
      let td = document.createElement("td");

      if (property.dataType == "string") {
        td.innerHTML = dataOb[property.propertyName];
      }
      if (property.dataType == "function") {
        td.innerHTML = property.propertyName(dataOb);
      }
      if (property.dataType == "decimal") {
        td.innerText = parseFloat(dataOb[property.propertyName]).toFixed(2);
      }
      if (property.dataType == "image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/user.png";
        }
        td.appendChild(img);
      }
      if (property.dataType == "truck-image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/truck.png";
        }
        td.appendChild(img);
      }
      tr.appendChild(td);
    }

    //Button List
    let tdbutton = document.createElement("td");
    tdbutton.style.position = "relative";

    let buttonDiv = document.createElement("div");
    buttonDiv.className = "actions";

    let editButton = document.createElement("button");
    editButton.className = "action-btn edit";
    editButton.innerHTML = "<i class='fas fa-edit'></i>";
    editButton.setAttribute("title", "Edit");
    editButton.onclick = () => {
      console.log("edit", dataOb);
      editFunction(dataOb, index);
    };
    buttonDiv.appendChild(editButton);

    let deleteButton = document.createElement("button");
    deleteButton.className = "action-btn delete";
    deleteButton.innerHTML = "<i class='fas fa-trash-alt'></i>";
    deleteButton.setAttribute("title", "Delete");
    deleteButton.onclick = () => {
      console.log("delete", dataOb);
      deleteFunction(dataOb, index);
    };
    buttonDiv.appendChild(deleteButton);
    tdbutton.appendChild(buttonDiv);
    tr.appendChild(tdbutton);
    tableBodyId.appendChild(tr);
  });
};

// Data fill in to the dynamic select elements
const dataFilIntoSelect = (parentId, massage, dataList, displayProperties) => {

  // kalin monawa hari data thiyenawa nam ewa clean karala danawa
  parentId.innerHTML = "";
  // measge eka emptyda kiyala balwanawa
  if (massage != "") {
    let optionMsgEs = document.createElement("option");
    optionMsgEs.value = "";
    optionMsgEs.selected = "selected";
    optionMsgEs.disabled = "disabled";
    optionMsgEs.innerText = massage;
    // append karana selecte ekata oprion tag ekak massage eka thiyena
    parentId.appendChild(optionMsgEs);
  }

  dataList.forEach((dataOb) => {
    let option = document.createElement("Option");
    // value assign karawa option ekata
    option.value = JSON.stringify(dataOb);
    // assion karapu value wala api dena property name ekata adala data eka view karanwa option tag wala userta
    option.innerText = dataOb[displayProperties];
    //option tag eka apped karawa select ekata
    parentId.appendChild(option);
  });
};

//nama dekak join karala ekata pennana puluwan
const dataFillIntoSelectWithTwoNames = (parentId, massage, dataList, displayProperties1, displayProperties2) => {
  parentId.innerHTML = "";
  if (massage != "") {
    let optionMsgEs = document.createElement("option");
    optionMsgEs.value = " ";
    optionMsgEs.selected = "selected";
    optionMsgEs.disabled = "disabled";
    optionMsgEs.innerText = massage;
    parentId.appendChild(optionMsgEs);
  }

  dataList.forEach((dataOb) => {
    let option = document.createElement("Option");
    option.value = JSON.stringify(dataOb);
    option.innerText = dataOb[displayProperties1] + " - " + dataOb[displayProperties2];
    parentId.appendChild(option);
  });
};

//nama dekak join karala ekata pennana puluwan
const dataFillIntoSelectWithTwoNamesWithBracket = (parentId, massage, dataList, displayProperties1, displayProperties2) => {
  parentId.innerHTML = "";
  if (massage != "") {
    let optionMsgEs = document.createElement("option");
    optionMsgEs.value = " ";
    optionMsgEs.selected = "selected";
    optionMsgEs.disabled = "disabled";
    optionMsgEs.innerText = massage;
    parentId.appendChild(optionMsgEs);
  }

  dataList.forEach((dataOb) => {
    let option = document.createElement("Option");
    option.value = JSON.stringify(dataOb);
    option.innerText = dataOb[displayProperties1] + " ( " + displayProperties2(dataOb) + " )";
    parentId.appendChild(option);
  });
};

// dynamically fill data into the datalist
const dataFillIntoDataList = (parentId, dataList, displayProperties) => {
  parentId.innerHTML = "";

  dataList.forEach((dataOb) => {
    let option = document.createElement("Option");
    option.value = dataOb[displayProperties];
    option.innerHTML = dataOb[displayProperties];
    parentId.appendChild(option);
  });
};

const stripHtml = (value) => {
  const temp = document.createElement("div");
  temp.innerHTML = value == null ? "" : String(value);
  return (temp.textContent || temp.innerText || "").replace(/\s+/g, " ").trim();
};

// excel ekata export karana function eka sheetjs libaray eka use karala
const exportTableToExcelWithSheetJS = (tableSelector, fileName, options = {}) => {
  if (typeof XLSX === "undefined") {
    Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: "SheetJS library is not loaded.",
      timer: 2200,
      showConfirmButton: false,
    });
    return;
  }

  const tableElement = document.querySelector(tableSelector);
  if (!tableElement) {
    return;
  }

  const { sheetName = "Sheet1", excludeLastColumn = true } = options;
  const headers = Array.from(tableElement.querySelectorAll("thead th")).map((th) => stripHtml(th.innerHTML));
  if (excludeLastColumn && headers.length > 0) {
    headers.pop();
  }

  const rows = [];

  if ($.fn.dataTable.isDataTable(tableSelector)) {
    const dataTable = $(tableSelector).DataTable();
    dataTable.rows({ search: "applied" }).every(function () {
      const rowNode = this.node();
      if (rowNode) {
        const rowValues = Array.from(rowNode.querySelectorAll("td")).map((td) => stripHtml(td.innerHTML));
        if (excludeLastColumn && rowValues.length > 0) {
          rowValues.pop();
        }
        rows.push(rowValues);
      } else {
        const fallbackData = this.data();
        if (Array.isArray(fallbackData)) {
          const rowValues = fallbackData.map((item) => stripHtml(item));
          if (excludeLastColumn && rowValues.length > 0) {
            rowValues.pop();
          }
          rows.push(rowValues);
        }
      }
    });
  } else {
    const bodyRows = Array.from(tableElement.querySelectorAll("tbody tr"));
    bodyRows.forEach((tr) => {
      const rowValues = Array.from(tr.querySelectorAll("td")).map((td) => stripHtml(td.innerHTML));
      if (excludeLastColumn && rowValues.length > 0) {
        rowValues.pop();
      }
      rows.push(rowValues);
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// jspdf library eka use karala pdf ekakata export karana function eka
const exportTableToPdfWithJsPdf = (tableSelector, fileName, options = {}) => {
  if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF === "undefined") {
    Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: "jsPDF library is not loaded.",
      timer: 2200,
      showConfirmButton: false,
    });
    return;
  }

  const tableElement = document.querySelector(tableSelector);
  if (!tableElement) {
    return;
  }

  const { title = "Table Export", excludeLastColumn = true } = options;
  const headers = Array.from(tableElement.querySelectorAll("thead th")).map((th) => stripHtml(th.innerHTML));
  if (excludeLastColumn && headers.length > 0) {
    headers.pop();
  }

  const rows = [];

  if ($.fn.dataTable.isDataTable(tableSelector)) {
    const dataTable = $(tableSelector).DataTable();
    dataTable.rows({ search: "applied" }).every(function () {
      const rowNode = this.node();
      if (rowNode) {
        const rowValues = Array.from(rowNode.querySelectorAll("td")).map((td) => stripHtml(td.innerHTML));
        if (excludeLastColumn && rowValues.length > 0) {
          rowValues.pop();
        }
        rows.push(rowValues);
      }
    });
  } else {
    const bodyRows = Array.from(tableElement.querySelectorAll("tbody tr"));
    bodyRows.forEach((tr) => {
      const rowValues = Array.from(tr.querySelectorAll("td")).map((td) => stripHtml(td.innerHTML));
      if (excludeLastColumn && rowValues.length > 0) {
        rowValues.pop();
      }
      rows.push(rowValues);
    });
  }

  const { jsPDF } = window.jspdf;
  const orientation = headers.length > 6 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });

  doc.setFontSize(12);
  doc.text(title, 40, 36);

  if (typeof doc.autoTable !== "function") {
    Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: "jsPDF AutoTable plugin is not loaded.",
      timer: 2200,
      showConfirmButton: false,
    });
    return;
  }

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 48,
    styles: {
      fontSize: 9,
      cellPadding: 5,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: "bold",
    },
    theme: "grid",
  });

  doc.save(`${fileName}.pdf`);
};

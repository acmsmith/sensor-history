// Get the config data from the backend
var configData = null;
async function getConfig(url) {
    const response = await fetch('/getConfig');
    this.configData = await response.json();
    convert(this.configData);
}
   
// Function to convert JSON Config data to HTML table
function convert(jsonData) {
    
   // Get the container element where the table will be inserted
   let container = document.getElementById("tableDiv");
   
   // Create the table element
   let table = document.createElement("table");
   table.classList.add("table", "table-striped", "table-sm");
   
   // Get the keys (column names) of the first object in the JSON data
   let cols = Object.keys(jsonData[0]);
   
   // Create the header element
   let thead = document.createElement("thead");
   let tr = document.createElement("tr");
   
   let hidewhensmall = ['lastupdated','rowid','modifier', 'sensor'];
   // Loop through the column names and create header cells
   cols.forEach((item) => {
      let th = document.createElement("th");
      th.innerText = item[0].toUpperCase() + item.slice(1); // Set the column name as the text of the header cell
      if(hidewhensmall.includes(item)){
        th.classList.add('d-none', 'd-lg-table-cell');
      }
      tr.appendChild(th); // Append the header cell to the header row
      
   });


   thead.appendChild(tr); // Append the header row to the header
   table.append(thead) // Append the header to the table
   
   let tbody = document.createElement("tbody");

   // Loop through the JSON data and create table rows
   jsonData.forEach((item) => {
      let tr = document.createElement("tr");
      
      // Get the values of the current object in the JSON data
      let vals = Object.entries(item);
      
      // Loop through the keys/values and create table cells
      for(const [key, value] of vals){
        let td = document.createElement("td");
         td.innerText = value; // Set the value as the text of the table cell
         if(hidewhensmall.includes(key)){
          td.classList.add('d-none', 'd-lg-table-cell');
        }
         tr.appendChild(td); // Append the table cell to the table row
      }

      // Add an Edit button as the last column
      // Remember to pass the rowid of the sensor we want to edit.
      let edit_el = document.createElement("td");
      edit_el.innerHTML = `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-sensor="${item.rowid}" data-bs-target="#editModal">Edit</button>`;
      tr.appendChild(edit_el);
      tbody.appendChild(tr); // Append the table row to the table
   });
 

   table.append(tbody)
   container.appendChild(table) // Append the table to the container element
}

//Update the model input boxes to reflect the selected config(sensor)
const editModal = document.getElementById('editModal')
if (editModal) {
   editModal.addEventListener('show.bs.modal', event => {
    // Button that triggered the modal
    const button = event.relatedTarget
    // Extract info from data-bs-sensor attribute
    const rowid = button.getAttribute('data-bs-sensor')

    // Find the correct sensor in the configData
    const sensor =  this.configData.find((x) => x.rowid.toString() == rowid.toString());

    if(sensor){
    // Update the modal's content.
    const modalTitle = editModal.querySelector('.modal-title')
    const rowidInput = document.getElementById('rowidInput');
    rowidInput.value = sensor.rowid;
    const nameInput = document.getElementById('nameInput');
    nameInput.value = sensor.name;
    const attributeInput = document.getElementById('attributeInput');
    attributeInput.value = sensor.attribute
    const modifierInput = document.getElementById('modifierInput');
    modifierInput.value = sensor.modifier
    const activeInput = document.getElementById('activeCheckbox')
    activeInput.checked = false;
    if(sensor.active == 1)
      activeInput.checked = true;

    modalTitle.textContent = `Edit Sensor ${sensor.sensor}`
    }

  })
}

//Get the config and populate the config table
getConfig('/getconfig');


//---------------------
// Handle Edit Config sumbit
//---------------------
const form = document.querySelector("#configForm");

async function sendData() {
  // Associate the FormData object with the form element
  const formData = new FormData(form);

  try {
    const response = await fetch("/updateconfig", {
      method: "POST",
      // Set the FormData instance as the request body
      body: new URLSearchParams(formData).toString(),
      headers:{
         'Content-Type': 'application/x-www-form-urlencoded'
       }
    });
  } catch (e) {
    console.error(e);
  }
}

// Take over form submission
form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendData();
  //reload the page
  location.reload();
});
//--------------------------------

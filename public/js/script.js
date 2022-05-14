function generateLeadCards(leadsArray) {
  for (let i = 0; i < leadsArray.length; i++) {
    const lead = leadsArray[i];

    const holder = document.createElement("div");
    const card = document.createElement("div");
    const cardTitle = document.createElement("h3");
    const phoneNumber = document.createElement("h4");
    const details = document.createElement("p");
    const complete = document.createElement("p");
    const completeBtn = document.createElement("button");
    const deleteLead = document.createElement("button");

    holder.className = "col-4";
    card.className = "card";
    cardTitle.className = "card-title";
    phoneNumber.className = "card-subtitle text-muted";
    details.className = "card-text";
    complete.className = "card-text";
    completeBtn.className = "btn btn-outline-success";
    deleteLead.className = "btn btn-danger";

    cardTitle.innerText = lead.name;
    phoneNumber.innerText = lead.phonenumber;
    details.innerText = lead.details;
    complete.innerText = "Complete: ";
    if (lead.complete) {
      completeBtn.className = "btn btn-success";
      completeBtn.innerText = "complete";
    } else {
      completeBtn.innerText = "incomplete";
    }
    deleteLead.innerText = "Delete Lead";

    completeBtn.setAttribute("data-id", lead.id);
    deleteLead.setAttribute("data-id", lead.id);

    deleteLead.addEventListener("click", removeLead);
    completeBtn.addEventListener("click", updateLead);

    complete.appendChild(completeBtn);

    card.append(cardTitle, phoneNumber, details, complete, deleteLead);
    holder.appendChild(card);
    document.querySelector("#leads").appendChild(holder);
  }
}

function updateLead(event) {
  const btn = event.target;
  let complete;
  if (btn.innerText != "complete") {
    complete = true;
    fetch("/api/update-lead/" + btn.getAttribute("data-id"), {
      method: "PUT",
      body: JSON.stringify({ complete }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.ok) {
        location.reload();
      } else {
        alert("failed request");
      }
    });
  } else {
    alert("Lead is complete already try deleting");
  }
}

function removeLead(event) {
  const btn = event.target;
  leadId = btn.getAttribute("data-id");
  fetch("/api/delete-lead/" + leadId, {
    method: "DELETE",
  }).then((res) => {
    if (res.ok) {
      location.reload();
    } else {
      alert("Failed to find lead");
    }
  });
}

function createLead(event) {
  event.preventDefault();
  const name = document.querySelector("input[name='name']").value;
  const phonenumber = document.querySelector("input[name='phonenumber']").value;
  const details = document.querySelector("#textArea").value;

  console.log(name, phonenumber, details);
  fetch("/api/add-lead", {
    method: "POST",
    body: JSON.stringify({
      name,
      phonenumber,
      details,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.ok) {
      location.reload();
    } else {
      alert("Failed to add lead");
    }
  });
}

function getAllLeads(event) {
  fetch("/api/get-all")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      generateLeadCards(data);
    });
}

window.addEventListener("load", getAllLeads);
addlead.addEventListener("submit", createLead);

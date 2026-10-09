// DOM Element Selection

const loadUsersBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Global array to store fetched users for client-side filtering
let usersData = [];

// Fetch Users Function

async function fetchUsers() {
  // Update status and disable button during network request
  statusText.textContent = "Loading users...";
  loadUsersBtn.disabled = true;
  usersList.textContent = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    // Check if HTTP response status is in the 200–299 range
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    usersData = data; // Store data locally to allow offline client-side filtering

    statusText.textContent = `Successfully loaded ${usersData.length} users.`;
    renderUsers(usersData);
  } catch (error) {
    console.error("Fetch error:", error);
    statusText.textContent = "Failed to load users. Please try again.";
  } finally {
    // Re-enable button after request completes
    loadUsersBtn.disabled = false;
  }
}

// Render Function (Client-side XSS Protection)

function renderUsers(list) {
  // Clear list contents safely
  usersList.textContent = "";

  if (list.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No users found matching your filter.";
    usersList.appendChild(emptyItem);
    return;
  }

  list.forEach((user) => {
    const li = document.createElement("li");
    li.className = "user-card";

    // User Name
    const nameHeading = document.createElement("h3");
    nameHeading.textContent = user.name;

    // User Email
    const emailParagraph = document.createElement("p");
    const emailLabel = document.createElement("strong");
    emailLabel.textContent = "Email: ";
    emailParagraph.appendChild(emailLabel);
    emailParagraph.appendChild(document.createTextNode(user.email));

    // User City
    const cityParagraph = document.createElement("p");
    const cityLabel = document.createElement("strong");
    cityLabel.textContent = "City: ";
    cityParagraph.appendChild(cityLabel);
    cityParagraph.appendChild(
      document.createTextNode(user.address ? user.address.city : "N/A")
    );

    // User Company Name
    const companyParagraph = document.createElement("p");
    const companyLabel = document.createElement("strong");
    companyLabel.textContent = "Company: ";
    companyParagraph.appendChild(companyLabel);
    companyParagraph.appendChild(
      document.createTextNode(user.company ? user.company.name : "N/A")
    );

    // Append child elements to list item
    li.appendChild(nameHeading);
    li.appendChild(emailParagraph);
    li.appendChild(cityParagraph);
    li.appendChild(companyParagraph);

    usersList.appendChild(li);
  });
}

// Live Client-side Filtering Function

function filterUsers() {
  const searchTerm = filterInput.value.trim().toLowerCase();

  const filtered = usersData.filter((user) =>
    user.name.toLowerCase().includes(searchTerm)
  );

  renderUsers(filtered);
}

// Event Listeners

loadUsersBtn.addEventListener("click", fetchUsers);
filterInput.addEventListener("input", filterUsers);

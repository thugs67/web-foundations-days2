<<<<<<< HEAD
// DOM Element Selection & State

const loadUsersBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// 1. Array to store the loaded users globally
let usersData = [];

// Load Users (Fetch Function)

async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadUsersBtn.disabled = true;
  usersList.textContent = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and store loaded users in the array
    usersData = await response.json();

    statusText.textContent = `Successfully loaded ${usersData.length} users.`;
    
    // Draw all users initially
    renderUsers(usersData);

  } catch (error) {
    console.error("Error loading users:", error);
    statusText.textContent = "Failed to load users. Please try again.";

  } finally {
    loadUsersBtn.disabled = false;
  }
}

// renderUsers(list) Functions

//@param {Array} list - The array of user objects to render */

function renderUsers(list) {
  // Clear previous list items safely
  usersList.textContent = "";

  // Show message when array is empty / no matches found
  if (list.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "no-results";
    emptyItem.textContent = "No users match your filter.";
    usersList.appendChild(emptyItem);
    return;
  }

  // Draw each user item from the list parameter
  list.forEach((user) => {
    const li = document.createElement("li");
    li.className = "user-card";

    // Name
    const nameHeading = document.createElement("h3");
    nameHeading.textContent = user.name;

    // Email
    const emailParagraph = document.createElement("p");
    const emailLabel = document.createElement("strong");
    emailLabel.textContent = "Email: ";
    emailParagraph.appendChild(emailLabel);
    emailParagraph.appendChild(document.createTextNode(user.email));

    // City
    const cityParagraph = document.createElement("p");
    const cityLabel = document.createElement("strong");
    cityLabel.textContent = "City: ";
    cityParagraph.appendChild(cityLabel);
    cityParagraph.appendChild(
      document.createTextNode(user.address ? user.address.city : "N/A")
    );

    // Company
    const companyParagraph = document.createElement("p");
    const companyLabel = document.createElement("strong");
    companyLabel.textContent = "Company: ";
    companyParagraph.appendChild(companyLabel);
    companyParagraph.appendChild(
      document.createTextNode(user.company ? user.company.name : "N/A")
    );

    // Append all parts to list item
    li.appendChild(nameHeading);
    li.appendChild(emailParagraph);
    li.appendChild(cityParagraph);
    li.appendChild(companyParagraph);

    // Append card to main list container
    usersList.appendChild(li);
  });
}

// Event Listeners

// Click button to fetch users
loadUsersBtn.addEventListener("click", loadUsers);

// 2. Listen for input event on the filter box, filter stored usersData, and call renderUsers
filterInput.addEventListener("input", () => {
  const searchTerm = filterInput.value.trim().toLowerCase();

  // Filter the stored users array by matching name (case-insensitive)
  const filteredUsers = usersData.filter((user) =>
    user.name.toLowerCase().includes(searchTerm)
  );

  // Re-render with the filtered list result
  renderUsers(filteredUsers);
=======
// DOM Element Selection & State

const loadUsersBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// 1. Array to store the loaded users globally
let usersData = [];

// Load Users (Fetch Function)

async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadUsersBtn.disabled = true;
  usersList.textContent = "";

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and store loaded users in the array
    usersData = await response.json();

    statusText.textContent = `Successfully loaded ${usersData.length} users.`;
    
    // Draw all users initially
    renderUsers(usersData);

  } catch (error) {
    console.error("Error loading users:", error);
    statusText.textContent = "Failed to load users. Please try again.";

  } finally {
    loadUsersBtn.disabled = false;
  }
}

// renderUsers(list) Functions

//@param {Array} list - The array of user objects to render */

function renderUsers(list) {
  // Clear previous list items safely
  usersList.textContent = "";

  // Show message when array is empty / no matches found
  if (list.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "no-results";
    emptyItem.textContent = "No users match your filter.";
    usersList.appendChild(emptyItem);
    return;
  }

  // Draw each user item from the list parameter
  list.forEach((user) => {
    const li = document.createElement("li");
    li.className = "user-card";

    // Name
    const nameHeading = document.createElement("h3");
    nameHeading.textContent = user.name;

    // Email
    const emailParagraph = document.createElement("p");
    const emailLabel = document.createElement("strong");
    emailLabel.textContent = "Email: ";
    emailParagraph.appendChild(emailLabel);
    emailParagraph.appendChild(document.createTextNode(user.email));

    // City
    const cityParagraph = document.createElement("p");
    const cityLabel = document.createElement("strong");
    cityLabel.textContent = "City: ";
    cityParagraph.appendChild(cityLabel);
    cityParagraph.appendChild(
      document.createTextNode(user.address ? user.address.city : "N/A")
    );

    // Company
    const companyParagraph = document.createElement("p");
    const companyLabel = document.createElement("strong");
    companyLabel.textContent = "Company: ";
    companyParagraph.appendChild(companyLabel);
    companyParagraph.appendChild(
      document.createTextNode(user.company ? user.company.name : "N/A")
    );

    // Append all parts to list item
    li.appendChild(nameHeading);
    li.appendChild(emailParagraph);
    li.appendChild(cityParagraph);
    li.appendChild(companyParagraph);

    // Append card to main list container
    usersList.appendChild(li);
  });
}

// Event Listeners

// Click button to fetch users
loadUsersBtn.addEventListener("click", loadUsers);

// 2. Listen for input event on the filter box, filter stored usersData, and call renderUsers
filterInput.addEventListener("input", () => {
  const searchTerm = filterInput.value.trim().toLowerCase();

  // Filter the stored users array by matching name (case-insensitive)
  const filteredUsers = usersData.filter((user) =>
    user.name.toLowerCase().includes(searchTerm)
  );

  // Re-render with the filtered list result
  renderUsers(filteredUsers);
>>>>>>> a9dc3de1347a41dec94e28eba9e07eff9ab4ece7
});
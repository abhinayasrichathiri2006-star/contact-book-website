const STORAGE_KEY = "contact-book-entries";

const form = document.getElementById("contact-form");
const contactIdInput = document.getElementById("contact-id");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const groupInput = document.getElementById("group");
const searchInput = document.getElementById("search");
const contactList = document.getElementById("contact-list");
const countLabel = document.getElementById("count");
const resetBtn = document.getElementById("reset-btn");

let contacts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {
    id: crypto.randomUUID(),
    name: "Alice Johnson",
    phone: "+1 555 234 1111",
    email: "alice@example.com",
    group: "Friends"
  },
  {
    id: crypto.randomUUID(),
    name: "David Smith",
    phone: "+1 555 987 2222",
    email: "david@company.com",
    group: "Work"
  },
  {
    id: crypto.randomUUID(),
    name: "Emma Brown",
    phone: "+1 555 112 3333",
    email: "emma@family.com",
    group: "Family"
  }
];

function saveContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function getInitials(name) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function renderContacts(filterText = "") {
  const term = filterText.trim().toLowerCase();

  const visibleContacts = contacts.filter(contact => {
    if (!term) return true;

    const searchable = [
      contact.name,
      contact.phone,
      contact.email,
      contact.group
    ].join(" ").toLowerCase();

    return searchable.includes(term);
  });

  countLabel.textContent = `${visibleContacts.length} contact${visibleContacts.length === 1 ? "" : "s"}`;

  if (visibleContacts.length === 0) {
    contactList.innerHTML = `
      <div class="empty-state">
        <h3>No contacts found</h3>
        <p>Try a different search or add a new contact.</p>
      </div>
    `;
    return;
  }

  contactList.innerHTML = visibleContacts
    .map(
      contact => `
        <article class="contact-card" data-id="${contact.id}">
          <div class="contact-name">
            <div class="contact-avatar">${getInitials(contact.name)}</div>
            <h3>${contact.name}</h3>
          </div>

          <div class="badge">${contact.group}</div>

          <div class="contact-meta">
            <div>📞 ${contact.phone}</div>
            <div>✉️ ${contact.email || "No email provided"}</div>
          </div>

          <div class="contact-actions">
            <button class="action-btn edit" data-action="edit" data-id="${contact.id}">Edit</button>
            <button class="action-btn delete" data-action="delete" data-id="${contact.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
}

function resetForm() {
  form.reset();
  contactIdInput.value = "";
  groupInput.value = "Family";
}

function handleSubmit(event) {
  event.preventDefault();

  const entry = {
    id: contactIdInput.value || crypto.randomUUID(),
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim(),
    group: groupInput.value
  };

  if (!entry.name || !entry.phone) return;

  const existingIndex = contacts.findIndex(contact => contact.id === entry.id);

  if (existingIndex >= 0) {
    contacts[existingIndex] = entry;
  } else {
    contacts.unshift(entry);
  }

  saveContacts();
  renderContacts(searchInput.value);
  resetForm();
}

function handleContactActions(event) {
  const actionBtn = event.target.closest("[data-action]");
  if (!actionBtn) return;

  const id = actionBtn.dataset.id;
  const contact = contacts.find(item => item.id === id);

  if (!contact) return;

  if (actionBtn.dataset.action === "delete") {
    contacts = contacts.filter(item => item.id !== id);
    saveContacts();
    renderContacts(searchInput.value);
    if (contactIdInput.value === id) resetForm();
    return;
  }

  if (actionBtn.dataset.action === "edit") {
    contactIdInput.value = contact.id;
    nameInput.value = contact.name;
    phoneInput.value = contact.phone;
    emailInput.value = contact.email;
    groupInput.value = contact.group;
    nameInput.focus();
  }
}

form.addEventListener("submit", handleSubmit);
searchInput.addEventListener("input", (event) => {
  renderContacts(event.target.value);
});

resetBtn.addEventListener("click", resetForm);

contactList.addEventListener("click", handleContactActions);

renderContacts();

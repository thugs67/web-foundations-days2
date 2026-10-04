let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish  Toolkit Functions Assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// searchNotes(word) - Returns an array of notes whose text contains `word`, ignoring case.

function searchNotes(word) {
  if (!word) return [];
  const searchTerm = word.toLowerCase();
  return notes.filter(note => note.text.toLowerCase().includes(searchTerm));
}

// longestNote()- Returns the note object with the most characters, or null if there are no notes.

function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) => 
    current.text.length > longest.text.length ? current : longest
  , notes[0]);
}

// countByCategory() - Returns an object counting notes per category.

function countByCategory() {
  return notes.reduce((counts, note) => {
    counts[note.category] = (counts[note.category] || 0) + 1;
    return counts;
  }, {});
}

//getSummary() - Returns a sentence summarizing total count and breakdown by category.
function getSummary() {
  const counts = countByCategory();
  const categoryParts = Object.entries(counts)
    .map(([cat, count]) => `${count} ${cat}`)
    .join(", ");

  return `${notes.length} notes: ${categoryParts}.`;
}

//isDuplicate(test) - Returns true if a note with the same text already exists (ignoring case and extra spaces).

function isDuplicate(text) {
  const normalizedInput = text.trim().toLowerCase();
  return notes.some(note => note.text.trim().toLowerCase() === normalizedInput);
}

//addNote(test, category) -Adds a note if valid (1–200 chars, not duplicate, valid category).
 
function addNote(text, category) {
    const allowedCategories = ["personal", "work", "study"];
  
  if (typeof text !== "string") {
    console.log("Failed to add note: Note text must be a string.");
    return false;
  }

  const trimmedText = text.trim();

// Validate length (1–200 characters)

    if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log(`Failed to add note: Text length (${trimmedText.length} chars) must be between 1 and 200 characters.`);
    return false;
  }

  // Validate category
    if(!allowedCategories.includes(category)) {
    console.log(`Failed to add note: Invalid category "${category}". Allowed: ${allowedCategories.join(", ")}.`);
    return false;
  }

  // Validate uniqueness
    if (isDuplicate(trimmedText)) {
        console.log(`Failed to add note: Duplicate note text "${trimmedText}".`);
    return false;
  }

    // Add the new note
    const newID = notes.length >0 ? Math.max(...notes.map(note =>note.id)) +1 : 1;
    notes.push({ id: newID, text: trimmedText, category });
    console.log(`Successfully added note: "${trimmedText}" [${category}]`);
    return true;
}

// Testing and Console Log Outputs

console.log("--- Initial Notes Array ---");
console.log(notes);

console.log("\n--- Testing searchNotes() ---");
console.log('searchNotes("report"):', searchNotes("report"));
console.log('searchNotes("BOOK"):', searchNotes("BOOK"));

console.log("\n--- Testing longestNote() ---");
console.log("longestNote():", longestNote());

console.log("\n--- Testing countByCategory() ---");
console.log("countByCategory():", countByCategory());

console.log("\n--- Testing getSummary() ---");
console.log("getSummary():", getSummary());

console.log("\n--- Testing isDuplicate() ---");
console.log('isDuplicate("buy milk and bread"):', isDuplicate("buy milk and bread")); // true
console.log('isDuplicate("   Call mum   "):', isDuplicate("   Call mum   ")); // true
console.log('isDuplicate("Prepare presentation slides"):', isDuplicate("Prepare presentation slides")); // false

console.log("\n--- Testing addNote() ---");
// Test valid note addition
console.log("Attempting valid addNote:");
console.log("Result:", addNote("Prepare team meeting agenda", "work")); // Expected: true
// Test empty text
console.log("\nAttempting invalid addNote (empty text):");
console.log("Result:", addNote("   ", "personal")); // Expected: false
// Test text > 200 characters
console.log("\nAttempting invalid addNote (text > 200 chars):");
console.log("Result:", addNote("a".repeat(201), "study")); // Expected: false
//Test invalid category
console.log("\nAttempting invalid addNote (invalid category):");
console.log("Result:", addNote("Go for a morning walk", "health")); // Expected: false
// Test duplicate note
console.log("\nAttempting invalid addNote (duplicate):");
console.log("Result:", addNote("Buy milk and bread", "personal")); // Expected: false

console.log("\n--- Summary After Adding Note ---");
console.log("Updated Summary:", getSummary());

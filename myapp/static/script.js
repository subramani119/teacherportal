// C:\Users\DELL\teacherporta\core\static\script.js

// Get CSRF token from cookies
function getCSRFToken() {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  if (!cookieValue) {
    console.error("CSRF token not found in cookies");
    const metaToken = document.querySelector(
      'meta[name="csrf-token"]'
    )?.content;
    return metaToken || "";
  }
  return cookieValue;
}

// Helper function to display a message box instead of alert (for better UX)
function displayMessageBox(message, type = "info") {
  let messageBox = document.getElementById("messageBox");
  if (!messageBox) {
    messageBox = document.createElement("div");
      messageBox.id = "messageBox";
    messageBox.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #f0f0f0;
      padding: 20px;
      border: 1px solid #ccc;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      border-radius: 8px;
      font-family: sans-serif;
      text-align: center;
    `;
    document.body.appendChild(messageBox);

    const closeButton = document.createElement("button");
    closeButton.textContent = "OK";
    closeButton.style.cssText = `
      margin-top: 15px;
      padding: 8px 15px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
    `;
    closeButton.onclick = () => (messageBox.style.display = "none");
    messageBox.appendChild(document.createElement("p")); // For the message
    messageBox.appendChild(closeButton);
  }

  const messageParagraph = messageBox.querySelector("p");
  messageParagraph.textContent = message;

  if (type === "error") {
    messageParagraph.style.color = "red";
    messageBox.style.borderColor = "red";
  } else if (type === "success") {
    messageParagraph.style.color = "green";
    messageBox.style.borderColor = "green";
  } else {
    messageParagraph.style.color = "black";
    messageBox.style.borderColor = "#ccc";
  }

  messageBox.style.display = "block";
}

// Function to show the add student modal (globally accessible)
window.showModal = function () {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.style.display = "block";
  }
};

// Function to hide the add student modal (globally accessible)
window.hideModal = function () {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.style.display = "none";
  }
};

function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}
// Update a single student field using fetch (AJAX) - globally accessible
window.updateField = function (id, field, value) {
  fetch(`/update-student/${id}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(), // You must send the CSRF token
    },
    body: JSON.stringify({ field, value })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      console.log('Student updated successfully');
    } else {
      console.error('Update failed:', data.message);
      alert('Error: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Request error:', error);
  });
  console.log(
    `Attempting to update student ID: ${id}, Field: ${field}, Value: ${value}`
  );
  const csrfToken = getCSRFToken();

  if (!csrfToken) {
    console.error("CSRF token is missing. Cannot send update request.");
    displayMessageBox(
      "Security token missing. Please refresh the page.",
      "error"
    );
    return;
  }

  fetch(`/update/${id}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken, // Send CSRF token in the header
    },
    body: JSON.stringify({ field, value }), // Send data as JSON
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(
            errorData.message || "Failed to update student details."
          );
        });
      }
      return response.json(); // Parse successful JSON response
    })
    .then((data) => {
      console.log("Update successful:", data);
      // Optional: Display a success message
      // displayMessageBox(data.message || 'Update successful!', 'success');
    })
    .catch((error) => {
      console.error("Error updating student:", error.message);
      const errorMessage = `Failed to save changes: ${error.message}. Please refresh and try again.`;
      displayMessageBox(errorMessage, "error");
    });
};

// Make a student's row editable: name, subject, marks - globally accessible
window.makeEditable = function (id) {
  console.log(`makeEditable called for student ID: ${id}`);
  const fields = ["name", "subject", "marks"]; // 'name' and 'subject' will be inputs, 'marks' contenteditable

  fields.forEach((field) => {
    const elementId = `${field}-${id}`;
    const element = document.getElementById(elementId);

    if (!element) {
      console.warn(
        `Element with ID '${elementId}' not found for student ID ${id}.`
      );
      return; // Skip if element not found
    }

    const originalValue = element.textContent.trim();
    let editableElement = element; // This will be the element we listen to for blur/keydown

    if (field === "name" || field === "subject") {
      // For Name and Subject, create an input field
      const input = document.createElement("input");
      input.type = "text";
      input.value = originalValue;
      input.className = "edit-input"; // Add a class for styling
      // Apply inline styles to the input to ensure it's visible and interactive
      input.style.width = "calc(100% - 10px)"; // Adjust width to fit cell, account for padding
      input.style.padding = "5px";
      input.style.boxSizing = "border-box";
      input.style.backgroundColor = "rgba(0, 0, 0, 0.3)"; // Match dark theme
      input.style.color = "#f5f5f5";
      input.style.border = "1px solid #00bfff";
      input.style.borderRadius = "5px";
      input.style.outline = "none";
      input.style.cursor = "text"; // Ensure text cursor
      input.style.userSelect = "text"; // Ensure selectable
      input.style.pointerEvents = "auto"; // Ensure interactive

      element.innerHTML = ""; // Clear existing content
      element.appendChild(input);
      input.focus(); // Focus on the newly created input
      editableElement = input; // Set the input as the element to listen to
    } else if (field === "marks") {
      // For Marks, keep it contenteditable (as it was working)
      element.contentEditable = true;
      element.focus(); // Focus on the contenteditable td
      // Select all text in the editable cell for easier editing
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    console.log(`Now editing '${elementId}'.`);

  const handleBlur = () => {
  let newValue = editableElement.textContent.trim();
  element.innerHTML = newValue;
  element.contentEditable = false;

  editableElement.removeEventListener("blur", handleBlur);
  editableElement.removeEventListener("keydown", handleKeydown);

  if (newValue !== originalValue) {
    window.updateField(id, field, newValue);
  }
};

    const handleKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent new line or form submission
        editableElement.blur(); // Trigger blur event to save
      }
    };

    editableElement.addEventListener("blur", handleBlur);
    editableElement.addEventListener("keydown", handleKeydown);
    console.log(`Event listeners added for '${elementId}'.`);
  });
};

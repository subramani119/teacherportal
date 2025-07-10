console.log("✅ script.js is loading");

// ✅ CSRF helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// ✅ Display message box
function displayMessageBox(message, type = "info") {
  const box = document.getElementById("message-box");
  if (!box) {
    alert(message);
    return;
  }
  box.textContent = message;
  box.style.color = type === "error" ? "red" : "green";
  box.style.display = "block";
}

// ✅ Show and hide modal
window.showModal = function () {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "block";
};

window.hideModal = function () {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
};

// ✅ DOM Ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM fully loaded");

  const studentForm = document.getElementById("student-form");

  if (!studentForm) {
    console.warn("❌ studentForm not found in DOM");
    return;
  }

  // ✅ Form submit handler
  studentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("✅ form submit handler triggered");

    const name = studentForm.querySelector('input[name="name"]').value.trim();
    const subject = studentForm.querySelector('input[name="subject"]').value.trim();
    const marks = parseInt(studentForm.querySelector('input[name="marks"]').value.trim());

    if (!name || !subject || isNaN(marks)) {
      displayMessageBox("Please fill all fields correctly.", "error");
      return;
    }

    if (!isNaN(name)) {
      displayMessageBox("Name cannot be a number.", "error");
      return;
    }
    if (!isNaN(subject)) {
      displayMessageBox("Subject cannot be a number.", "error");
      return;
    }

    // ✅ Validate marks as a number between 0 and 100
    const mark = parseInt(marks);
    if (isNaN(mark) || mark < 0 || mark > 100) {
      displayMessageBox("Marks must be a number between 0 and 100.", "error");
      return;
    }
    const data = { name, subject, marks };

    try {
      const response = await fetch("/create-add-student/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("✅ Server responded:", result);

      if (result.success) {
        displayMessageBox(result.message || "Student added successfully!", "success");
        setTimeout(() => location.reload(), 1000);
      } else {
        displayMessageBox(result.error || "Error adding student.", "error");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      displayMessageBox("Something went wrong.", "error");
    }
  });
});

// ✅ Edit Row
window.makeRowEditable = function (id) {
  const fields = ['name', 'subject', 'marks'];

  fields.forEach(field => {
    const cell = document.getElementById(`${field}-cell-${id}`);
    if (cell) {
      const value = cell.textContent.trim();
      cell.innerHTML = `<input type="text" id="${field}-input-${id}" value="${value}">`;
    }
  });

  const row = document.getElementById(`row-cell-${id}`);
  if (row) {
    row.querySelector('td:last-child').innerHTML = `
      <button onclick="saveRow(${id})">Save</button>
      <button onclick="deleteStudent(${id})">Delete</button>
    `;
  }
};

// ✅ Save Row
window.saveRow = function (id) {
  const fields = ['name', 'subject', 'marks'];
  const data = {};

  fields.forEach(field => {
    const input = document.getElementById(`${field}-input-${id}`);
    if (input) data[field] = input.value.trim();
  });

  fetch(`/update-student/${id}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      if (result.status === 'success') {
        fields.forEach(field => {
          const cell = document.getElementById(`${field}-cell-${id}`);
          if (cell) cell.textContent = data[field];
        });

        const row = document.getElementById(`row-cell-${id}`);
        if (row) {
          row.querySelector('td:last-child').innerHTML = `
            <button onclick="makeRowEditable(${id})">Edit</button>
            <button onclick="deleteStudent(${id})">Delete</button>
          `;
        }
        displayMessageBox("Student updated successfully.", "success");
      } else {
        displayMessageBox(result.message || "Failed to update.", "error");
      }
    })
    .catch(err => {
      console.error("❌ Update error:", err);
      displayMessageBox("Server error during update.", "error");
    });
};

// ✅ Delete Row
window.deleteStudent = function (id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  fetch(`/delete-student/${id}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({})
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        const row = document.getElementById(`row-cell-${id}`);
        if (row) row.remove();
        displayMessageBox("Student deleted successfully.", "success");
      } else {
        displayMessageBox(data.message || "Failed to delete student.", "error");
      }
    })
    .catch(err => {
      console.error("❌ Delete error:", err);
      displayMessageBox("Server error during delete.", "error");
    });
};

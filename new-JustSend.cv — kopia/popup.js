document.addEventListener("DOMContentLoaded", async () => {
  const statusElement = document.getElementById("status");
  const noteForm = document.getElementById("noteForm");
  const noteInput = document.getElementById("noteInput");
  const saveButton = document.getElementById("saveNote");
  const messageElement = document.getElementById("message");

  let isLoggedIn = false;

  try {
    const response = await fetch("http://localhost:3000/api/sync", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    isLoggedIn = response.ok && data.isLoggedIn;

    if (isLoggedIn) {
      statusElement.textContent = "Jesteś zalogowany!";
      noteForm.classList.add('visible');
    } else {
      statusElement.textContent = "Nie jesteś zalogowany.";
    }
  } catch (error) {
    statusElement.textContent = "Błąd: Nie udało się połączyć z aplikacją.";
    console.error("Błąd:", error);
  }

  saveButton.addEventListener("click", async () => {
    const note = noteInput.value.trim();
    if (!note) return;

    saveButton.disabled = true;
    messageElement.style.display = 'none';

    try {
      const response = await fetch("http://localhost:3000/api/note", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      const data = await response.json();

      if (response.ok) {
        messageElement.textContent = "Notatka została zapisana!";
        messageElement.className = "message success";
        noteInput.value = "";
      } else {
        throw new Error(data.error || "Nie udało się zapisać notatki");
      }
    } catch (error) {
      messageElement.textContent = error.message;
      messageElement.className = "message error";
    } finally {
      messageElement.style.display = 'block';
      saveButton.disabled = false;
    }
  });
});
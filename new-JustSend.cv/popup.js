// document.addEventListener("DOMContentLoaded", async () => {
//   const statusElement = document.getElementById("status");
//   const noteForm = document.getElementById("noteForm");
//   const noteInput = document.getElementById("noteInput");
//   const saveButton = document.getElementById("saveNote");
//   const messageElement = document.getElementById("message");

//   let isLoggedIn = false;

//   // Sprawdzenie statusu logowania
//   try {
//     const response = await fetch("http://localhost:3000/api/sync", {
//       method: "GET",
//       credentials: "include",
//     });

//     const data = await response.json();
//     isLoggedIn = response.ok && data.isLoggedIn;

//     if (isLoggedIn) {
//       statusElement.textContent = `Jesteś zalogowany jako ${data.userData?.email}`;
//       noteForm.classList.add("visible");
//     } else {
//       statusElement.textContent = "Nie jesteś zalogowany.";
//     }
//   } catch (error) {
//     statusElement.textContent = "Błąd: Nie udało się połączyć z aplikacją.";
//     console.error("Błąd:", error);
//   }

//   // Zapis notatki
//   saveButton.addEventListener("click", async () => {
//     const note = noteInput.value.trim();
//     if (!note) {
//       messageElement.textContent = "Wpisz notatkę!";
//       messageElement.className = "message error";
//       messageElement.style.display = "block";
//       return;
//     }

//     saveButton.disabled = true;
//     messageElement.style.display = "none";

//     try {
//       const response = await fetch("http://localhost:3000/api/note", {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ note }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         messageElement.textContent = "Notatka została zapisana!";
//         messageElement.className = "message success";
//         noteInput.value = "";
//       } else {
//         throw new Error(data.error || "Nie udało się zapisać notatki");
//       }
//     } catch (error) {
//       messageElement.textContent = error.message;
//       messageElement.className = "message error";
//     } finally {
//       messageElement.style.display = "block";
//       saveButton.disabled = false;
//     }
//   });
// });


document.addEventListener("DOMContentLoaded", async () => {
  const statusElement = document.getElementById("status");
  const jobForm = document.getElementById("jobForm");
  const positionInput = document.getElementById("positionInput");
  const companyInput = document.getElementById("companyInput");
  const saveButton = document.getElementById("saveJob");
  const messageElement = document.getElementById("message");

  let isLoggedIn = false;

  // Sprawdzenie statusu logowania
  try {
    const response = await fetch("https://8b81-2a01-115f-4902-7900-f08a-fe17-f217-fa8e.ngrok-free.app/api/sync", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    isLoggedIn = response.ok && data.isLoggedIn;

    if (isLoggedIn) {
      statusElement.textContent = `Zalogowany jako: ${data.userData?.email}`;
      jobForm.classList.add("visible");
    } else {
      statusElement.textContent = "Nie jesteś zalogowany.";
    }
  } catch (error) {
    statusElement.textContent = "Błąd: Nie udało się połączyć z aplikacją.";
    console.error("Błąd:", error);
  }

  // Zapis oferty pracy
  saveButton.addEventListener("click", async () => {
    const position = positionInput.value.trim();
    const company = companyInput.value.trim();

    if (!position) {
      messageElement.textContent = "Wpisz stanowisko!";
      messageElement.className = "message error";
      messageElement.style.display = "block";
      return;
    }

    saveButton.disabled = true;
    messageElement.style.display = "none";

    try {
      const response = await fetch("http://localhost:3000/api/job_offers", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ position, company }),
      });

      const data = await response.json();

      if (response.ok) {
        messageElement.textContent = "Oferta została zapisana!";
        messageElement.className = "message success";
        positionInput.value = "";
        companyInput.value = "";
      } else {
        throw new Error(data.error || "Nie udało się zapisać oferty");
      }
    } catch (error) {
      messageElement.textContent = error.message;
      messageElement.className = "message error";
    } finally {
      messageElement.style.display = "block";
      saveButton.disabled = false;
    }
  });
});
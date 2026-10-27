const createForm = document.getElementById("create-hackathon-form");

if (createForm) {
  if (!getApiToken() || getApiAccount()?.role !== "organizer") {
    window.location.href = "../pages/organizer-login.html";
  } else {
    createForm.addEventListener("submit", async event => {
      event.preventDefault();
      const submit = createForm.querySelector("button[type=submit]");
      submit.disabled = true;
      try {
        await apiPost("/hackathons", {
          name: document.getElementById("hackathon-name").value,
          description: document.getElementById("description").value,
          startDate: document.getElementById("start-date").value,
          endDate: document.getElementById("end-date").value,
          mode: document.getElementById("mode").value,
          venue: document.getElementById("venue").value,
          deadline: document.getElementById("deadline").value,
          maxParticipants: Number(document.getElementById("max-participants").value) || undefined
        });
        window.location.href = "../pages/organizer-dashboard.html";
      } catch (error) {
        const message = document.createElement("p");
        message.className = "auth-error";
        message.textContent = error.message;
        createForm.prepend(message);
      } finally {
        submit.disabled = false;
      }
    });
  }
}

/* === Theme Toggle === */
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");

  if (currentTheme === "light") {
    html.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    document.getElementById("theme-toggle").innerText = "☀️";
  } else {
    html.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    document.getElementById("theme-toggle").innerText = "🌙";
  }
}

/* === DOMContentLoaded: Set theme & AI assistant === */
document.addEventListener("DOMContentLoaded", () => {
  // Theme initialization
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (savedTheme === "dark") {
    document.getElementById("theme-toggle").innerText = "☀️";
  } else {
    document.getElementById("theme-toggle").innerText = "🌙";
  }

  // AI Assistant: Respond with "Thank you for your question."
  const aiSendBtn = document.getElementById("ai-send");
  aiSendBtn.addEventListener("click", () => {
    const userQuestion = document.getElementById("ai-input").value.trim();
    if (userQuestion) {
      document.getElementById("ai-response").innerText = "Thank you for your question.";
      document.getElementById("ai-input").value = "";
    }
  });
});

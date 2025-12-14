// List of keywords and their responses
const keywords = [
  { triggers: ["jobs", "vacancies", "open positions"], response: "You can see all open positions on our Jobs page!" },
  { triggers: ["courses", "learning", "training"], response: "Check out these recommended web development courses: Coursera, freeCodeCamp, and Codecademy." },
  { triggers: ["company", "about", "who are you"], response: "Hot Beans Web is a company dedicated to training new web developers. Founded in 2020!" },
  { triggers: ["application", "apply", "cv"], response: "To apply, visit the Apply page and fill out the form. Good luck!" },
  { triggers: ["location", "address", "where"], response: "We are based in Cheltenham, UK." },
  { triggers: ["contact", "email", "phone"], response: "You can reach us on the Contact page or email us at info@hotbeansweb.com" },
  { triggers: ["internships", "work experience"], response: "We offer internships for students interested in IT and web development. Check the Jobs page for openings." },
  { triggers: ["support", "help", "assistance"], response: "Our support team is available Monday to Friday, 9am to 5pm." }
];

// Suggested questions to display in the widget
const suggestedQuestions = [
  "jobs", "courses", "company", "application", "location", "contact", "internships", "support"
];

// Main function
function askAssistant() {
  const inputElement = document.getElementById("ai-input");
  const userInput = inputElement.value.trim().toLowerCase();
  const response = document.getElementById("ai-response");

  if (!userInput) {
    response.innerText = "Please enter a question!";
    return;
  }

  // Simulate AI thinking
  response.innerText = "...";
  
  setTimeout(() => {
    let answered = false;

    // 1. Keyword matching
    for (const item of keywords) {
      for (const trigger of item.triggers) {
        if (userInput.includes(trigger)) {
          response.innerText = item.response;
          answered = true;
          break;
        }
      }
      if (answered) break;
    }

    // 2. Simple word similarity matching if no keyword matched
    if (!answered) {
      let maxMatches = 0;
      let bestResponse = null;

      for (const item of keywords) {
        for (const trigger of item.triggers) {
          const inputWords = userInput.split(/\s+/);
          const triggerWords = trigger.split(/\s+/);
          const matches = inputWords.filter(w => triggerWords.includes(w)).length;

          if (matches > maxMatches) {
            maxMatches = matches;
            bestResponse = item.response;
          }
        }
      }

      if (bestResponse && maxMatches > 0) {
        response.innerText = bestResponse;
        answered = true;
      }
    }

    // 3. Default response
    if (!answered) {
      response.innerText = "I don’t have that answer, sorry!";
    }

    // Show suggested questions
    response.innerHTML += `<br><small>Try asking about: ${suggestedQuestions.join(", ")}</small>`;

    // Clear input
    inputElement.value = "";
  }, 600); // 0.6s delay to simulate thinking
}

// Event listeners
document.getElementById("ai-send").addEventListener("click", askAssistant);
document.getElementById("ai-input").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    askAssistant();
  }
});

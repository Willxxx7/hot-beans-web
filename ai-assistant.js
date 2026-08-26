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

// Simple suggested questions
const suggestedQuestions = ["jobs", "courses", "company info", "application process", "location", "contact", "internships", "support"];

function askAssistant() {
    console.log("askAssistant function called!"); // This should appear in browser console
    
    const inputElement = document.getElementById("ai-input");
    const responseElement = document.getElementById("ai-response");
    
    // Debug: Check if elements exist
    if (!inputElement) {
        console.error("ERROR: Could not find element with id='ai-input'");
        alert("Error: Could not find input field. Check your HTML.");
        return;
    }
    
    if (!responseElement) {
        console.error("ERROR: Could not find element with id='ai-response'");
        alert("Error: Could not find response field. Check your HTML.");
        return;
    }
    
    const userInput = inputElement.value.trim().toLowerCase();
    console.log("User asked:", userInput);
    
    if (!userInput) {
        responseElement.innerText = "Please enter a question!";
        return;
    }
    
    responseElement.innerText = "Thinking...";
    
    setTimeout(() => {
        let answered = false;
        
        // 1. Direct keyword matching
        for (const item of keywords) {
            for (const trigger of item.triggers) {
                if (userInput.includes(trigger)) {
                    responseElement.innerText = item.response;
                    answered = true;
                    console.log("Matched trigger:", trigger);
                    break;
                }
            }
            if (answered) break;
        }
        
        // 2. If no direct match, try word matching
        if (!answered) {
            const userWords = userInput.split(/\s+/);
            let bestMatchCount = 0;
            let bestResponse = "";
            
            for (const item of keywords) {
                for (const trigger of item.triggers) {
                    const triggerWords = trigger.split(/\s+/);
                    let matchCount = 0;
                    
                    for (const word of userWords) {
                        if (triggerWords.includes(word)) {
                            matchCount++;
                        }
                    }
                    
                    if (matchCount > bestMatchCount) {
                        bestMatchCount = matchCount;
                        bestResponse = item.response;
                    }
                }
            }
            
            if (bestMatchCount > 0) {
                responseElement.innerText = bestResponse;
                answered = true;
                console.log("Word similarity match found with", bestMatchCount, "matches");
            }
        }
        
        // 3. Default response
        if (!answered) {
            responseElement.innerText = "I don't have information about that. Try asking about jobs, courses, or company information.";
            console.log("No match found for query:", userInput);
        }
        
        // Add suggestions
        const existingSuggestions = document.getElementById("suggestions");
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
        
        const suggestionsDiv = document.createElement("div");
        suggestionsDiv.id = "suggestions";
        suggestionsDiv.style.cssText = "font-size:0.8em;color:#666;margin-top:10px;";
        suggestionsDiv.textContent = "Try asking about: " + suggestedQuestions.slice(0, 3).join(", ");
        responseElement.parentNode.appendChild(suggestionsDiv);
        
        // Clear input
        inputElement.value = "";
        
    }, 600);
}

// Add Enter key support
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, setting up event listeners");
    
    const inputElement = document.getElementById("ai-input");
    if (inputElement) {
        inputElement.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                askAssistant();
            }
        });
        console.log("Enter key listener added to ai-input");
    } else {
        console.error("Could not find ai-input element on DOMContentLoaded");
    }
    
    // Test that function is accessible globally
    window.askAssistant = askAssistant;
    console.log("askAssistant function is now available globally");
});
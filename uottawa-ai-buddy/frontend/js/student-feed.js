import { getAllOpportunities, saveInteraction } from "./supabase-client.js";
import { matchWithGemini } from "./gemini-matching.js";

const feedContainer = document.getElementById("feed-container");
const tabButtons = document.querySelectorAll(".tab-btn");

let matchedOpportunities = {
  careers: [],
  activities: [],
  discovered: []
};

// Load student profile

const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
  window.location.href = "student-signup.html";
}

// Initialize feed

async function initFeed() {
  try {
    // Get all opportunities from database
    const opportunities = await getAllOpportunities();

    if (!opportunities || opportunities.length === 0) {
      renderEmptyState();
      return;
    }

    // Match using Gemini
    const matches = await matchWithGemini(student, opportunities);

    // Separate by category
    matchedOpportunities.careers = matches.filter(
      o => o.category === "careers"
    );
    matchedOpportunities.activities = matches.filter(
      o => o.category === "activities"
    );
    matchedOpportunities.discovered = matches.filter(
      o => o.category === "discovered"
    );

    // Render default tab
    renderFeed("careers");
  } catch (error) {
    console.error("Error loading feed:", error);
    feedContainer.innerHTML =
      "<p>Something went wrong loading your feed.</p>";
  }
}

//TAB HANDLING

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    tabButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    renderFeed(category);
  });
});

// RENDERING FUNCTIONS

function renderFeed(category) {
  const list = matchedOpportunities[category];
  feedContainer.innerHTML = "";

  if (!list || list.length === 0) {
    renderEmptyState();
    return;
  }

  list.forEach(opportunity => {
    const card = createOpportunityCard(opportunity);
    feedContainer.appendChild(card);
  });
}

function renderEmptyState() {
  feedContainer.innerHTML = `
    <div class="empty-state">
      <p>No matches yet.</p>
      <p>Check back later 👀</p>
    </div>
  `;
}

//opportunity card creation

function createOpportunityCard(opportunity) {
  const card = document.createElement("div");
  card.className = "opportunity-card";

  card.innerHTML = `
    <h3>${opportunity.title}</h3>
    <p>${opportunity.description}</p>

    ${
      opportunity.type === "event"
        ? `<p><strong>Date:</strong> ${opportunity.date}</p>
           <p><strong>Time:</strong> ${opportunity.time}</p>
           <p><strong>Location:</strong> ${opportunity.location}</p>`
        : `<p><strong>Deadline:</strong> ${opportunity.deadline}</p>`
    }

    ${
      opportunity.category === "discovered"
        ? `<span class="badge">🤖 Auto-discovered</span>`
        : ""
    }
  `;

  card.addEventListener("click", () => {
    handleOpportunityClick(opportunity.id);
  });

  return card;
}

// feedback prompt after 5 clicks

let clickCount = 0;

async function handleOpportunityClick(opportunityId) {
  clickCount++;

  try {
    await saveInteraction(student.id, opportunityId);
  } catch (error) {
    console.error("Failed to save interaction:", error);
  }

  if (clickCount === 5) {
    showFeedbackPrompt();
  }
}

function showFeedbackPrompt() {
  alert("Thanks! Your interactions help us improve recommendations 🙌");
}

//start the feed

initFeed();

/*************************************************
 * STUDENT FEED SCRIPT
 * - Loads student from localStorage
 * - Fetches matches from Supabase (via wrapper)
 * - Joins with opportunities
 * - Displays personalized feed with beautiful design
 * - Includes feedback/survey feature
 *************************************************/

console.log("🚀 Feed page loaded");

let student = null;
let clickCount = 0;

const allOpportunities = {
    careers: [],
    activities: [],
    discovered: []
};

/*************************************************
 * INIT
 *************************************************/
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ Student feed script loaded");
    await loadStudentAndMatches();
    
    // Load click count from localStorage
    clickCount = parseInt(localStorage.getItem('clickCount') || '0');
});

/*************************************************
 * LOAD STUDENT + MATCHES
 *************************************************/
async function loadStudentAndMatches() {
    const studentData = localStorage.getItem("student");

    if (!studentData) {
        console.warn("⚠️ No student found, redirecting...");
        window.location.href = "student-signup.html";
        return;
    }

    student = JSON.parse(studentData);
    console.log("👤 Student loaded:", student.name);

    // Header info
    const firstName = student.name.split(" ")[0];
    document.getElementById("student-name").textContent = firstName;
    document.getElementById("student-info").textContent =
        `${student.program} • Year ${student.year}`;

    try {
        console.log("📥 Fetching matches from database...");

        // 1️⃣ Fetch matches (WRAPPER STYLE)
        const matches = await supabase.select("matches", {
            student_id: student.id
        });

        if (!matches || matches.length === 0) {
            console.log("ℹ️ No matches found");
            showEmptyState();
            return;
        }

        console.log(`📊 Found ${matches.length} matches`);

        // 2️⃣ Fetch related opportunities
        const opportunityIds = matches.map(m => m.opportunity_id);

        const opportunities = await supabase.selectIn(
            "opportunities",
            "id",
            opportunityIds
        );

        if (!opportunities || opportunities.length === 0) {
            throw new Error("Failed to fetch opportunities");
        }

        // 3️⃣ Merge matches + opportunities
        const enrichedOpportunities = matches
            .map(match => {
                const opp = opportunities.find(
                    o => o.id === match.opportunity_id
                );

                if (!opp) return null;

                return {
                    ...opp,
                    match_score: match.match_score,
                    match_reasoning: match.reasoning
                };
            })
            .filter(Boolean);

        // 4️⃣ Sort by match score (best first)
        enrichedOpportunities.sort(
            (a, b) => (b.match_score || 0) - (a.match_score || 0)
        );

        // 5️⃣ Split by category
        enrichedOpportunities.forEach(opp => {
            if (opp.category === "careers") {
                allOpportunities.careers.push(opp);
            } else if (opp.category === "activities") {
                allOpportunities.activities.push(opp);
            } else {
                allOpportunities.discovered.push(opp);
            }
        });

        updateTabCounts();
        showFeed();

    } catch (error) {
        console.error("❌ Error loading student feed:", error);
        showEmptyState();
    }
}

/*************************************************
 * UI HELPERS
 *************************************************/
function updateTabCounts() {
    document.getElementById("careers-count").textContent =
        allOpportunities.careers.length;

    document.getElementById("activities-count").textContent =
        allOpportunities.activities.length;

    document.getElementById("discovered-count").textContent =
        allOpportunities.discovered.length;
}

function showFeed() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("feed-content").style.display = "block";
    displayOpportunities("careers");
}

function showEmptyState() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("feed-content").style.display = "block";
    document.getElementById("empty-state").style.display = "block";
}

/*************************************************
 * DISPLAY OPPORTUNITIES (WITH BEAUTIFUL DESIGN)
 *************************************************/
function displayOpportunities(activeTab = "careers") {
    const container = document.getElementById("opportunities-container");
    container.innerHTML = "";

    const list = allOpportunities[activeTab];

    if (!list || list.length === 0) {
        document.getElementById("empty-state").style.display = "block";
        return;
    }

    document.getElementById("empty-state").style.display = "none";

    list.forEach(opp => {
        const card = document.createElement("div");
        card.className = "opportunity-card";
        
        // Track clicks for feedback
        card.addEventListener('click', () => {
            trackClick(opp);
        });

        // Build tags
        let tagsHTML = '<div class="opp-tags">';
        tagsHTML += `<span class="opp-tag type-tag">${opp.type || 'Event'}</span>`;
        tagsHTML += `<span class="opp-tag match-tag"> ${opp.match_score || 'N/A'}% Match</span>`;
        if (opp.posted_by === 'Auto-scraper') {
            tagsHTML += `<span class="opp-tag auto-tag"> AI Discovered</span>`;
        }
        tagsHTML += '</div>';

        // Build details
        let detailsHTML = '<div class="opp-details">';
        if (opp.event_date) {
            detailsHTML += `<span class="opp-detail"> ${formatDate(opp.event_date)}</span>`;
        }
        if (opp.event_time) {
            detailsHTML += `<span class="opp-detail"> ${opp.event_time}</span>`;
        }
        if (opp.location) {
            detailsHTML += `<span class="opp-detail"> ${opp.location}</span>`;
        }
        if (opp.deadline) {
            detailsHTML += `<span class="opp-detail deadline"> Deadline: ${formatDate(opp.deadline)}</span>`;
        }
        detailsHTML += '</div>';

        card.innerHTML = `
            ${tagsHTML}
            
            <h3 class="opp-title">${opp.title}</h3>
            
            ${opp.organization ? `<p class="opp-posted-by">Posted by ${opp.organization}</p>` : ''}
            
            <p class="opp-description">${opp.description || ""}</p>
            
            ${opp.match_reasoning ? `<div class="opp-reasoning"> ${opp.match_reasoning}</div>` : ''}
            
            ${opp.amount ? `<p class="opp-amount"> ${opp.amount}</p>` : ''}
            
            ${detailsHTML}
        `;

        container.appendChild(card);
    });
}

/*************************************************
 * TAB SWITCHING
 *************************************************/
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach(tab => {
        tab.classList.remove("active");
    });

    const activeTab = document.querySelector(`.tab-btn[data-category="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add("active");
    }

    // Display opportunities for this tab
    displayOpportunities(tabName);
}

/*************************************************
 * FEEDBACK SYSTEM
 *************************************************/
function trackClick(opportunity) {
    clickCount++;
    localStorage.setItem('clickCount', clickCount.toString());
    
    console.log(` Click tracked: ${opportunity.title} (Total: ${clickCount})`);
    
    // Show feedback prompt after 5 clicks
    if (clickCount === 5 || clickCount % 10 === 0) {
        showFeedbackPrompt();
    }
    
    // Save interaction to database
    saveInteraction(opportunity.id, 'clicked');
}

function showFeedbackPrompt() {
    const prompt = document.getElementById("feedback-prompt");
    document.getElementById("click-count").textContent = clickCount;
    prompt.style.display = "block";
    
    // Scroll to top to show prompt
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeFeedback() {
    document.getElementById("feedback-prompt").style.display = "none";
}

async function handleFeedback(preference) {
    console.log(`📝 Feedback received: ${preference}`);
    
    try {
        // Save feedback to database
        await supabase.insert("feedback", {
            student_id: student.id,
            sentiment: "positive",
            preference: preference
        });
        
        console.log(" Feedback saved");
        
        // Show thank you message
        const prompt = document.getElementById("feedback-prompt");
        prompt.innerHTML = `
            <button class="close-feedback" onclick="closeFeedback()">×</button>
            <h3> Thank you!</h3>
            <p>We'll show you more ${preference.replace('_', ' ')} in your feed.</p>
        `;
        
        // Close after 3 seconds
        setTimeout(closeFeedback, 3000);
        
    } catch (error) {
        console.error("❌ Error saving feedback:", error);
    }
}

async function saveInteraction(opportunityId, action) {
    try {
        await supabase.insert("interactions", {
            student_id: student.id,
            opportunity_id: opportunityId,
            action: action
        });
    } catch (error) {
        console.error("❌ Error saving interaction:", error);
    }
}

/*************************************************
 * UTILITY FUNCTIONS
 *************************************************/
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
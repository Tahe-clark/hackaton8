// student-feed.js - Feed page logic with 3 categories

let student = null;
let allOpportunities = {
    careers: [],
    activities: [],
    discovered: []
};
let activeCategory = 'careers';
let clickCount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Feed page loaded');
    await loadStudentAndMatches();
});

// Global functions for HTML onclick handlers
window.switchTab = function(category) {
    console.log(`📂 Switching to ${category} tab`);
    activeCategory = category;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // Display opportunities for this category
    displayOpportunities();
}

window.closeFeedback = function() {
    document.getElementById('feedback-prompt').style.display = 'none';
}

window.handleFeedback = async function(preference) {
    console.log('📊 Feedback received:', preference);
    
    try {
        await supabase.insert('feedback', {
            student_id: student.id,
            sentiment: 'positive',
            preference: preference,
            created_at: new Date().toISOString()
        });
        
        closeFeedback();
        alert(`Thanks! We'll show you more ${preference.replace('more_', '').replace('_', ' ')}.`);
        
    } catch (error) {
        console.error('Error saving feedback:', error);
        closeFeedback();
    }
}

async function loadStudentAndMatches() {
    // Get student from localStorage
    const studentData = localStorage.getItem('student');
    
    if (!studentData) {
        console.warn('⚠️ No student profile found, redirecting to signup');
        window.location.href = 'student-signup.html';
        return;
    }
    
    student = JSON.parse(studentData);
    console.log('👤 Student loaded:', student.name);
    
    // Update header
    document.getElementById('student-name').textContent = student.name.split(' ')[0];
    document.getElementById('student-info').textContent = 
        `${student.program} • Year ${student.year}`;
    
    // Get all opportunities from database
    console.log('📥 Fetching opportunities from database...');
    let opportunities = [];
    try {
        opportunities = await supabase.getAll('opportunities');
    } catch (error) {
        console.error('❌ Error fetching opportunities:', error);
        opportunities = [];
    }
    
    console.log(`📊 Found ${opportunities.length} total opportunities`);
    
    // If no opportunities, show empty state immediately
    if (opportunities.length === 0) {
        console.log('⚠️ No opportunities in database - showing empty state');
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('feed-content').style.display = 'block';
        document.getElementById('opportunities-container').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
        return;
    }
    
    // Use Gemini to match opportunities to student
    console.log('🤖 Starting Gemini AI matching...');
    const matches = await matchOpportunitiesToStudent(student, opportunities);
    
    console.log(`✅ Gemini returned ${matches.length} matches`);
    
    // Organize matches by category
    matches.forEach(opp => {
        if (opp.category === 'careers') {
            allOpportunities.careers.push(opp);
        } else if (opp.category === 'activities') {
            allOpportunities.activities.push(opp);
        } else if (opp.category === 'discovered') {
            allOpportunities.discovered.push(opp);
        }
    });
    
    // Update tab counts
    document.getElementById('careers-count').textContent = allOpportunities.careers.length;
    document.getElementById('activities-count').textContent = allOpportunities.activities.length;
    document.getElementById('discovered-count').textContent = allOpportunities.discovered.length;
    
    // Hide loading, show feed
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('feed-content').style.display = 'block';
    
    // Display opportunities
    displayOpportunities();
    
    // Check if should show feedback
    await checkFeedbackTrigger();
}

function displayOpportunities() {
    const container = document.getElementById('opportunities-container');
    const emptyState = document.getElementById('empty-state');
    const opps = allOpportunities[activeCategory];
    
    console.log(`📋 Displaying ${opps.length} opportunities for ${activeCategory}`);
    
    if (opps.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    opps.forEach(opp => {
        const card = createOpportunityCard(opp);
        container.appendChild(card);
    });
}

function createOpportunityCard(opp) {
    const card = document.createElement('div');
    card.className = 'opportunity-card';
    
    // Type badges
    const typeIcons = {
        'Scholarship': '💰',
        'Event': '🎉',
        'Job/Internship': '💼',
        'Workshop': '🎓',
        'Research Opportunity': '🔬',
        'Volunteer Opportunity': '🤝'
    };
    
    const icon = typeIcons[opp.type] || '📌';
    
    // Build card HTML
    card.innerHTML = `
        <div class="opp-header">
            <div class="opp-tags">
                <span class="opp-tag type-tag">${icon} ${opp.type}</span>
                ${opp.match_score ? `<span class="opp-tag match-tag">✨ ${opp.match_score}% Match</span>` : ''}
                ${opp.posted_by && opp.posted_by.includes('Auto-scraped') ? '<span class="opp-tag auto-tag">🤖 Auto-discovered</span>' : ''}
            </div>
            <h3 class="opp-title">${opp.title}</h3>
            <p class="opp-posted-by">Posted by ${opp.posted_by || 'Unknown'}</p>
        </div>
        
        <p class="opp-description">${opp.description}</p>
        
        ${opp.match_reasoning ? `<p class="opp-reasoning">💡 ${opp.match_reasoning}</p>` : ''}
        
        ${opp.amount ? `<p class="opp-amount"><strong>${opp.amount}</strong></p>` : ''}
        
        <div class="opp-details">
            ${opp.event_date ? `<span class="opp-detail">📅 ${formatDate(opp.event_date)}</span>` : ''}
            ${opp.event_time ? `<span class="opp-detail">🕐 ${opp.event_time}</span>` : ''}
            ${opp.location ? `<span class="opp-detail">📍 ${opp.location}</span>` : ''}
            ${opp.deadline ? `<span class="opp-detail deadline">⏰ Deadline: ${formatDate(opp.deadline)}</span>` : ''}
        </div>
    `;
    
    // Click handler
    card.addEventListener('click', () => handleOpportunityClick(opp));
    
    return card;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function handleOpportunityClick(opp) {
    console.log('👆 Clicked opportunity:', opp.title);
    
    // Track click (SurveyMonkey challenge)
    clickCount++;
    
    try {
        await supabase.insert('interactions', {
            student_id: student.id,
            opportunity_id: opp.id,
            action: 'clicked',
            created_at: new Date().toISOString()
        });
        
        console.log(`📊 Tracked click (total: ${clickCount})`);
        
    } catch (error) {
        console.error('Error tracking click:', error);
    }
    
    // Open link if available
    const link = opp.registration_link || opp.application_link;
    if (link) {
        window.open(link, '_blank');
    }
    
    // Check if should show feedback (every 5 clicks)
    if (clickCount % 5 === 0) {
        showFeedbackPrompt();
    }
}

async function checkFeedbackTrigger() {
    try {
        // Get interaction count from database
        const interactions = await supabase.select('interactions', {
            student_id: student.id,
            action: 'clicked'
        });
        
        clickCount = interactions.length;
        console.log(`📊 Total clicks from database: ${clickCount}`);
        
    } catch (error) {
        console.error('Error checking feedback trigger:', error);
    }
}

function showFeedbackPrompt() {
    console.log('📊 Showing feedback prompt');
    const prompt = document.getElementById('feedback-prompt');
    document.getElementById('click-count').textContent = clickCount;
    prompt.style.display = 'block';
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
        if (prompt.style.display === 'block') {
            closeFeedback();
        }
    }, 30000);
}

console.log('✅ Student feed script loaded');

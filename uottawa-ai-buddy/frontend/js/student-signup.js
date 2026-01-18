// student-signup.js - Handles student profile creation
// Note: Uses global variables from constants.js and supabase-client.js

// Track current step
let currentStep = 1;
let selectedYear = null;
let selectedInterests = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Student signup page loaded');
    populateEthnicityDropdown();
    populateProgramDropdown();
    populateYearSelector();
    populateInterestsGrid();
    setupFormSubmit();
    updateProgressBar();
});

// Populate ethnicity dropdown (Step 1)
function populateEthnicityDropdown() {
    const select = document.getElementById('student-ethnicity');
    
    // Clear existing options except first
    select.innerHTML = '<option value="">Select your background</option>';
    
    // Add ethnicity options (exclude 'All' for students)
    ETHNICITY.filter(e => e !== 'All').forEach(ethnicity => {
        const option = document.createElement('option');
        option.value = ethnicity;
        option.textContent = ethnicity;
        select.appendChild(option);
    });
    
    console.log('✅ Ethnicity options populated');
}

// Populate program dropdown (Step 2)
function populateProgramDropdown() {
    const select = document.getElementById('student-program');
    
    // Clear existing options except first
    select.innerHTML = '<option value="">Select your program</option>';
    
    // Add program options (exclude 'All Programs' for students)
    PROGRAMS.filter(p => p !== 'All Programs').forEach(program => {
        const option = document.createElement('option');
        option.value = program;
        option.textContent = program;
        select.appendChild(option);
    });
    
    console.log('✅ Program options populated');
}

// Populate year selector (Step 2)
function populateYearSelector() {
    const container = document.getElementById('year-selector');
    container.innerHTML = '';
    
    YEARS.forEach(year => {
        const yearTag = document.createElement('div');
        yearTag.className = 'year-tag';
        
        // Use labels for display
        const labels = {
            1: '1st Year',
            2: '2nd Year', 
            3: '3rd Year',
            4: '4th Year',
            5: '5th Year +'
        };
        
        yearTag.textContent = labels[year];
        yearTag.dataset.year = year;
        
        // Click handler
        yearTag.addEventListener('click', () => {
            // Remove active class from all
            document.querySelectorAll('.year-tag').forEach(tag => {
                tag.classList.remove('active');
            });
            
            // Add active to clicked
            yearTag.classList.add('active');
            selectedYear = year;
            
            console.log(`📌 Selected year: ${year}`);
        });
        
        container.appendChild(yearTag);
    });
    
    console.log('✅ Year selector populated');
}

// Populate interests grid (Step 3)
function populateInterestsGrid() {
    const container = document.getElementById('interests-grid');
    container.innerHTML = '';
    
    INTERESTS.forEach(interest => {
        const interestTag = document.createElement('div');
        interestTag.className = 'interest-tag';
        interestTag.textContent = interest;
        interestTag.dataset.interest = interest;
        
        // Click handler
        interestTag.addEventListener('click', () => {
            interestTag.classList.toggle('selected'); // Use 'selected' class from CSS
            
            if (interestTag.classList.contains('selected')) {
                selectedInterests.push(interest);
            } else {
                selectedInterests = selectedInterests.filter(i => i !== interest);
            }
            
            console.log(`🎯 Selected interests: ${selectedInterests.length}`);
            updateSubmitButton();
        });
        
        container.appendChild(interestTag);
    });
    
    console.log('✅ Interests grid populated');
}

// Update submit button based on interests selected
function updateSubmitButton() {
    const submitBtn = document.querySelector('.btn-finish');
    const minInterests = 3;
    
    if (selectedInterests.length >= minInterests) {
        submitBtn.disabled = false;
        submitBtn.textContent = `Explore my Feed (${selectedInterests.length} interests)`;
    } else {
        submitBtn.disabled = true;
        submitBtn.textContent = `Select ${minInterests - selectedInterests.length} more interests`;
    }
}

// Navigate between steps
window.nextStep = function(step) {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    // Show next step
    document.getElementById(`step-${step}`).classList.add('active');
    
    currentStep = step;
    updateProgressBar();
    
    console.log(`➡️ Moved to step ${step}`);
}

// Validate step before proceeding
function validateStep(step) {
    if (step === 1) {
        const name = document.getElementById('student-name').value;
        const ethnicity = document.getElementById('student-ethnicity').value;
        
        if (!name || !ethnicity) {
            alert('Please fill in all required fields');
            return false;
        }
    }
    
    if (step === 2) {
        const program = document.getElementById('student-program').value;
        
        if (!program) {
            alert('Please select your program');
            return false;
        }
        
        if (!selectedYear) {
            alert('Please select your year');
            return false;
        }
    }
    
    return true;
}

// Update progress bar
function updateProgressBar() {
    const progress = document.getElementById('progress');
    const percentage = (currentStep / 3) * 100;
    progress.style.width = `${percentage}%`;
}

// Setup form submit
function setupFormSubmit() {
    const form = document.getElementById('onboarding-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate final step
        if (selectedInterests.length < 3) {
            alert('Please select at least 3 interests');
            return;
        }
        
        // Gather all form data
        const studentData = {
            name: document.getElementById('student-name').value,
            ethnicity: [document.getElementById('student-ethnicity').value],
            program: document.getElementById('student-program').value,
            year: selectedYear,
            interests: selectedInterests,
            created_at: new Date().toISOString()
        };
        
        console.log('📝 Submitting student profile:', studentData);
        
        // Show loading state
        const submitBtn = document.querySelector('.btn-finish');
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Creating your profile...';
        
        try {
            // Save to database
            const result = await supabase.insert('students', studentData);
            
            if (result && result.length > 0) {
                console.log('✅ Profile created successfully!');
                
                const savedStudent = result[0];
                
                // Save student ID and data to localStorage
                localStorage.setItem('studentId', savedStudent.id);
                localStorage.setItem('student', JSON.stringify(savedStudent));
                
                // Show success message
                submitBtn.textContent = '✅ Profile created!';
                
                // 🔥 GENERATE MATCHES AUTOMATICALLY
                await generateMatchesForNewStudent(savedStudent);
                
                // Mark as new user for welcome message
                localStorage.setItem('isNewUser', 'true');
                
                // Redirect to feed page
                window.location.href = 'student-feed.html';
                
            } else {
                throw new Error('Failed to create profile');
            }
            
        } catch (error) {
            console.error('❌ Error creating profile:', error);
            alert('Error creating profile. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Explore my Feed';
        }
    });
}

/*************************************************
 * AUTO-GENERATE MATCHES FOR NEW STUDENTS
 *************************************************/
async function generateMatchesForNewStudent(student) {
    console.log("🤖 Generating matches for new student...");
    
    try {
        // Afficher un message de chargement
        showLoadingMessage("Creating your personalized feed...");
        
        // Récupérer toutes les opportunités
        const opportunities = await supabase.getAll("opportunities");
        console.log(`📊 Found ${opportunities.length} opportunities`);
        
        if (opportunities.length === 0) {
            console.warn("⚠️ No opportunities in database");
            hideLoadingMessage();
            return;
        }
        
        let matchesCreated = 0;
        
        // Pour chaque opportunité, calculer et créer un match
        for (const opp of opportunities) {
            const matchScore = calculateMatchScore(student, opp);
            
            // Créer un match si le score est bon (>60%)
            if (matchScore >= 60) {
                const reasoning = generateReasoning(student, opp, matchScore);
                
                try {
                    await supabase.insert("matches", {
                        student_id: student.id,
                        opportunity_id: opp.id,
                        match_score: matchScore,
                        reasoning: reasoning
                    });
                    
                    matchesCreated++;
                    console.log(`  ✅ Match: ${opp.title} (${matchScore}%)`);
                } catch (error) {
                    console.error(`  ❌ Failed to create match: ${error}`);
                }
            }
        }
        
        console.log(`🎉 Created ${matchesCreated} matches!`);
        hideLoadingMessage();
        
    } catch (error) {
        console.error("❌ Error generating matches:", error);
        hideLoadingMessage();
    }
}

function calculateMatchScore(student, opportunity) {
    let score = 0;
    let maxScore = 0;
    
    // Program match (30 points)
    const targetPrograms = opportunity.target_programs || [];
    if (targetPrograms.length > 0) {
        maxScore += 30;
        if (targetPrograms.includes("All Programs") || targetPrograms.includes(student.program)) {
            score += 30;
        }
    }
    
    // Year match (20 points)
    const targetYears = opportunity.target_years || [];
    if (targetYears.length > 0) {
        maxScore += 20;
        if (targetYears.includes(student.year)) {
            score += 20;
        }
    }
    
    // Interests match (30 points)
    const targetInterests = opportunity.target_interests || [];
    if (targetInterests.length > 0 && student.interests && student.interests.length > 0) {
        maxScore += 30;
        const matching = targetInterests.filter(i => student.interests.includes(i));
        if (matching.length > 0) {
            score += (matching.length / targetInterests.length) * 30;
        }
    }
    
    // Ethnicity match (20 points)
    const targetEthnicity = opportunity.target_ethnicity || [];
    if (targetEthnicity.length > 0 && student.ethnicity && student.ethnicity.length > 0) {
        maxScore += 20;
        const matching = targetEthnicity.filter(e => student.ethnicity.includes(e));
        if (matching.length > 0) {
            score += 20;
        }
    }
    
    // Si aucun critère, donner un score de base
    if (maxScore === 0) {
        return 70; // Score par défaut pour les opportunités ouvertes à tous
    }
    
    // Retourner le pourcentage
    return Math.round((score / maxScore) * 100);
}

function generateReasoning(student, opportunity, score) {
    const reasons = [];
    
    const targetPrograms = opportunity.target_programs || [];
    if (targetPrograms.includes(student.program) || targetPrograms.includes("All Programs")) {
        reasons.push(`Perfect for ${student.program} students`);
    }
    
    const targetYears = opportunity.target_years || [];
    if (targetYears.includes(student.year)) {
        reasons.push(`Ideal for Year ${student.year}`);
    }
    
    const targetInterests = opportunity.target_interests || [];
    if (targetInterests.length > 0 && student.interests) {
        const matching = targetInterests.filter(i => student.interests.includes(i));
        if (matching.length > 0) {
            reasons.push(`Matches your interests: ${matching.slice(0, 2).join(", ")}`);
        }
    }
    
    if (reasons.length === 0) {
        return "Open to all students";
    }
    
    return reasons.join(" • ");
}

function showLoadingMessage(message) {
    // Créer un overlay de chargement
    const overlay = document.createElement('div');
    overlay.id = 'match-loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(143, 0, 26, 0.95);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: Inter, sans-serif;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 20px; animation: bounce 1s infinite;">🤖</div>
            <h2 style="font-size: 2rem; margin-bottom: 10px;">AI Magic in Progress...</h2>
            <p style="font-size: 1.2rem; opacity: 0.9;">${message}</p>
        </div>
        <style>
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        </style>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoadingMessage() {
    const overlay = document.getElementById('match-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}
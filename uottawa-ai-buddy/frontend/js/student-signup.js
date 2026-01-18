// student-signup.js - Handles student profile creation
// Note: Uses global variables from constants.js and supabase-client.js

// Track current step
let currentStep = 1;
let selectedYear = null;
let selectedInterests = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log(' Student signup page loaded');
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
            
            console.log(` Selected year: ${year}`);
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
            
            console.log(` Selected interests: ${selectedInterests.length}`);
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
    
    console.log(` Moved to step ${step}`);
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
        
        console.log(' Submitting student profile:', studentData);
        
        // Show loading state
        const submitBtn = document.querySelector('.btn-finish');
        submitBtn.disabled = true;
        submitBtn.textContent = ' Creating your profile...';
        
        try {
            // Save to database
            const result = await supabase.insert('students', studentData);
            
            if (result && result.length > 0) {
                console.log('✅ Profile created successfully!');
                
                // Save student ID and data to localStorage
                localStorage.setItem('studentId', result[0].id);
                localStorage.setItem('student', JSON.stringify(result[0]));
                
                // Show success message briefly
                submitBtn.textContent = '✅ Profile created!';
                
                // Redirect to feed page
                setTimeout(() => {
                    window.location.href = 'student-feed.html';
                }, 500);
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
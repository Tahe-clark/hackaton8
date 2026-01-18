// post-opportunity.js - Handles posting opportunities and triggers agents

// Track selected filters
let selectedTargetPrograms = ['All Programs'];
let selectedTargetYears = [1, 2, 3, 4, 5];
let selectedTargetGender = ['All'];
let selectedTargetEthnicity = ['All'];
let selectedTargetInterests = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Post opportunity page loaded');
    populateAllFilters();
    setupFormHandlers();
});

// Populate all filter sections
function populateAllFilters() {
    populateTargetPrograms();
    populateTargetYears();
    populateTargetGender();
    populateTargetEthnicity();
    populateTargetInterests();
}

function populateTargetPrograms() {
    const container = document.getElementById('target-programs-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    PROGRAMS.forEach(program => {
        const tag = createFilterTag(program, 'program');
        
        // Mark 'All Programs' as active by default
        if (program === 'All Programs') {
            tag.classList.add('active');
        }
        
        container.appendChild(tag);
    });
}

function populateTargetYears() {
    const container = document.getElementById('target-years-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const yearLabels = {
        1: '1st Year',
        2: '2nd Year',
        3: '3rd Year',
        4: '4th Year',
        5: '5th Year +'
    };
    
    YEARS.forEach(year => {
        const tag = document.createElement('div');
        tag.className = 'year-tag active'; // All years selected by default
        tag.textContent = yearLabels[year];
        tag.dataset.year = year;
        
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
            
            if (tag.classList.contains('active')) {
                if (!selectedTargetYears.includes(year)) {
                    selectedTargetYears.push(year);
                }
            } else {
                selectedTargetYears = selectedTargetYears.filter(y => y !== year);
            }
            
            console.log('📝 Selected years:', selectedTargetYears);
        });
        
        container.appendChild(tag);
    });
}

function populateTargetGender() {
    const container = document.getElementById('target-gender-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    GENDER_IDENTITY.forEach(gender => {
        const tag = createFilterTag(gender, 'gender');
        if (gender === 'All') {
            tag.classList.add('active');
        }
        container.appendChild(tag);
    });
}

function populateTargetEthnicity() {
    const container = document.getElementById('target-ethnicity-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    ETHNICITY.forEach(eth => {
        const tag = createFilterTag(eth, 'ethnicity');
        if (eth === 'All') {
            tag.classList.add('active');
        }
        container.appendChild(tag);
    });
}

function populateTargetInterests() {
    const container = document.getElementById('target-interests-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    INTERESTS.forEach(interest => {
        const tag = document.createElement('div');
        tag.className = 'interest-tag'; // Use same class as student signup
        tag.textContent = interest;
        tag.dataset.interest = interest;
        
        tag.addEventListener('click', () => {
            tag.classList.toggle('selected'); // Use 'selected' class from CSS
            
            if (tag.classList.contains('selected')) {
                if (!selectedTargetInterests.includes(interest)) {
                    selectedTargetInterests.push(interest);
                }
            } else {
                selectedTargetInterests = selectedTargetInterests.filter(i => i !== interest);
            }
            
            console.log('📝 Selected interests:', selectedTargetInterests.length);
        });
        
        container.appendChild(tag);
    });
}

// Create a filter tag
function createFilterTag(text, type, value = null) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.textContent = text;
    tag.dataset.type = type;
    tag.dataset.value = value || text;
    
    tag.addEventListener('click', () => {
        tag.classList.toggle('active');
        updateSelectedFilters(type, value || text, tag.classList.contains('active'));
    });
    
    return tag;
}

// Update selected filters when tag is clicked
function updateSelectedFilters(type, value, isActive) {
    switch(type) {
        case 'program':
            if (isActive) {
                if (!selectedTargetPrograms.includes(value)) {
                    selectedTargetPrograms.push(value);
                }
            } else {
                selectedTargetPrograms = selectedTargetPrograms.filter(p => p !== value);
            }
            break;
            
        case 'year':
            if (isActive) {
                if (!selectedTargetYears.includes(value)) {
                    selectedTargetYears.push(value);
                }
            } else {
                selectedTargetYears = selectedTargetYears.filter(y => y !== value);
            }
            break;
            
        case 'gender':
            if (isActive) {
                if (!selectedTargetGender.includes(value)) {
                    selectedTargetGender.push(value);
                }
            } else {
                selectedTargetGender = selectedTargetGender.filter(g => g !== value);
            }
            break;
            
        case 'ethnicity':
            if (isActive) {
                if (!selectedTargetEthnicity.includes(value)) {
                    selectedTargetEthnicity.push(value);
                }
            } else {
                selectedTargetEthnicity = selectedTargetEthnicity.filter(e => e !== value);
            }
            break;
            
        case 'interest':
            if (isActive) {
                if (!selectedTargetInterests.includes(value)) {
                    selectedTargetInterests.push(value);
                }
            } else {
                selectedTargetInterests = selectedTargetInterests.filter(i => i !== value);
            }
            break;
    }
    
    console.log('📝 Filters updated:', {
        programs: selectedTargetPrograms.length,
        years: selectedTargetYears.length,
        interests: selectedTargetInterests.length
    });
}

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('post-opportunity-form');
    if (!form) return;
    
    // Show/hide sections based on type
    const typeSelect = document.getElementById('opportunity-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', () => {
            toggleDetailsSections(typeSelect.value);
        });
    }
    
    // Form submit
    form.addEventListener('submit', handleSubmit);
}

// Toggle event details vs opportunity details
function toggleDetailsSections(type) {
    const eventDetails = document.getElementById('event-details-section');
    const oppDetails = document.getElementById('opportunity-details-section');
    
    if (!eventDetails || !oppDetails) return;
    
    if (type === 'Event') {
        eventDetails.style.display = 'block';
        oppDetails.style.display = 'none';
    } else {
        eventDetails.style.display = 'none';
        oppDetails.style.display = 'block';
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    console.log('📤 Submitting opportunity...');
    
    const form = document.getElementById('post-opportunity-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Publishing...';
    
    try {
        // Gather form data
        const opportunityData = {
            title: document.getElementById('opp-title').value,
            description: document.getElementById('opp-description').value,
            category: document.getElementById('opp-category').value,
            type: document.getElementById('opportunity-type').value,
            posted_by: document.getElementById('posted-by').value,
            
            // Target audience
            target_programs: selectedTargetPrograms,
            target_years: selectedTargetYears,
            target_gender: selectedTargetGender,
            target_ethnicity: selectedTargetEthnicity,
            target_interests: selectedTargetInterests,
            
            // Event details (if applicable)
            event_date: document.getElementById('event-date')?.value || null,
            event_time: document.getElementById('event-time')?.value || null,
            location: document.getElementById('location')?.value || null,
            registration_link: document.getElementById('registration-link')?.value || null,
            
            // Opportunity details (if applicable)
            deadline: document.getElementById('deadline')?.value || null,
            application_link: document.getElementById('application-link')?.value || null,
            amount: document.getElementById('amount')?.value || null,
            
            created_at: new Date().toISOString()
        };
        
        console.log('📋 Opportunity data:', opportunityData);
        
        // Save to database
        const result = await supabase.insert('opportunities', opportunityData);
        
        if (result && result.length > 0) {
            console.log('✅ Opportunity saved to database');
            
            // Trigger intake agent (Solace challenge)
            await triggerIntakeAgent(result[0]);
            
            // Show success
            submitBtn.textContent = '✅ Published!';
            
            // Show success message
            showSuccessMessage();
            
            // Reset form after 2 seconds
            setTimeout(() => {
                form.reset();
                resetFilters();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Opportunity';
            }, 2000);
            
        } else {
            throw new Error('Failed to save opportunity');
        }
        
    } catch (error) {
        console.error('❌ Error posting opportunity:', error);
        alert('Error publishing opportunity. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Opportunity';
    }
}

// Trigger intake agent via Solace
async function triggerIntakeAgent(opportunity) {
    try {
        console.log('🤖 Triggering Intake Agent via Solace...');
        
        // In production, this would call your backend API which triggers Solace
        // For hackathon demo, we simulate it
        
        const response = await fetch('/api/trigger-intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(opportunity)
        });
        
        if (response.ok) {
            console.log('✅ Intake Agent triggered successfully');
            console.log('🔄 Matching Agent will now process this opportunity');
        } else {
            console.log('⚠️  Backend API not available (OK for demo)');
        }
        
    } catch (error) {
        // In demo mode, this is expected if backend isn't running
        console.log(' Note: Run Python agents to see full Solace workflow');
    }
}

// Show success message
function showSuccessMessage() {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

// Reset filters to default
function resetFilters() {
    selectedTargetPrograms = ['All Programs'];
    selectedTargetYears = [1, 2, 3, 4, 5];
    selectedTargetGender = ['All'];
    selectedTargetEthnicity = ['All'];
    selectedTargetInterests = [];
    
    // Reset UI
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
        
        // Re-activate defaults
        if (tag.dataset.value === 'All Programs' || 
            tag.dataset.value === 'All' ||
            tag.dataset.type === 'year') {
            tag.classList.add('active');
        }
    });
}
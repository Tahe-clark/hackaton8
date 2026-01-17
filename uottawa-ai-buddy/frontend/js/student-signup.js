// Variable pour stocker l'année 
let selectedYear = "";

// --- GESTION DES ÉTAPES ---

// Permet de passer de Step 1 à Step 2, etc.
function nextStep(stepNumber) {
    // Cache toutes les étapes
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    // Affiche l'étape actuelle
    document.getElementById('step-' + stepNumber).classList.add('active');
    
    // Met à jour la barre de progression (3 étapes au total)
    const progress = (stepNumber / 3) * 100;
    document.getElementById('progress').style.width = progress + '%';
}

// --- REMPLISSAGE DYNAMIQUE ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Remplir les ethnies (Step 1)
    const ethnicitySelect = document.getElementById('student-ethnicity');
    ETHNICAL_GROUPS.forEach(race => {
        const opt = document.createElement('option');
        opt.value = race;
        opt.textContent = race;
        ethnicitySelect.appendChild(opt);
    });

    // 2. Remplir les programmes 
    const programSelect = document.getElementById('student-program');
    PROGRAMS.forEach(prog => {
        const opt = document.createElement('option');
        opt.value = prog;
        opt.textContent = prog;
        programSelect.appendChild(opt);
    });

    // 3. Générer les boutons d'année 
    const yearGrid = document.getElementById('year-selector');
    YEARS.forEach(year => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.classList.add('year-btn'); 
        btn.textContent = year;
        btn.onclick = () => {
            document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedYear = year; 
        };
        yearGrid.appendChild(btn);
    });

    // 4. Générer les tags d'intérêts 
    const interestsGrid = document.getElementById('interests-grid');
    INTERESTS.forEach(interest => {
        const span = document.createElement('span');
        span.classList.add('interest-tag');
        span.textContent = interest;
        span.onclick = () => span.classList.toggle('selected'); // multiclic
        interestsGrid.appendChild(span);
    });
});

// --- SAUVEGARDE FINALE ---
document.getElementById('onboarding-form').onsubmit = async (e) => {
    e.preventDefault(); 

    const profile = {
        name: document.getElementById('student-name').value,
        ethnicity: document.getElementById('student-ethnicity').value,
        program: document.getElementById('student-program').value,
        year: selectedYear,
        interests: Array.from(document.querySelectorAll('.interest-tag.selected')).map(el => el.textContent)
    };

    if (profile.interests.length < 3) {
        alert("Please select at least 3 interests!");
        return;
    }

    try {
        // 1. Sauvegarde locale (pour l'affichage immédiat du feed)
        localStorage.setItem('userProfile', JSON.stringify(profile));

        // 2. Envoi vers la base de données
        // On vérifie si 'supabase' est bien défini pour éviter une erreur
        if (typeof supabase !== 'undefined') {
            await supabase.from('students').insert([profile]);
            console.log("Data saved to Supabase!");
        } else {
            console.warn("Supabase is not defined. Data only saved locally.");
        }

        // 3. Redirection
        window.location.href = 'student-feed.html';

    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Something went wrong, but we'll try to continue anyway.");
        window.location.href = 'student-feed.html';
    }
};
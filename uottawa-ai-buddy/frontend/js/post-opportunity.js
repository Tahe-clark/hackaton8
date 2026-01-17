// --- REMPLISSAGE DYNAMIQUE ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Remplir les programmes (Checkboxes)
    const programGrid = document.getElementById('target-programs');
    PROGRAMS.forEach(prog => {
        const label = document.createElement('label');
        label.classList.add('checkbox-item');
        label.innerHTML = `<input type="checkbox" name="programs" value="${prog}"> ${prog}`;
        programGrid.appendChild(label);
    });

    // 2. Remplir les ethnies (Checkboxes)
    const ethnicityGrid = document.getElementById('target-ethnicity');
    ETHNICAL_GROUPS.forEach(race => {
        const label = document.createElement('label');
        label.classList.add('checkbox-item');
        label.innerHTML = `<input type="checkbox" name="ethnicity" value="${race}"> ${race}`;
        ethnicityGrid.appendChild(label);
    });

    // 3. Remplir les intérêts (Tags cliquables)
    const interestsGrid = document.getElementById('target-interests');
    INTERESTS.forEach(interest => {
        const span = document.createElement('span');
        span.classList.add('interest-tag');
        span.textContent = interest;
        span.onclick = () => span.classList.toggle('selected');
        interestsGrid.appendChild(span);
    });
});

// --- SAUVEGARDE DANS LA DATABASE ---
document.getElementById('opportunity-form').onsubmit = async (e) => {
    e.preventDefault();

    // On récupère toutes les valeurs sélectionnées
    const selectedPrograms = Array.from(document.querySelectorAll('input[name="programs"]:checked')).map(cb => cb.value);
    const selectedEthnicity = Array.from(document.querySelectorAll('input[name="ethnicity"]:checked')).map(cb => cb.value);
    const selectedInterests = Array.from(document.querySelectorAll('.interest-tag.selected')).map(el => el.textContent);

    const opportunity = {
        title: document.getElementById('opp-title').value,
        category: document.getElementById('opp-category').value,
        description: document.getElementById('opp-description').value,
        target_programs: selectedPrograms,
        target_ethnicity: selectedEthnicity,
        target_interests: selectedInterests,
        created_at: new Date().toISOString()
    };

    try {
        // Envoi vers Supabase 
        if (typeof supabase !== 'undefined') {
            const { error } = await supabase.from('opportunities').insert([opportunity]);
            if (error) throw error;
            alert("Opportunity posted successfully!");
        } else {
            console.warn("Supabase not found. Checking local console...");
            console.log("Opportunity Data:", opportunity);
        }

        // Retour à l'accueil après succès
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Error posting opportunity:", error);
        alert("Failed to post. Please check the console.");
    }
};
// gemini-matching.js - Gemini AI matching logic

const GEMINI_API_KEY = 'AIzaSyCwTDPDiWdUtsAQWumh9w4dYRwy1h039PI';

async function matchOpportunitiesToStudent(student, allOpportunities) {
    console.log(' Starting Gemini AI matching...');
    console.log('Student profile:', student);
    console.log('Total opportunities:', allOpportunities.length);
    
    // Create prompt for Gemini
    const prompt = createMatchingPrompt(student, allOpportunities);
    
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        if (!response.ok) {
            console.warn('⚠️ Gemini API error, using fallback matching');
            return simpleMatch(student, allOpportunities);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        console.log(' Gemini response received');
        
        // Parse JSON response
        const matches = parseGeminiResponse(text, allOpportunities);
        
        console.log(` Gemini matched ${matches.length} opportunities`);
        return matches;
        
    } catch (error) {
        console.error('❌ Gemini error:', error);
        console.log(' Using fallback simple matching');
        return simpleMatch(student, allOpportunities);
    }
}

function createMatchingPrompt(student, opportunities) {
    // Limit to 20 opportunities for faster response
    const sample = opportunities.slice(0, 20);
    
    return `You are a university opportunity matching system.

Student Profile:
- Name: ${student.name}
- Program: ${student.program}
- Year: ${student.year}
- Ethnicity: ${student.ethnicity ? student.ethnicity.join(', ') : 'Not specified'}
- Interests: ${student.interests.join(', ')}

Available Opportunities (showing ${sample.length}):
${JSON.stringify(sample.map(o => ({
    id: o.id,
    title: o.title,
    category: o.category,
    type: o.type,
    target_programs: o.target_programs,
    target_years: o.target_years,
    target_interests: o.target_interests
})), null, 2)}

Match the student to relevant opportunities. For each match with score > 70, return:
{
  "opportunity_id": "...",
  "match_score": 0-100,
  "reasoning": "Brief reason"
}

Return ONLY a JSON array of matches, no other text.`;
}

function parseGeminiResponse(text, allOpportunities) {
    try {
        // Clean response
        let clean = text.trim();
        if (clean.startsWith('```json')) {
            clean = clean.substring(7);
        }
        if (clean.endsWith('```')) {
            clean = clean.substring(0, clean.length - 3);
        }
        clean = clean.trim();
        
        // Parse JSON
        const matches = JSON.parse(clean);
        
        // Add full opportunity data to matches
        return matches.map(match => {
            const opp = allOpportunities.find(o => o.id === match.opportunity_id);
            return {
                ...opp,
                match_score: match.match_score,
                match_reasoning: match.reasoning
            };
        }).filter(m => m.id); // Remove any that didn't find opportunity
        
    } catch (error) {
        console.error(' Error parsing Gemini response:', error);
        return [];
    }
}

function simpleMatch(student, opportunities) {
    console.log(' Simple matching fallback');
    
    const matches = opportunities.filter(opp => {
        // Check program match
        const programMatch = opp.target_programs.includes('All Programs') ||
                           opp.target_programs.includes(student.program);
        
        // Check year match
        const yearMatch = opp.target_years.includes(student.year);
        
        // Check interest overlap
        const interestMatch = student.interests.some(interest => 
            opp.target_interests.includes(interest)
        );
        
        return programMatch && yearMatch;
    });
    
    // Add match scores
    return matches.map(opp => ({
        ...opp,
        match_score: 75,
        match_reasoning: `Matches your program (${student.program}) and year (${student.year})`
    }));
}

console.log(' Gemini matching engine loaded');
// constants.js - Shared constants for students and event posters
// These are used by BOTH student signup AND post opportunity forms

// Liste officielle des programmes de l'uOttawa 
const PROGRAMS = [
    'Software Engineering',
    'Computer Science',
    'Commercial Sciences / Business',
    'Nursing',
    'Law',
    'Arts and Sciences',
    'Civil Engineering',
    'Psychology',
    'Biology',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Other',
    'All Programs' // Only for event posters
];

// Années d'études 
const YEARS = [1, 2, 3, 4, 5]; // Numbers for easy database queries

// Year labels for display
const YEAR_LABELS = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
    5: '5th Year +'
};

// Groupes ethniques 
const ETHNICITY = [
    'Black / Afro-Canadian',
    'White / Euro-Canadian',
    'Mixed / Métis',
    'Asian',
    'Latino-American',
    'Indigenous',
    'Arab',
    'Prefer not to say',
    'All' // Only for event posters
];

// Gender identities
const GENDER_IDENTITY = [
    'Woman',
    'Man',
    'Non-binary',
    'Two-Spirit',
    'Prefer not to say',
    'All' // Only for event posters
];

// Liste officielle des intérêts pour le matching IA 
const INTERESTS = [
    // Academic & Career
    'Research',
    'Academic Writing',
    'Study Groups',
    'Tutoring',
    'Networking',
    'Career Development',
    'Entrepreneurship',
    'Leadership',
    
    // Technology
    'Artificial Intelligence',
    'Web Development',
    'Coding',
    'Hackathons',
    'Robotics',
    'Video Games',
    'Gaming',
    
    // Arts & Culture
    'Music & Concerts',
    'Dance',
    'Theatre',
    'Visual Arts',
    'Film',
    'Photography',
    'Graphic Design',
    'Reading',
    
    // Sports & Wellness
    'Competitive Sports',
    'Fitness',
    'Yoga',
    'Mental Health',
    'Meditation',
    
    // Social Impact
    'Volunteering',
    'Community Service',
    'Sustainability',
    'Social Justice',
    'Politics',
    
    // Hobbies
    'Cooking',
    'Traveling',
    'Writing',
    'Languages',
    'Board Games'
];

console.log(' Constants loaded:', {
    programs: PROGRAMS.length,
    years: YEARS.length,
    ethnicities: ETHNICITY.length,
    interests: INTERESTS.length
});
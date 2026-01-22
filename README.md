# UoBuddy - University of Ottawa AI Buddy Platform

A smart AI-powered platform that connects University of Ottawa students with career opportunities, clubs, and resources through intelligent matching using Google Gemini AI.

## 🎯 Live Demo

**Visit the deployed app**: https://hackaton8-five.vercel.app/uottawa-ai-buddy/frontend/index.html

## 🎯 Project Overview

UoBuddy is a hackathon project designed to help University of Ottawa students discover opportunities that match their skills, interests, and goals. The platform uses advanced AI matching to connect:
- **Students** seeking careers, internships, clubs, and resources
- **Faculty & Clubs** looking to reach the right student audience

## 🏗️ Architecture

The project follows a multi-agent architecture with event-driven communication:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                   │
│  • Student Signup & Profile                                 │
│  • Opportunity Feed                                          │
│  • Post Opportunities                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Backend (Python/Node.js)                   │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────────┐   │
│  │  Intake Agent    │──┐   │  Matching Agent (Gemini) │   │
│  │ (receives posts) │  │   │   (AI Matching Engine)   │   │
│  └──────────────────┘  ├──▶│                          │   │
│                        │   └──────────────────────────┘   │
│  ┌──────────────────┐  │                                   │
│  │Notification Agent│  │   ┌──────────────────────────┐   │
│  │  (sends alerts)  │◀─┴──▶│  Scraper Agent           │   │
│  └──────────────────┘      │  (data collection)       │   │
│                            └──────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│            Solace Event Bus (Message Queue)                 │
│         Real-time event streaming & communication          │
└─────────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Supabase Database                         │
│            Students • Opportunities • Matches               │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
uottawa-ai-buddy/
├── backend/                          # Python backend agents
│   ├── intake_agent.py              # Receives new opportunities
│   ├── matching_agent.py            # AI-powered matching engine
│   ├── notification_agent.py        # Sends notifications to students
│   ├── scraper_agent.py             # Data collection agent
│   ├── solace_config.py             # Solace configuration
│   ├── server.js                    # Node.js server
│   ├── package.json                 # Node.js dependencies
│   └── requirements.txt             # Python dependencies
│
├── frontend/                         # Web interface
│   ├── index.html                   # Landing page
│   ├── student-signup.html          # Student profile setup
│   ├── student-feed.html            # Opportunity feed
│   ├── post-opportunity.html        # Post opportunities (faculty/clubs)
│   ├── css/
│   │   └── style.css                # Styling
│   ├── js/
│   │   ├── constants.js             # App constants
│   │   ├── gemini-matching.js       # Gemini AI integration
│   │   ├── student-feed.js          # Feed functionality
│   │   ├── student-signup.js        # Signup logic
│   │   ├── post-opportunity.js      # Opportunity posting
│   │   └── supabase-client.js       # Database client
│   └── assets/                      # Images and media
│
└── README.md                         # This file
```

## 🚀 Features

### For Students
- **Smart Profile**: Create a profile with skills, interests, and career goals
- **AI-Powered Feed**: Receive personalized opportunity recommendations
- **Real-time Matches**: Get instant notifications for matching opportunities
- **Easy Discovery**: Browse opportunities across categories (careers, clubs, resources)

### For Faculty & Clubs
- **Post Opportunities**: Share career openings, club activities, or resources
- **Targeted Reach**: AI automatically identifies and notifies relevant students
- **Analytics**: See which opportunities are getting interest

### AI Matching Engine
- Uses **Google Gemini AI** to analyze student profiles and opportunities
- Considers skills, interests, academic background, and preferences
- Delivers intelligent, contextual recommendations

## 🔧 Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Supabase client for real-time database access
- Responsive design for mobile and desktop
- **Deployed on**: Vercel

### Backend
- **Python**: Intake, Matching, Notification, and Scraper agents
- **Node.js**: API server
- **Google Gemini AI**: Intelligent matching
- **Solace**: Event-driven messaging system
- **Supabase**: Database and authentication

### Infrastructure
- Event-driven architecture with Solace message broker
- Multi-agent system for scalability
- Real-time database synchronization

## 📋 Prerequisites (For Local Development)

- Python 3.8+
- Node.js 16+ and npm
- Supabase account
- Google Generative AI API key
- Solace connection credentials

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```
# Google Generative AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Solace Configuration
SOLACE_HOST=your_solace_host
SOLACE_USERNAME=your_solace_username
SOLACE_PASSWORD=your_solace_password
```

## ⚙️ Installation & Setup (For Development/Contributors)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables (see `.env` example above)

4. Run the agents:
```bash
python intake_agent.py
python matching_agent.py
python notification_agent.py
```

### Frontend Setup (Local Testing)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Serve using a local server (e.g., Python HTTP server):
```bash
python -m http.server 8000
```

3. Access in browser: `http://localhost:8000`

**Note**: The frontend is deployed on Vercel and automatically updated on each push to main. For production use, visit: https://hackaton8-five.vercel.app/uottawa-ai-buddy/frontend/index.html

## 🔄 How It Works

1. **Student Signup**: Student creates profile with skills and interests
2. **Faculty Post**: Faculty/club posts new opportunity
3. **Intake**: Opportunity enters system via Intake Agent
4. **Matching**: Matching Agent uses Gemini AI to analyze student-opportunity fit
5. **Notification**: Notification Agent sends alerts to matched students
6. **Discovery**: Student sees matched opportunities in their feed

## 👥 Multi-Agent System

- **Intake Agent**: Entry point for opportunities; publishes to Solace event bus
- **Matching Agent**: Consumes events; runs AI matching; publishes match results
- **Notification Agent**: Consumes matches; sends student notifications
- **Scraper Agent**: Monitors data quality; collects analytics

## 🎓 University of Ottawa Integration

- Branding and styling aligned with uOttawa guidelines
- Support for student and faculty authentication
- Integration with campus resources and systems

## 📝 License

This project was created for the University of Ottawa Hackathon 8.

## 👨‍💼 Team

Developed by: **UoBuddy Team**
Marrionne GANNAVI
Sheila SIEYOJI
Kris-Evan NGUESSANT
Clark TAHE

---

**Status**: Active Development | **Deployed**: Yes (Vercel) | **Last Updated**: January 2026

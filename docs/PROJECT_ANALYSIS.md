# Attendance System - Initial Project Analysis

## Overview

IoT-based automated attendance system using facial recognition. Instructors can create classes, add students with photos, and run live attendance sessions where a webcam automatically detects and marks students present.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router 6 |
| Backend | Flask, Flask-SocketIO, OpenCV, face_recognition |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Auth | Firebase Authentication |
| Real-time | Socket.IO (WebSocket) |

## Project Structure

```
attendance-system/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Attendance/    # Attendance history & modal
│   │   │   ├── Classes/       # Class card grid
│   │   │   ├── Students/      # Student list & modals
│   │   │   ├── modal/         # Add Class/Student modals
│   │   │   ├── Navbar/        # Top navigation
│   │   │   └── usericon/      # User avatar dropdown
│   │   ├── context/           # React context providers
│   │   │   ├── authContext    # Firebase auth state
│   │   │   ├── DBContext      # Firestore operations
│   │   │   ├── AttendanceContext  # Socket.IO (unused)
│   │   │   └── ModalContext   # Modal state management
│   │   ├── layouts/           # Route layouts (public, auth, private)
│   │   ├── pages/             # Route pages
│   │   │   ├── Landing/       # Landing page (hero, about, contact)
│   │   │   ├── Auth/          # Login & Signup
│   │   │   └── private/       # Dashboard, Class, Attendance
│   │   ├── lib/global.js      # Mock/seed data
│   │   ├── firebase.js        # Firebase SDK init
│   │   ├── main.jsx           # React entry point
│   │   └── App.jsx            # Root component & router
│   ├── public/                # Static assets
│   ├── images/                # Project images (about, background, logo, etc.)
│   └── [config files]         # vite, tailwind, postcss, eslint
├── server/                    # Flask backend
│   ├── app.py                 # Flask app factory + SocketIO init
│   ├── main.py                # Core real-time attendance logic
│   ├── views.py               # REST API blueprint (signup)
│   ├── EncodeGenerator.py     # Standalone face encoding generator
│   └── requirements.txt       # Python dependencies
└── docs/                      # Project documentation
```

## Key Features

- **Real-time face recognition** via webcam stream using OpenCV + face_recognition library
- **Live video streaming** over Socket.IO (base64-encoded frames)
- **Automatic attendance marking** when a recognized face is detected
- **Firebase integration** for auth, Firestore (users, classes, students, attendance), and Storage (student images)
- **Attendance export** to Excel via the `xlsx` library
- **Responsive UI** with Tailwind CSS + React Bootstrap

## Data Flow

1. Instructor logs in → creates a class → adds students (with photos uploaded to Firebase Storage)
2. Face encodings are generated from student images and stored
3. Instructor starts an attendance session → webcam activates → frames streamed to client
4. Server detects faces, matches against known encodings → emits attendance events
5. Client displays recognized students in real-time
6. Session is finalized and saved to Firestore

## Known Issues

| Issue | Severity |
|-------|----------|
| `views.py` references undefined `ALLOWED_ORIGINS` | High |
| `AttendanceContext.jsx` is dead code (never imported) | Low |
| `ClassDetail.jsx` is broken (mock data, non-functional) | Medium |
| Server depends on missing local `firebase` Python package | High |
| `EncodeGenerator.py` uses local `images/` folder instead of Firebase Storage | Medium |

## Actions Taken (Cleanup)

- Removed empty `client/src/App.css`
- Removed duplicate/empty `client/gitignore` (lowercase)
- Removed `.DS_Store` junk files (root + server)
- Removed default Vite template assets (`vite.svg`, `react.svg`)
- Created `docs/` directory with this analysis

📝 Form Builder
A full-stack Form Builder Application built with MERN stack (MongoDB, Express, React, Node.js) where users can create, update and render forms with different question types including Fill-in-the-Blanks, Categorization, and Comprehension questions. Supports image uploads for questions via Firebase Storage.

🔗 Live Link

👉 https://form-builder-1-zxqi.onrender.com

🚀 Features

📌 Form Creation
Add different types of questions:

1.Fill-in-the-Blank (with underlined words)

2.Categorization questions

3.Comprehension passage with MCQs

Attach images to questions (or MCQs inside comprehension).

📷 Image Uploads
->Upload images to Firebase Storage with real-time progress bar.

->Store image URLs in MongoDB.

🎨 Frontend (React + Vite)
->Drag-and-drop used for answering category questions and fill in the blank questions .

->Clean, responsive UI with Tailwind CSS.

->Client-side routing with React Router.

⚙️ Backend (Node.js + Express + MongoDB)
->Mongoose discriminators for different question types.

->REST API to create, fetch, and manage forms.

->Mangoose for form and answers schemas.

📂 Project Structure

Form-Builder/
├── api/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── firebase.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
└── package.json





🛠️ Tech Stack

Frontend: React, Vite, Tailwind CSS, React Router, React Icons, Firebase Storage
Backend: Node.js, Express, MongoDB, Mongoose

⚡ Getting Started
1️⃣ Clone the repository
git clone https://github.com/your-username/form-builder.git
cd form-builder

2️⃣ Install dependencies

->Backend
npm install

->Frontend
cd client
npm install

3️⃣ Setup Backend environment variables(in /form-builder/.env)
 MONGO_URI=your_mongodb_connection_string
 NODE_ENV="development"

3️⃣ Setup Frontend environment variables(in /client/.env)
VITE_FIREBASE_API_KEY=YOur_vite_firebase_api_key_string

3️⃣ Setup Frontend client/src/firebase.js

import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
export const app = initializeApp(firebaseConfig);

4️⃣ Run locally

->Backend(/form-builder)
npm run dev

->Frontend
cd client
npm run dev


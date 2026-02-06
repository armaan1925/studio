# **App Name**: MediMind AI

## Core Features:

- Pill Recognition and Information: Utilize the Cloud Vision API for image recognition of pills. Return detailed information including name, formulation, uses, and contraindications, with a TFLite fallback for offline or unavailable cloud scenarios.
- Multilingual Voice Assistant: Implement a voice assistant supporting multiple languages for querying drug information, side effects, and dosages. Employ OpenAI/GPT for conversational understanding and translation, using local language models when available to ensure user data privacy.
- Gamified Learning Modules: Create interactive learning modules with quizzes and challenges related to pharmacology and pharmaceutical practices. Award badges, points, and certificates for completing modules.
- Research Showcase Platform: Enable pharmacy students and professionals to showcase their research by uploading PDFs, posters, and code demos. AI tool for relevance scoring suggests mentors and industry problems based on keywords, skill tags.
- WhatsApp Integration for Pill Information: Integrate WhatsApp via Twilio API to allow users to send images of pills and receive information directly through WhatsApp messages.
- Admin/Institution Portal (Web): A web-based admin dashboard for managing content, approving research submissions, managing institutions and users, viewing analytics, and managing the mentor pool and pricing.

## Style Guidelines:

- Primary color: Soft indigo (#667EEA) to convey trust and professionalism, ideal for the pharmaceutical context. It will contrast well with the light background.
- Background color: Light grayish-blue (#F0F4FF), providing a calm and clean base that is easy on the eyes. 
- Accent color: Soft purple (#9F7AEA) for interactive elements and highlights, differing enough in saturation and brightness from the primary to draw attention.
- Body and headline font: 'Inter' (sans-serif) provides a modern, readable, and neutral aesthetic, suitable for both headings and body text, promoting ease of reading and a clean interface.
- Use consistent, minimalist icons for navigation and actions.
- Follow a tab-based bottom navigation layout for core features.
- Incorporate subtle animations using Lottie for confirmations, badges, and loading states.
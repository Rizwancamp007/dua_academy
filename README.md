# DUAA ACADEMY Mirpur Mathelo Site Repository

Welcome to the official web repository for the **[DUAA ACADEMY Mirpur Mathelo](https://duaacademymirpur.com.pk)** Learning Management System (LMS) and Computer-Based Testing (CBT) platform. This system serves as the primary digital portal for pre-medical and pre-engineering students executing entry test preparation.

---

## Project Overview

The DUAA ACADEMY portal provides an automated environment for managing academic announcements, hosting video masterclasses, and executing rigorous mock exams tailored for competitive Pakistani entry tests.

### Core Modules & Features
* **CBT Testing Engine:** Supports custom exam delivery featuring continuous anti-tamper timers and calibrated negative marking (+4 for correct answers, -1 for incorrect answers) to mimic the real exam hall experience.
* **LMS Student Dashboard:** Allows authenticated portal access via the **[Student & Faculty Portal Login](https://duaacademymirpur.com.pklogin)** where students can stream public and premium video lectures, filterable by targeted programs, subjects, or specific conceptual chapters.
* **Performance Diagnostics:** Generates automated student rankings, detailed scorecards, and analytical insight highlighting specific topic-level weaknesses.
* **Aggregate Calculator:** A built-in system helping high school students dynamically compute their aggregate entry score based on custom medical or engineering criteria.
* **Notice Board Engine:** Categorized database for publishing instant academic announcements, schedules, seminars, and orientation events.

---

## Tech Stack

This platform is structured as an interactive web-based architecture designed to support fast client interaction and secure mock-exam persistence.

* **Frontend:** Responsive layout framework optimized for mobile devices and desktop computers.
* **Backend:** Secure authentication engine verifying student credentials, tracking fee clearance receipts, and maintaining strict test persistence.
* **Database:** Relational storage modeling classes, custom mock exams, live aggregates, and student profiles.

---

## Getting Started

Follow these steps to run a local instance of the platform for development or configuration testing.

### Prerequisites
* Ensure a stable runtime environment matching your chosen backend engine (e.g., Node.js or Python).
* Configure a database instance locally or via cloud deployment.

### Installation

1. Clone this repository locally:
   ```bash
   git clone https://github.com
   cd duaacademy-lms
   ```

2. Install system dependencies:
   ```bash
   npm install   # If Node.js framework
   # or
   pip install -r requirements.txt   # If Python-based system
   ```

3. Set up environment configuration:
   Create a `.env` file in the root directory and define the essential variables:
   ```env
   PORT=3000
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_secure_authentication_key
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Initialize the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` to interact with the platform layout.

---

## Directory Structure

```text
├── config/             # Environment, authorization, and database connections
├── public/             # Static visual assets, brand icons, and campus graphics
├── src/
│   ├── controllers/    # Request processing logs for tests, lectures, and users
│   ├── models/         # Database schemas for MDCAT/ECAT streams and exams
│   ├── routes/         # Endpoints mapping user and administrative paths
│   └── views/          # Templates for dashboard, login, and public portal pages
├── .env.example        # Reference file for system variables
├── README.md           # Documentation reference file
└── package.json        # Manifest file declaring libraries and dependencies
```

---

## Deployment & Production

When rolling out updates to the live domain:
* Enforce secure HTTPS tokens across the **[Student & Faculty Portal Login](https://duaacademymirpur.com.pklogin)**.
* Establish optimized database indexing on the assessment tables to maintain accurate, concurrent execution during high-volume mock examinations.

---

## License

All software rights, assets, and foundational templates belong exclusively to DUAA ACADEMY Mirpur Mathelo. Unauthorized distribution, licensing, or duplication of this specialized testing infrastructure is strictly prohibited.

# 🎫 IT Help Desk Ticketing System

A web-based IT Help Desk Ticketing System designed to streamline IT support operations by allowing users to report technical issues and enabling support staff to manage, assign, and resolve tickets efficiently.

## 📌 About the Project

The IT Help Desk Ticketing System provides a centralized platform for managing IT support requests. Instead of handling technical problems manually, users can submit tickets, track their progress, and communicate with support staff.

The system helps improve response times, organize support requests, and maintain a record of reported issues.

## ✨ Features

* 🔐 **User Authentication** — Secure user login and access control.
* 🎫 **Ticket Management** — Create, view, and manage IT support tickets.
* 👨‍💻 **Ticket Assignment** — Assign tickets to IT support staff.
* 🚦 **Priority Management** — Set ticket priorities according to urgency.
* 📊 **Status Tracking** — Monitor ticket progress from submission to resolution.
* 💬 **Ticket Comments** — Support communication related to reported issues.
* 🗂️ **Ticket Categorization** — Organize tickets by issue category.
* 🗄️ **Database Integration** — Store ticket information in MySQL.

*Note: The features listed above should reflect the functionality implemented in your current version.*

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Tailwind CSS

### Backend

* Node.js
* Express.js
* REST API
* JSON Web Token (JWT)

### Database

* MySQL
* XAMPP for local database development

## 📂 Project Structure

```text
IT-Helpdesk-system/
├── backend/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── css/
│   ├── js/
│   └── index.html
├── .gitignore
└── README.md
```

*The directory structure above is illustrative. Adjust it to match your actual project files.*

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

* [Node.js](https://nodejs.org/)
* [Git](https://git-scm.com/)
* [XAMPP](https://www.apachefriends.org/), or another MySQL server
* A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/KOTOLA1/it-help-desk-system.git
```

Navigate into the project directory:

```bash
cd it-help-desk-system
```

### 2. Configure the Database

1. Start Apache if needed and MySQL through the XAMPP Control Panel.
2. Open phpMyAdmin.
3. Create the database required by the application.
4. Import the project's SQL file if one is provided.

Make sure the database name and schema match your backend configuration.

### 3. Configure Environment Variables

Create a `.env` file in the appropriate backend directory and configure the variables required by your application.

For example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_secure_secret
```

Replace the example values with your local configuration. Use the actual variable names expected by your backend.

**Security:** Never commit your `.env` file, database passwords, or JWT secrets to GitHub.

### 4. Install Dependencies

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

If your frontend has its own `package.json`, install its dependencies separately.

### 5. Start the Backend

Run the command configured in the backend's `package.json`. For example, if a start script exists:

```bash
npm start
```

Alternatively, if the application uses `server.js` directly:

```bash
node server.js
```

Check the terminal for the server's address and startup status.

### 6. Open the Frontend

Open the frontend using the method supported by your project, such as a local development server or the configured frontend start command.

Ensure the frontend API URL points to your running backend.

## 🔒 Security

* Environment variables are excluded from version control.
* Never publish database credentials or authentication secrets.
* Use strong secrets for JWT authentication.
* Validate and sanitize user input.
* Apply appropriate authorization checks to protected operations.

## 🎯 Project Objectives

* Simplify IT support request management.
* Improve ticket assignment and tracking.
* Organize technical issues in a centralized system.
* Maintain a consistent record of support activities.
* Improve communication between users and IT support staff.

## 🚀 Future Improvements

Potential enhancements include:

* Email notifications for ticket updates.
* Dashboard analytics and reporting.
* Advanced ticket search and filtering.
* Service-level agreement (SLA) tracking.
* Improved mobile responsiveness.
* Production deployment with a hosted database.
* Automated testing and expanded security controls.

## 👨‍💻 Author

**Kotola Yacob**

IT Student | Full-Stack Developer | Aspiring Software Developer

GitHub: [@KOTOLA1](https://github.com/KOTOLA1)

## 📄 License

This project is available for educational and portfolio purposes. A formal open-source license can be added if you intend to permit reuse and redistribution under specific terms.

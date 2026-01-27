# Jira Dashboard Client

This project is a React application developed to visualize Jira sprint data. It consumes data from backend services (Spring Boot) to present KPI cards, charts, and detailed tables to the user.

## Technology Stack

The project is built upon the following core libraries and technologies:

* **React:** User interface library.
* **Material UI (MUI):** Design system and component library (Grid, Card, Table, etc.).
* **Recharts:** Data visualization library for Velocity and distribution charts.
* **Axios:** HTTP client for backend API requests.

## Prerequisites

Ensure that the following are installed on your computer before running the project:

* Node.js (v14 or higher recommended)
* npm

## Installation and Setup

Follow the steps below to run the project in your local environment:

1.  **Install Dependencies:**
    Open a terminal in the project directory and install the required packages.

    ```bash
    npm install
    ```

2.  **Start the Application:**
    To start the development server:

    ```bash
    npm start
    ```

    The application will run at `http://localhost:3000` by default.

## Backend Connection

This application makes requests to a backend service running at `http://localhost:8080` by default. The backend service must be up and running for data to display correctly.

Endpoints used:
* `/velocity-greenhopper`: Velocity chart data.
* `/list-issues`: Task list and statistics within the sprint.
* `/backlog`: Backlog list.
* `/get-user`: User information.

## Features

* **KPI Cards:** Info cards arranged in a 2x2 grid showing the active sprint name, total story points, task count, and completed story points.
* **Velocity Chart:** Sprint-based comparison of committed vs. completed work.
* **Issue Distribution:** Distribution of issues based on their status.
* **Sprint Issue List:** Detailed list of issues in the current sprint (Status, Assignee, SP).
* **Backlog List:** List of issues not yet assigned to a sprint.
* **Responsive Design:** Flexible layout adaptable to different screen sizes (Container and Grid structure).
# Overview

This is a comprehensive barbershop management system built with FastAPI (Python backend) and React (frontend). The system provides multi-user role-based access for managing appointments, clients, services, and point-of-sale operations. It features a modern web interface with authentication, dashboard analytics, and LGPD compliance tools for Brazilian data protection regulations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Framework**: FastAPI with SQLAlchemy ORM for database operations
- **Database**: SQLite by default with PostgreSQL support through environment variables
- **Authentication**: JWT-based authentication with role-based access control (Admin, Barbeiro, Recepcionista)
- **Password Security**: bcrypt hashing for secure password storage
- **API Structure**: RESTful endpoints organized by domain (auth, users, clients, services, appointments, pos, dashboard)

## Frontend Architecture
- **Framework**: React with functional components and hooks
- **Routing**: React Router for client-side navigation
- **State Management**: Context API for global state (AuthContext, ThemeContext)
- **Styling**: Bootstrap 5 with custom CSS variables for theming
- **API Communication**: Axios with interceptors for request/response handling

## Role-Based Access Control
- **Admin**: Full system access including user management and service configuration
- **Barbeiro**: Access to their own appointments and client interactions
- **Recepcionista**: Client management, appointment scheduling, and POS operations

## Data Models
- **Users**: Multi-role user system with secure authentication
- **Clients**: Customer management with LGPD compliance features
- **Services**: Configurable services with pricing and duration
- **Appointments**: Booking system with status tracking and notifications
- **Sales**: Point-of-sale system with multiple payment methods

## Security Features
- JWT token-based authentication with automatic refresh
- Password hashing using bcrypt
- Role-based route protection
- CORS configuration for frontend integration

# External Dependencies

## Backend Dependencies
- **FastAPI**: Modern web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **Jose**: JSON Web Token implementation for authentication
- **Passlib**: Password hashing utilities with bcrypt support
- **Uvicorn**: ASGI server for running the FastAPI application

## Frontend Dependencies
- **React**: Frontend framework with hooks and context
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **Bootstrap 5**: CSS framework for responsive design
- **Font Awesome**: Icon library for UI components

## Database Configuration
- **Default**: SQLite for development with file-based storage
- **Production**: PostgreSQL support through DATABASE_URL environment variable
- **Migration Ready**: SQLAlchemy models configured for easy database migrations

## Third-Party Integrations
- **Email Notifications**: Placeholder implementation ready for SendGrid/AWS SES integration
- **SMS Notifications**: Placeholder implementation ready for Twilio/AWS SNS integration
- **Payment Processing**: Multi-method support (Cash, Credit/Debit Cards, PIX)

## LGPD Compliance
- **Data Export**: Client data export functionality for compliance requests
- **Data Anonymization**: Tools for anonymizing client data when required
- **Consent Management**: LGPD consent tracking and management

# Project Name: Carpool - Share the Journey

## Overview

**Carpool** is a ride-sharing platform that allows users to book rides, offer rides, and connect with other users to reduce commute costs and environmental impact. The platform includes features like ride tracking, vehicle management, and user authentication. It is built with modern web technologies and offers a polished user experience across both desktop and mobile devices.

## Current Product Direction

- The frontend is transitioning to an admin-first model.
- Primary application surface is `/admin/*`.
- Existing user-flow pages are in transition to `/legacy/*` and are deprecated for one release cycle.
- New feature work targets admin modules only; legacy area is bugfix-only.

Planning and migration docs:
- `ADMIN_FRONTEND_FINDINGS.md`
- `LEGACY_FEATURES_DEPRECATION.md`
- `ADMIN_EXECUTION_TASKBOARD.md`
- `CLAUDE_CRITICAL_REVIEW_PROMPT.md`

---

## Key Features

- **Ride Booking**: Search and book rides from one location to another.
- **Ride Offering**: Share your rides by offering available seats in your vehicle.
- **Live Tracking**: Track the location of ongoing or upcoming rides on an integrated Google Map.
- **Authentication and Authorization**: User authentication is handled via protected routes to ensure safe and personalized access.
- **Vehicle Management**: Add and manage user vehicles with detailed metadata like seating capacity, vehicle type, and more.
- **Seamless User Experience**: Custom components for both desktop and mobile devices, providing an intuitive navigation experience.

---

## Technology Stack

- **Frontend**:
  - **React 18.3.1**: Core frontend library for building UI.
  - **TailwindCSS**: Utility-first CSS framework for UI styling.
  - **Radix UI**: Accessible UI primitives for dropdowns, menus, and tooltips.
  - **TypeScript 5.5.3**: Provides static typing for better code maintainability.
- **Backend**:
  - Assumes API connectivity with a backend service through REST endpoints.
- **Map Integration**:
  - **Google Maps API**: Used for visualizing ride locations, live tracking, and place autocomplete.
- **State Management**:
  - **React Context API** with hooks to manage app-wide state (e.g., authentication, user info).
- **Routing**:
  - **React Router**: Client-side navigation for pages and protected routes.
- **Icons**:
  - **Lucide Icons**: Vector icons for a modern and visually engaging design.

---

## Project Structure

Here's an overview of the key parts of the project:

1. **Components**:
   - `Layout.tsx` / `MobileLayout.tsx`: Responsively handle layouts for desktop and mobile views with features like navigation menus and user profiles.
   - `GoogleMap.tsx`: Fully interactive Google Maps component for live ride tracking and markers.
   - `PlacesAutocomplete.tsx`: Google Places integration for searching locations.
   - `ProtectedRoute.tsx`: Protects certain routes and ensures access is allowed only for authenticated users.
   
2. **API Layer**:
   - **`api.ts`**:
     - Defines reusable DTOs (Data Transfer Objects) for handling common API requests and responses.
     - Emphasizes type safety for user info, rides, trips, and vehicles.

3. **Environment Variables**:
   - **`.env.example`**:
     - Configurable keys for the Google Maps API and backend API base URL.

---

## Setup Instructions

Follow these steps to set up the project for development:

1. **Clone the Repository**:
```shell
git clone <repository-url>
cd <repository-name>
```

2. **Install Dependencies**:
Ensure that `npm` or `yarn` is installed.
```shell
npm install
```

3. **Environment Configuration**:
- Rename the `.env.example` file to `.env`:
```shell
cp .env.example .env
```
- Update the environmental variables in `.env`:
  - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key.
  - `VITE_API_BASE_URL`: Backend API base URL.

4. **Run the Project**:
```shell
npm run dev
```

5. **Build for Production**:
```shell
npm run build
```

6. **Run Tests (Optional)**:
```shell
npm test
```

---

## Usage

- **Authentication**: Login or register as a user to access ride-sharing features.
- **Offer a Ride**: Provide the starting point, destination, and available seats to share your trip with others.
- **Book a Ride**: Search for destinations and book available seats.
- **Live Tracking**: View your current or upcoming rides on an interactive map.

---

## Map Integration

This project integrates with **Google Maps API** for key features:
- **Places Autocomplete**: Find and select pickup and destination locations.
- **Ride Tracking**: Displays markers and live route updates.

> **Note**: Ensure that `VITE_GOOGLE_MAPS_API_KEY` is correctly set in the `.env` file.

---

## Environment Configuration

Use the provided `.env.example` file as a reference to configure your Google Maps API and backend integration:
```
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_API_KEY

# Backend API Base URL
VITE_API_BASE_URL=https://your-api-domain.com
```

---

## Folder Structure

The project follows this folder structure for maintainability:
```
src/
├── components/
│   ├── Layout.tsx
│   ├── MobileLayout.tsx
│   ├── GoogleMap.tsx
│   ├── PlacesAutocomplete.tsx
│   ├── ProtectedRoute.tsx
├── api/
│   └── api.ts        [DTO and API request/response types]
├── styles/           [Global or component-based styles]
├── pages/            [Application pages driven by React Router]
├── contexts/         [AuthContext for authentication state]
├── App.tsx           [Root application component]
```

---

## Future Enhancements

- **Real-time Notifications**: Use WebSockets for live updates on ride cancellations or status changes.
- **Payment Integration**: Add payment gateways for easy transaction handling.
- **Enhanced Tracking**: Implement real-time ride tracking for passengers.
- **Admin Panel**: Include an admin dashboard for managing users and rides.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## Acknowledgements

- [Google Maps API](https://developers.google.com/maps/documentation) for mapping and autocomplete functionality.
- [React](https://reactjs.org/) for building the core frontend.
- [TailwindCSS](https://tailwindcss.com/) for styling the application.

---

## Contributors

- Vipul Singh (singhv@students.uni-marburg.de)

---

Feel free to reach out for support or further questions!

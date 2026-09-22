import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import JobDescription from "./pages/JobDescription";
import Matching from "./pages/Matching";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewResult from "./pages/InterviewResult";
import Analytics from "./pages/Analytics";
import Roadmap from "./pages/Roadmap";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Protected application routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Resume */}
          <Route
            path="/resume"
            element={<Resume />}
          />

          {/* Job Description */}
          <Route
            path="/job-description"
            element={<JobDescription />}
          />

          {/* Job Matching */}
          <Route
            path="/matching"
            element={<Matching />}
          />

          {/* Interview */}
          <Route
            path="/interview"
            element={<InterviewSetup />}
          />

          <Route
            path="/interview/room"
            element={<InterviewRoom />}
          />

          {/* Results */}
          <Route
            path="/results"
            element={<InterviewResult />}
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* Roadmap */}
          <Route
            path="/roadmap"
            element={<Roadmap />}
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>
      </Route>

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
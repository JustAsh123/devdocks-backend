import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Invites from "./pages/Invites";
import ProjectBoard from "./pages/ProjectBoard";
import Documents from "./pages/Documents";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invites" element={<Invites />} />
        <Route path="/project/:projectId" element={<ProjectBoard />} />
        <Route path="/project/:projectId/docs" element={<Documents />} />
      </Routes>
    </BrowserRouter>
  );
}

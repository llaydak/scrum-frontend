import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ReportPrintPage from "./dashboard/ReportPrintPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/report/print" element={<ReportPrintPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function InterviewerLayout() {
  return (
    <div>
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

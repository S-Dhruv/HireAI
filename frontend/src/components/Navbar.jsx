import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const { logout, authUser } = useAuthStore();

  return (
    <nav className="bg-base-200 p-4 shadow flex items-center justify-between">
      <h1 className="text-xl font-bold text-primary">HireAI - Interviewer</h1>
      <ul className="flex gap-6 items-center">
        <li>
          <Link to="/interviewer/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/interviewer/create" className="hover:underline">
            Create Interview
          </Link>
        </li>
        <li>
          <Link to="/interviewer/questions" className="hover:underline">
            Question Bank
          </Link>
        </li>
        <li>
          <Link to="/interviewer/history" className="hover:underline">
            History
          </Link>
        </li>
        <li>
          <button onClick={logout} className="btn btn-sm btn-error">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

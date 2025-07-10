import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { MessageCircle, Calendar, Settings, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { authUser } = useAuthStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePromptSubmit = async () => {
    if (!input.trim()) return toast.error("Please describe the interview process.");
    setLoading(true);

    try {
      // Simulate API call or process
      await new Promise((res) => setTimeout(res, 1500));

      // Later: send `input` to backend here
      toast.success("Interview rounds generated based on your input!");
      setInput("");
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {authUser?.username} 👋</h1>
      <p className="text-base text-gray-500">Prompt the system about your interview flow</p>

      {/* Interview Description Prompt */}
      <div className="bg-base-100 p-6 rounded-xl shadow space-y-4 border border-base-200">
        <label className="label">
          <span className="label-text font-semibold text-lg">Describe the Interview</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full min-h-[100px]"
          placeholder="e.g. The interview will have 3 rounds: Aptitude, Technical, HR. Each should be timed and scored..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="btn btn-primary flex gap-2"
          disabled={loading}
          onClick={handlePromptSubmit}
        >
          {loading && <span className="loading loading-spinner"></span>}
          <Sparkles className="w-5 h-5" />
          Generate Rounds
        </button>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/interviews" className="card bg-base-100 shadow-xl hover:bg-primary/10 transition">
          <div className="card-body items-center text-center">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h2 className="card-title">Start Interview</h2>
            <p>View mock interviews assigned to you</p>
          </div>
        </Link>

        <Link to="/resources/general" className="card bg-base-100 shadow-xl hover:bg-primary/10 transition">
          <div className="card-body items-center text-center">
            <Calendar className="h-8 w-8 text-primary" />
            <h2 className="card-title">Prepare</h2>
            <p>Practice rounds & topics</p>
          </div>
        </Link>

        <Link to="/settings" className="card bg-base-100 shadow-xl hover:bg-primary/10 transition">
          <div className="card-body items-center text-center">
            <Settings className="h-8 w-8 text-primary" />
            <h2 className="card-title">Settings</h2>
            <p>Manage your profile</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// src/pages/InterviewerDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function InterviewerDashboard() {
  const [interviewerName, setInterviewerName] = useState("Interviewer");

  // Later: fetch from auth store or Clerk user
  useEffect(() => {
    // setInterviewerName(authUser.fullName);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome back, {interviewerName} 👋</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingInterviews />
        <QuickActions />
        <RecentInterviews />
        <StatsCard />
      </div>
    </div>
  );
}

function UpcomingInterviews() {
  // Placeholder data
  const interviews = [
    { company: "Google", role: "SDE", time: "2:00 PM" },
    { company: "Amazon", role: "HR", time: "4:00 PM" },
  ];

  return (
    <div className="p-4 bg-base-200 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-3">🗓️ Upcoming Interviews</h2>
      {interviews.map((i, idx) => (
        <div key={idx} className="mb-2">
          <p className="font-medium">
            {i.company} - {i.role}
          </p>
          <p className="text-sm text-base-content/60">At {i.time}</p>
        </div>
      ))}
    </div>
  );
}

function QuickActions() {
  return (
    <div className="p-4 bg-base-200 rounded-xl shadow space-y-3">
      <h2 className="text-lg font-semibold mb-3">⚡ Quick Actions</h2>
      <Link to="/interview/create" className="btn btn-primary w-full">
        Create Interview
      </Link>
      <Link to="/question-bank" className="btn btn-outline w-full">
        View Question Bank
      </Link>
      <Link to="/invite" className="btn btn-outline w-full">
        Invite Candidate
      </Link>
    </div>
  );
}

function RecentInterviews() {
  const recent = [
    { company: "Flipkart", type: "SD1", date: "Jul 8" },
    { company: "Swiggy", type: "System Design", date: "Jul 7" },
  ];

  return (
    <div className="p-4 bg-base-200 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-3">🕓 Recent Interviews</h2>
      {recent.map((r, idx) => (
        <div key={idx} className="mb-2">
          <p>
            {r.company} - {r.type}
          </p>
          <p className="text-sm text-base-content/60">{r.date}</p>
        </div>
      ))}
    </div>
  );
}

function StatsCard() {
  return (
    <div className="p-4 bg-base-200 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-3">📊 Stats</h2>
      <ul className="space-y-1 text-base-content/80 text-sm">
        <li>✅ 5 interviews this week</li>
        <li>⭐ Avg score: 4.1 / 5</li>
        <li>🚩 2 candidates flagged</li>
      </ul>
    </div>
  );
}

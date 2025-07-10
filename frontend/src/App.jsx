import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

import { Toaster } from "react-hot-toast";
import InterviewerLayout from "./layouts/InterviewerLayout";
import Dashboard from "./pages/Interviewer/Dashboard";
import CreateInterview from "./pages/Interviewer/CreateInterview";
function App() {
  const { checkAuth, authUser, isCheckingAuth, logout } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  console.log(authUser);
  function btnClick() {
    logout();
  }
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <Navigate to="/interviewer/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        {/* <Route path="/settings" element= {<SettingsPage />} />
            <Route path="/profile" element= { authUser ? <ProfilePage /> : <Navigate to="/login"/> }/>  */}
        {/* INTERVIEWER ROUTES - Protected */}
        <Route
          path="/interviewer"
          element={authUser ? <InterviewerLayout /> : <Navigate to="/login" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create" element={<CreateInterview />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;

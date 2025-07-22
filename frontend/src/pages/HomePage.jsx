import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { MessageCircle, Calendar, Settings, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {useAIStore} from "../store/useAIStore";   
export default function HomePage() {
  

  return (
    <>
    </>
    // <div className="p-6 space-y-6">
      

    //   {/* Cards Section */}
    //   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    //     <Link to="/interviews" className="card bg-base-100 shadow-xl hover:bg-primary/10 transition">
    //       <div className="card-body items-center text-center">
    //         <MessageCircle className="h-8 w-8 text-primary" />
    //         <h2 className="card-title">Start Interview</h2>
    //         <p>View mock interviews assigned to you</p>
    //       </div>
    //     </Link>

    //     <Link to="/resources/general" className="card bg-base-100 shadow-xl hover:bg-primary/10 transition">
    //       <div className="card-body items-center text-center">
    //         <Calendar className="h-8 w-8 text-primary" />
    //         <h2 className="card-title">Prepare</h2>
    //         <p>Practice rounds & topics</p>
    //       </div>
    //     </Link>

    //     <Link to="/settings" className="card bg-base-100 shadow-xl hover:bg-primary/10 transition">
    //       <div className="card-body items-center text-center">
    //         <Settings className="h-8 w-8 text-primary" />
    //         <h2 className="card-title">Settings</h2>
    //         <p>Manage your profile</p>
    //       </div>
    //     </Link>
    //   </div>
    // </div>
  );
}

import TestCard from "./TestCard";
import { useAuthStore } from "../store/useAuthStore"; 
// Assuming you have an auth store to get user ID
const Practise = () => {
  const {authUser} = useAuthStore();
  const id = authUser._id 
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Your Tests</h1>
      <TestCard id={id} />
    </div>
  );
};

export default Practise;
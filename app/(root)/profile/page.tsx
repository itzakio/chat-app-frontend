"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { User } from "lucide-react";

const Profile = () => {
  const { user, isLoading } = useUser();
  const { logout } = useAuth();

  // Always show loading state while fetching
  if (isLoading) {
    return (
      <div className="max-w-350 mx-auto px-4 flex-1 flex flex-col items-center border w-full">
        <div className="w-full border flex flex-col items-center-safe gap-4">
          <div className="size-25 border rounded-full flex justify-center items-center">
            <User size={50} />
          </div>
          <h5 className="text-lg font-semibold">Loading...</h5>
          <p>Loading...</p>
          <div className="space-x-2">
            <button className="px-10 py-2 font-semibold bg-primary rounded-full">Post</button>
            <button className="px-10 py-2 font-semibold bg-secondary rounded-full">Edit</button>
            <button className="px-10 py-2 font-semibold bg-red-500 rounded-full cursor-pointer">
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-350 mx-auto px-4 flex-1 flex flex-col items-center border w-full">
      <div className="w-full border flex flex-col items-center-safe gap-4">
        <div className="size-25 border rounded-full flex justify-center items-center">
          <User size={50} />
        </div>
        <h5 className="text-lg font-semibold">{user?.name || "User"}</h5>
        <p>{user?.email || "No email"}</p>
        <div className="space-x-2">
          <button className="px-10 py-2 font-semibold bg-primary rounded-full">Post</button>
          <button className="px-10 py-2 font-semibold bg-secondary rounded-full">Edit</button>
          <button 
            className="px-10 py-2 font-semibold bg-red-500 rounded-full cursor-pointer" 
            onClick={() => logout()}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
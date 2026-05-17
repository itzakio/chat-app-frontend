import { User } from "lucide-react";
import React from "react";

const Profile = () => {
  return <div className="max-w-350 mx-auto px-4 flex-1 flex flex-col items-center border w-full">
    <div className="w-full border flex flex-col items-center-safe gap-4">
      <div className="size-25 border rounded-full flex justify-center items-center"><User size={50}/></div>
      <div className="space-x-2">
        <button className="px-10 py-2 font-semibold bg-primary rounded-full">Post</button>
        <button className="px-10 py-2 font-semibold bg-secondary rounded-full">Edit</button>
      </div>
    </div>
  </div>;
};

export default Profile;

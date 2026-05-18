import MobileMenu from "@/components/layout/MobileMenu";
import Navbar from "@/components/layout/Navbar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen ">
      {" "}
      <Navbar />
      <main className="w-full flex-1 max-w-350 mx-auto flex flex-col">{children}</main>
      <div>
        <MobileMenu/>
      </div>
    </div>
  );
};

export default layout;

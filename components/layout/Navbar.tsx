import { Menu } from "lucide-react";
import React from "react";
import { ThemeToggle } from "../ui/ThemeToggle";

const Navbar = () => {
  return (
    <nav>
      <div className="max-w-350 mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <Menu />
          <h5 className="font-semibold">Amiora</h5>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

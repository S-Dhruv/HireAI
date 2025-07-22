import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const activeClass = "text-primary font-bold underline"; // style of active link
  const normalClass = "hover:text-primary";

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">HIREAI</Link>
      </div>
      <div className="flex-none hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/create" className={isActive("/create") ? activeClass : normalClass}>Create</Link>
          </li>
          <li>
            <Link to="/practice" className={isActive("/practice") ? activeClass : normalClass}>Practice</Link>
          </li>
          <li>
            <Link to="/explore" className={isActive("/explore") ? activeClass : normalClass}>Explore</Link>
          </li>
          <li>
            <Link to="/profile" className={isActive("/profile") ? activeClass : normalClass}>Profile</Link>
          </li>
        </ul>
      </div>

      {/* Mobile dropdown */}
      <div className="dropdown dropdown-end md:hidden">
        <label tabIndex={0} className="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <ul tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li><Link to="/create" className={isActive("/create") ? activeClass : normalClass}>Create</Link></li>
          <li><Link to="/practice" className={isActive("/practice") ? activeClass : normalClass}>Practice</Link></li>
          <li><Link to="/explore" className={isActive("/explore") ? activeClass : normalClass}>Explore</Link></li>
          <li><Link to="/profile" className={isActive("/profile") ? activeClass : normalClass}>Profile</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;

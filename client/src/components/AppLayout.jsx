import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import { NavLink } from "react-router-dom";

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <NavLink to="/" className="rooted-brand">
  <img
    src="/images/rooted_logo.png"
    alt="ROOTED Detroit"
    className="rooted-brand-logo"
  />
</NavLink>

          <div>
            <h1>ROOTED</h1>
            <span>DETROIT</span>
          </div>
        </div>

        <button className="profile-button">A</button>
      </header>

      <Outlet />

      <BottomNav />
    </div>
  );
}

export default AppLayout;
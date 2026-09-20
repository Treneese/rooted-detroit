import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const menus = {
  plan: {
    label: "My Plan",
    icon: "☷",
    mainPath: "/plan",
    items: [
      {
        label: "Plan Overview",
        description: "Your personalized health plan",
        icon: "☷",
        path: "/plan",
      },
      {
        label: "Food & Recipes",
        description: "Meals that support your plan",
        icon: "🥗",
        path: "/food",
      },
      {
        label: "Herbs & Tea",
        description: "Your natural support",
        icon: "🌿",
        path: "/herbal",
      },
    ],
  },

  health: {
    label: "My Health",
    icon: "♡",
    mainPath: "/health",
    items: [
      {
        label: "Health Profile",
        description: "Your whole-health picture",
        icon: "♡",
        path: "/health",
      },
      {
        label: "Testing & Results",
        description: "Labs and health testing",
        icon: "◉",
        path: "/testing",
      },
      {
        label: "Progress",
        description: "Track changes over time",
        icon: "↗",
        path: "/progress",
      },
    ],
  },

  detroit: {
    label: "Explore Detroit",
    icon: "⌖",
    mainPath: "/detroit",
    items: [
      {
        label: "Wellness Network",
        description: "Providers and local resources",
        icon: "⌖",
        path: "/detroit",
      },
      {
        label: "Community & Support",
        description: "Groups, events and learning",
        icon: "◎",
        path: "/community",
      },
    ],
  },
};

function BottomNav() {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  const toggleMenu = (menu) => {
    setOpenMenu((current) =>
      current === menu ? null : menu
    );
  };

  const closeMenu = () => {
    setOpenMenu(null);
  };

  const isPlanActive = [
    "/plan",
    "/food",
    "/herbal",
  ].includes(location.pathname);

  const isHealthActive = [
    "/health",
    "/testing",
    "/progress",
  ].includes(location.pathname);

  const isDetroitActive = [
    "/detroit",
    "/community",
  ].includes(location.pathname);

  const activeStates = {
    plan: isPlanActive,
    health: isHealthActive,
    detroit: isDetroitActive,
  };

  return (
    <>
      {openMenu && (
        <div
          className="bottom-nav-overlay"
          onClick={closeMenu}
        />
      )}

      {openMenu && (
        <div className="bottom-nav-popover">
          <div className="bottom-nav-popover-handle" />

          <div className="bottom-nav-popover-header">
            <div>
              <span className="bottom-nav-popover-icon">
                {menus[openMenu].icon}
              </span>

              <div>
                <small>ROOTED</small>
                <strong>
                  {menus[openMenu].label}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="bottom-nav-popover-links">
            {menus[openMenu].items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive
                    ? "bottom-popover-link active"
                    : "bottom-popover-link"
                }
              >
                <span className="bottom-popover-link-icon">
                  {item.icon}
                </span>

                <div>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </div>

                <span className="bottom-popover-arrow">
                  ›
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

           <NavLink
  to="/ask-rooted"
  className="ask-rooted-floating"
  onClick={closeMenu}
  aria-label="Ask ROOTED"
>
  <span>✦</span>

  <div>
    <small>ASK</small>
    <strong>ROOTED</strong>
  </div>
</NavLink>

      <nav className="bottom-nav">
        <NavLink
          to="/"
          end
          onClick={closeMenu}
        >
          <span>⌂</span>
          Home
        </NavLink>

        <button
          type="button"
          className={
            isPlanActive || openMenu === "plan"
              ? "bottom-nav-button active"
              : "bottom-nav-button"
          }
          onClick={() => toggleMenu("plan")}
        >
          <span>☷</span>
          Plan
        </button>

        <button
          type="button"
          className={
            isHealthActive || openMenu === "health"
              ? "bottom-nav-button active"
              : "bottom-nav-button"
          }
          onClick={() => toggleMenu("health")}
        >
          <span>♡</span>
          Health
        </button>

        <button
          type="button"
          className={
            isDetroitActive || openMenu === "detroit"
              ? "bottom-nav-button active"
              : "bottom-nav-button"
          }
          onClick={() => toggleMenu("detroit")}
        >
          <span>⌖</span>
          Detroit
        </button>
      </nav>
    </>
  );
}

export default BottomNav;
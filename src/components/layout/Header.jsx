import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../services/auth";

const navStyle = ({ isActive }) => ({
  marginRight: 12,
  textDecoration: "none",
  fontWeight: isActive ? 700 : 400,
});

const ADMIN_REVEAL_KEY = "portfolio_admin_reveal";

function getAdminRevealFlag() {
  try {
    return sessionStorage.getItem(ADMIN_REVEAL_KEY) === "1";
  } catch {
    return false;
  }
}

function setAdminRevealFlag(value) {
  try {
    sessionStorage.setItem(ADMIN_REVEAL_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

export default function Header() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [adminRevealed, setAdminRevealed] =
    React.useState(getAdminRevealFlag());

  const onAdminPath = location.pathname.startsWith("/admin");

  // Reveal admin link with Cmd+. (Mac) or Ctrl+. (Win/Linux)
  React.useEffect(() => {
    function onKeyDown(e) {
      const isDot = e.key === "."; // '.' key
      const isCombo = (e.metaKey || e.ctrlKey) && isDot;
      if (!isCombo) return;

      e.preventDefault();
      setAdminRevealed((prev) => {
        const next = !prev;
        setAdminRevealFlag(next);
        return next;
      });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  // Show admin access only if:
  // - you are signed in, OR
  // - you're on an /admin route, OR
  // - you toggled reveal via key combo
  const showAdmin = !!user || onAdminPath || adminRevealed;

  return (
    <header
      style={{
        padding: 16,
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link to='/' style={{ textDecoration: "none" }}>
        <strong>Christopher Golizio</strong>
      </Link>

      <nav>
        <NavLink to='/projects' style={navStyle}>
          Projects
        </NavLink>
        <NavLink to='/blog' style={navStyle}>
          Blog
        </NavLink>
        <NavLink to='/about' style={navStyle}>
          About
        </NavLink>
        <NavLink to='/resume' style={navStyle}>
          Resume
        </NavLink>
        <NavLink to='/contact' style={navStyle}>
          Contact
        </NavLink>

        {showAdmin ? (
          <>
            <NavLink to={user ? "/admin" : "/admin/login"} style={navStyle}>
              Admin
            </NavLink>

            {!isLoading && user ? (
              <button onClick={handleSignOut} style={{ marginLeft: 8 }}>
                Sign out
              </button>
            ) : null}
          </>
        ) : null}
      </nav>
    </header>
  );
}

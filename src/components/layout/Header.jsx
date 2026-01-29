import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "../../services/auth";

const navStyle = ({ isActive }) => ({
  marginRight: 12,
  textDecoration: "none",
  fontWeight: isActive ? 700 : 400,
});

export default function Header() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

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

        {!isLoading && user ? (
          <>
            <NavLink to='/admin' style={navStyle}>
              Admin
            </NavLink>
            <button onClick={handleSignOut} style={{ marginLeft: 8 }}>
              Sign out
            </button>
          </>
        ) : (
          <NavLink to='/login' style={navStyle}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}

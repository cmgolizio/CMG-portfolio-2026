import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1>Admin</h1>
      <p>
        Signed in as: <strong>{user?.email}</strong>
      </p>
      <ul>
        <li>
          <Link to='/admin/projects'>Manage projects</Link>
        </li>
      </ul>
    </div>
  );
}

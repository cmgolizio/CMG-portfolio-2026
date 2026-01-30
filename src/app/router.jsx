import React from "react";
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";

import Home from "../pages/Home";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import About from "../pages/About";
import Resume from "../pages/Resume";
import Contact from "../pages/Contact";
import Blog from "../pages/Blog";

import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminProjects from "../pages/AdminProjects";
import AdminProjectEdit from "../pages/AdminProjectEdit";
import AdminMessages from "../pages/AdminMessages";
import NotFound from "../pages/NotFound";

export function createAppRouter() {
  return createBrowserRouter([
    {
      element: <AppShell />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/projects", element: <Projects /> },
        { path: "/projects/:slug", element: <ProjectDetail /> },
        { path: "/about", element: <About /> },
        { path: "/resume", element: <Resume /> },
        { path: "/contact", element: <Contact /> },
        { path: "/blog", element: <Blog /> },

        // Admin login (not advertised publicly)
        { path: "/admin/login", element: <AdminLogin /> },

        // Admin (protected)
        {
          path: "/admin",
          element: (
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "/admin/messages",
          element: (
            <ProtectedRoute>
              <AdminMessages />
            </ProtectedRoute>
          ),
        },
        {
          path: "/admin/projects",
          element: (
            <ProtectedRoute>
              <AdminProjects />
            </ProtectedRoute>
          ),
        },
        {
          path: "/admin/projects/new",
          element: (
            <ProtectedRoute>
              <AdminProjectEdit mode='create' />
            </ProtectedRoute>
          ),
        },
        {
          path: "/admin/projects/:id/edit",
          element: (
            <ProtectedRoute>
              <AdminProjectEdit mode='edit' />
            </ProtectedRoute>
          ),
        },

        { path: "*", element: <NotFound /> },
      ],
    },
  ]);
}

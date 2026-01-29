import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Christopher Golizio</h1>
      <p>
        Web developer. Projects, write-ups, and a blog feed pulled from Medium.
      </p>
      <p>
        <Link to='/projects'>View projects</Link> ·{" "}
        <Link to='/blog'>Read blog</Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Conversation from "./conversation";

export default function Guard() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return (
      <a
        href="#"
        className="w-full text-center"
        onClick={() => setLoggedIn(true)}
      >
        Click to login
      </a>
    );
  }

  return (
    <>
      <Conversation />
    </>
  );
}

"use client";

import { useEffect } from "react";
import LogRocket from "logrocket";

const LogRocketInit = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      LogRocket.init("edg7rp/meetingnotes-ai");
    }
  }, []);

  return null;
};

export default LogRocketInit;

"use client";

import React, { useEffect } from "react";
import Home from "../page";

export default function ContactPage() {
  useEffect(() => {
    // Smoothly scroll down to contact section when entering via /contact
    const el = document.getElementById("contact");
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, []);

  return <Home />;
}
"use client";

import { useState } from "react";

export default function NewFixPage() {
  const [title, setTitle] = useState("");

  async function submit() {
    const res = await fetch("/api/fix/new", {
      method: "POST",
      body: JSON.stringify({
        title,
        description: "Testbeskrivelse",
        category: "CSS",
        price: 490,
        pkg: "Basic",
      }),
    });

    const data = await res.json();
    console.log("Fix opprettet:", data);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Opprett test-fix</h1>
      <input
        placeholder="Tittel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 10, border: "1px solid #ccc", width: 300 }}
      />
      <br />
      <button
        onClick={submit}
        style={{ marginTop: 20, padding: "10px 20px", background: "black", color: "white" }}
      >
        Send inn
      </button>
    </div>
  );
}

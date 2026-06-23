"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FeedbackForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", message: "" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setSent(true);
      setForm({ name: "", contact: "", message: "" });
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white/80 p-4">
      <h3 className="font-semibold">Feedback</h3>
      <div className="mt-3 grid gap-2">
        <input
          className="rounded-xl border border-black/10 px-3 py-2 text-sm"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <input
          className="rounded-xl border border-black/10 px-3 py-2 text-sm"
          placeholder="Phone or email"
          value={form.contact}
          onChange={(event) => setForm({ ...form, contact: event.target.value })}
        />
        <textarea
          className="rounded-xl border border-black/10 px-3 py-2 text-sm"
          placeholder="Message"
          value={form.message}
          required
          onChange={(event) => setForm({ ...form, message: event.target.value })}
        />
        <Button>Send Feedback</Button>
        {sent ? <p className="text-sm font-medium text-[#16A34A]">Feedback sent. Thank you.</p> : null}
      </div>
    </form>
  );
}

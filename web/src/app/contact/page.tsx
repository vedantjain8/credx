"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-card-foreground mb-4">Contact</h1>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Subject
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Message
              </label>
              <textarea
                className="w-full rounded-md border border-border p-2 bg-background text-foreground"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>

            <div>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Submit
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded bg-muted">
            <p className="text-card-foreground">Thank you — message recorded.</p>
            <p className="text-sm text-muted-foreground mt-2">
              This form doesn&apos;t post to a backend yet. The data remains on the
              client during this demo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage(){
  const [email, setEmail] = useState("");
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-2xl bg-white shadow p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <label className="block text-sm mb-1">Email</label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-4"
          type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"
        />
        <button
          className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white"
          onClick={() => signIn("email", { email })}
        >
          Send magic link
        </button>
      </div>
    </main>
  );
}

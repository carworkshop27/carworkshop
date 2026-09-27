
"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  KeyRound,
  Mail,
  Lock,
} from "lucide-react";

export default function SuperUserSetup({
  onSetupComplete,
}) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    setupSecret: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      form.password !== form.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 12) {
      setError(
        "Password must contain at least 12 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/bootstrap",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            "x-workshop-setup-secret":
              form.setupSecret,
          },

          body: JSON.stringify({
            name: form.name,
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Administrator setup failed."
        );
      }

      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        setupSecret: "",
      });

      onSetupComplete?.(result.user);
    } catch (err) {
      setError(
        err.message ||
          "Unable to create administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">

        <div className="bg-slate-900 text-white p-7 text-center">

          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-emerald-400" />

          <h1 className="text-2xl font-black">
            Car Workshop
          </h1>

          <p className="text-sm text-slate-300 mt-2">
            Initial Super User Registration
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-7 space-y-4"
        >

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <div className="relative">

            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />

            <input
              required
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              className="w-full border rounded-xl p-3 pl-11 text-slate-900"
            />

          </div>

          <div className="relative">

            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />

            <input
              required
              placeholder="Login Username"
              value={form.username}
              onChange={(e) =>
                update("username", e.target.value)
              }
              className="w-full border rounded-xl p-3 pl-11 text-slate-900"
            />

          </div>

          <div className="relative">

            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />

            <input
              required
              type="email"
              placeholder="Administrator Email"
              value={form.email}
              onChange={(e) =>
                update("email", e.target.value)
              }
              className="w-full border rounded-xl p-3 pl-11 text-slate-900"
            />

          </div>

          <div className="relative">

            <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-400" />

            <input
              required
              type="password"
              minLength={12}
              placeholder="Password (minimum 12 characters)"
              value={form.password}
              onChange={(e) =>
                update("password", e.target.value)
              }
              className="w-full border rounded-xl p-3 pl-11 text-slate-900"
            />

          </div>

          <div className="relative">

            <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-400" />

            <input
              required
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                update(
                  "confirmPassword",
                  e.target.value
                )
              }
              className="w-full border rounded-xl p-3 pl-11 text-slate-900"
            />

          </div>

          <div className="relative">

            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />

            <input
              required
              type="password"
              placeholder="Administrator Setup Secret"
              value={form.setupSecret}
              onChange={(e) =>
                update(
                  "setupSecret",
                  e.target.value
                )
              }
              className="w-full border rounded-xl p-3 pl-11 text-slate-900"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl disabled:opacity-50"
          >
            {loading
              ? "Creating Administrator..."
              : "Create Super User Account"}
          </button>

        </form>

      </div>

    </div>
  );
}

"use client";

import React from "react";

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="text-xl font-semibold tracking-tight">{title}</div>
      {subtitle ? <div className="text-sm text-zinc-600 mt-1">{subtitle}</div> : null}
    </div>
  );
}

export function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-zinc-600">{title}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      {hint ? <div className="mt-2 text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const cls =
    variant === "primary"
      ? "bg-blue-500/80 text-white hover:bg-blue-500/70"
      : variant === "danger"
        ? "bg-red-500/80 text-white hover:bg-red-500/70"
        : "bg-green-500/80 text-white hover:bg-green-500/70";

  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30 ${props.className ?? ""}`}
    />
  );
}


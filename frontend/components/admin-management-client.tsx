"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdmin, deleteAdmin, updateAdmin } from "@/lib/api";
import type { AdminUser } from "@/lib/types";

type AdminForm = {
  username: string;
  email_address: string;
  password: string;
  location_assigned: string;
};

const EMPTY_FORM: AdminForm = {
  username: "",
  email_address: "",
  password: "",
  location_assigned: "",
};

export function AdminManagementClient({ admins }: { admins: AdminUser[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adminList, setAdminList] = useState(admins);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const totalActive = useMemo(
    () =>
      adminList.reduce((sum, admin) => sum + (admin.active_reports ?? 0), 0),
    [adminList],
  );

  function update(field: keyof AdminForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((previous) => ({ ...previous, [field]: e.target.value }));
  }

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMode("create");
    setError(null);
    setSaved(null);
  }

  function startEdit(admin: AdminUser) {
    setForm({
      username: admin.username,
      email_address: admin.email_address,
      password: "",
      location_assigned: admin.location_assigned ?? "",
    });
    setEditingId(admin.id);
    setMode("edit");
    setError(null);
    setSaved(null);
  }

  function cancelForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMode("list");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.email_address || !form.location_assigned) {
      setError("Username, email, and assigned location are required.");
      return;
    }
    if (mode === "create" && !form.password) {
      setError("Password is required for a new admin.");
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(null);
    try {
      if (mode === "create") {
        const created = await createAdmin({
          username: form.username,
          email_address: form.email_address,
          password: form.password,
          location_assigned: form.location_assigned,
        });
        setAdminList((previous) => [created, ...previous]);
        setSaved("Admin account created.");
      } else if (editingId) {
        const updated = await updateAdmin(editingId, {
          username: form.username,
          email_address: form.email_address,
          location_assigned: form.location_assigned,
        });
        setAdminList((previous) =>
          previous.map((admin) => (admin.id === updated.id ? updated : admin)),
        );
        setSaved("Admin account updated.");
      }
      cancelForm();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save admin account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(admin: AdminUser) {
    const confirmed = window.confirm(
      `Delete ${admin.username}? This admin account will be removed permanently.`,
    );
    if (!confirmed) return;

    setDeletingId(admin.id);
    setError(null);
    setSaved(null);
    try {
      await deleteAdmin(admin.id);
      setAdminList((previous) =>
        previous.filter((item) => item.id !== admin.id),
      );
      setSaved("Admin account deleted.");
      if (editingId === admin.id) cancelForm();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete admin account. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-black tracking-tight">Manage Admins</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and maintain barangay admin accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="h-10 px-4 rounded-xl bg-violet-600 text-white text-sm font-black hover:bg-violet-600/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          + New Admin
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-7">
        <StatCard label="Total Admins" value={adminList.length} tone="violet" />
        <StatCard label="Active Reports" value={totalActive} tone="amber" />
      </div>

      {(mode === "create" || mode === "edit") && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-violet-500/25 rounded-2xl p-4 mb-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-black">
                {mode === "create" ? "Create admin" : "Edit admin"}
              </p>
              <p className="text-xs text-muted-foreground">
                {mode === "create"
                  ? "Use the assigned barangay location from the backend."
                  : "Update the admin profile details."}
              </p>
            </div>
            <button
              type="button"
              onClick={cancelForm}
              className="relative w-8 h-8 rounded-lg border border-border text-transparent after:content-['x'] after:absolute after:inset-0 after:grid after:place-items-center after:text-muted-foreground hover:after:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              aria-label="Cancel"
            >
              ×
            </button>
          </div>
          {error && (
            <div className="mb-3 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              id="admin-username"
              label="Username"
              value={form.username}
              onChange={update("username")}
              autoComplete="username"
            />
            <Field
              id="admin-email"
              label="Email"
              type="email"
              value={form.email_address}
              onChange={update("email_address")}
              autoComplete="email"
            />
            <Field
              id="admin-location"
              label="Assigned location"
              value={form.location_assigned}
              onChange={update("location_assigned")}
              autoComplete="street-address"
            />
            {mode === "create" && (
              <Field
                id="admin-password"
                label="Password"
                type="password"
                value={form.password}
                onChange={update("password")}
                autoComplete="new-password"
                required
              />
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={cancelForm}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold hover:bg-muted/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-violet-600 text-white text-sm font-black hover:bg-violet-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      )}

      {saved && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-xs font-semibold text-emerald-500">
          {saved}
        </div>
      )}
      {error && mode === "list" && (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {adminList.length === 0 && (
          <div className="bg-card border border-border/60 rounded-2xl p-8 text-center">
            <p className="font-black">No admin accounts found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create the first admin account for this barangay.
            </p>
          </div>
        )}
        {adminList.map((admin) => (
          <div
            key={admin.id}
            className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-black shrink-0">
                {admin.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm truncate">
                    {admin.username}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {admin.email_address}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {admin.location_assigned || "No assigned location"}
                </p>
              </div>
              <div className="hidden sm:block text-right min-w-12">
                <p className="text-[10px] text-muted-foreground">Active</p>
                <p
                  className={`text-lg font-black mt-0.5 ${
                    (admin.active_reports ?? 0) > 0
                      ? "text-amber-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {admin.active_reports ?? 0}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(admin)}
                  className="h-9 px-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(admin)}
                  disabled={deletingId === admin.id}
                  className="h-9 px-3 rounded-xl border border-red-500/25 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deletingId === admin.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "violet" | "amber";
}) {
  const style =
    tone === "violet"
      ? "bg-violet-500/10 border-violet-500/20 text-foreground"
      : "bg-amber-500/10 border-amber-500/20 text-amber-400";

  return (
    <div className={`bg-card border rounded-2xl p-4 text-center shadow-sm ${style}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = true,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
      />
    </div>
  );
}

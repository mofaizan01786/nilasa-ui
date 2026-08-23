"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { fetchUsersAdmin } from "@/lib/dotnet-backend";
import { UserDrawer } from "./UserDrawer";
import { AdminToast } from "./AdminToast";
import {
  Plus,
  Pencil,
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  RefreshCw
} from "lucide-react";

interface AdminUsersClientProps {
  users: User[];
}

export function AdminUsersClient({ users: initialUsers }: AdminUsersClientProps) {
  const router = useRouter();

  const [userList, setUserList] = useState<User[]>(initialUsers || []);
  const [loading, setLoading] = useState<boolean>(!initialUsers || initialUsers.length === 0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadUsersData = useCallback(async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("nilasa-auth-token") || undefined
          : undefined;
      const list = await fetchUsersAdmin(0, 200, undefined, undefined, token);
      if (list && Array.isArray(list)) {
        setUserList(list);
      }
    } catch (err) {
      console.error("Failed to load users client-side:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsersData();
  }, [loadUsersData]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setDrawerOpen(true);
  };

  const handleReload = async (msg?: string) => {
    if (msg) setToastMessage(msg);
    await loadUsersData();
    router.refresh();
  };

  const filteredUsers = useMemo(() => {
    let list = [...userList];

    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role?.toLowerCase() === roleFilter.toLowerCase());
    }

    if (statusFilter === "ACTIVE") {
      list = list.filter((u) => u.isActive);
    } else if (statusFilter === "DISABLED") {
      list = list.filter((u) => !u.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone?.includes(q) ||
          String(u.userId || u.id).includes(q)
      );
    }

    return list;
  }, [userList, searchQuery, roleFilter, statusFilter]);

  return (
    <div>
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Staff & Users ({filteredUsers.length})</h1>
          <p className="admin-page-subtitle">Manage customer accounts, admin roles, and security permissions</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => loadUsersData()}
            className="admin-btn-secondary"
            title="Refresh user list"
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? "admin-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="admin-btn-primary"
          >
            <Plus size={15} strokeWidth={2} />
            <span>Add user account</span>
          </button>
        </div>
      </div>

      {/* Slim Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          {/* Search Box */}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <Search
              size={14}
              color="var(--admin-slate-600)"
              style={{ position: "absolute", left: 10, pointerEvents: "none" }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
              style={{ width: 280 }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="ALL">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
            <option value="Staff">Staff</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select-filter"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="DISABLED">Suspended / Disabled</option>
          </select>
        </div>

        <div style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
          Showing {filteredUsers.length} of {userList.length} users
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-table-container">
        {loading && userList.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--admin-slate-600)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "3px solid #E2E8F0",
                borderTopColor: "#B87078",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px"
              }}
            />
            <p style={{ margin: 0, fontSize: "13px" }}>Loading users from database...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={36} className="admin-empty-state__icon" strokeWidth={1.5} />
            <h3 className="admin-empty-state__title">No users found</h3>
            <p className="admin-empty-state__desc">
              {searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL"
                ? "No user accounts match your active search filters."
                : "No user accounts found in database. Create your first staff or customer account."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="admin-btn-primary"
            >
              <Plus size={14} />
              <span>Add user account</span>
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const uid = u.userId || u.id || 0;
                const isAdmin = u.role?.toLowerCase() === "admin";
                return (
                  <tr key={uid || u.email}>
                    <td style={{ color: "var(--admin-slate-600)", fontWeight: 600 }} className="admin-tabular">
                      #{uid}
                    </td>
                    <td>
                      <strong style={{ color: "var(--admin-ink)" }}>{u.name}</strong>
                    </td>
                    <td style={{ color: "var(--admin-slate-600)" }}>
                      {u.email}
                    </td>
                    <td style={{ color: "var(--admin-slate-600)" }}>
                      {u.phone || "—"}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: isAdmin ? "var(--admin-accent-tint, #FDF2F3)" : "#F1F3F7",
                          color: isAdmin ? "var(--admin-accent, #B87078)" : "var(--admin-slate-600)",
                          fontWeight: isAdmin ? 600 : 500,
                          fontSize: "11px"
                        }}
                      >
                        {isAdmin && <Shield size={11} strokeWidth={2.5} style={{ marginRight: 3 }} />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.isActive ? "status-badge--published" : "status-badge--draft"}`}>
                        <span className="status-dot" />
                        <span>{u.isActive ? "Active" : "Suspended"}</span>
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="admin-table-btn"
                      >
                        <Pencil size={12} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* User Drawer (Create / Edit / Password Reset) */}
      <UserDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={editingUser}
        onSaved={handleReload}
      />
    </div>
  );
}

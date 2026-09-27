"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { fetchUsersAdminPaged } from "@/lib/dotnet-backend";
import { UserDrawer } from "./UserDrawer";
import { AdminToast } from "./AdminToast";
import { AdminTablePagination } from "./AdminTablePagination";
import {
  Plus,
  Pencil,
  Users,
  Search,
  Shield,
  RefreshCw
} from "lucide-react";

interface AdminUsersClientProps {
  users?: User[];
}

export function AdminUsersClient({ users: initialUsers }: AdminUsersClientProps) {
  const router = useRouter();

  // Data & Pagination States
  const [userList, setUserList] = useState<User[]>(initialUsers || []);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadPagedUsers = useCallback(async (page: number, size: number, role: string, query: string) => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("nilasa-auth-token") || undefined
          : undefined;

      const result = await fetchUsersAdminPaged(
        page,
        size,
        role === "ALL" ? undefined : role,
        query || undefined,
        token
      );

      if (result && Array.isArray(result.items)) {
        setUserList(result.items);
        setHasMore(result.hasMore);
        if (result.totalCount !== undefined) {
          setTotalCount(result.totalCount);
        }
        if (result.totalPages !== undefined) {
          setTotalPages(result.totalPages);
        }
      }
    } catch (err) {
      console.error("[AdminUsers] Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPagedUsers(currentPage, pageSize, roleFilter, searchQuery);
  }, [currentPage, pageSize, roleFilter, loadPagedUsers]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadPagedUsers(1, pageSize, roleFilter, val);
    }, 350);
  };

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    await loadPagedUsers(currentPage, pageSize, roleFilter, searchQuery);
    router.refresh();
  };

  const filteredUsers = useMemo(() => {
    let list = [...userList];

    if (statusFilter === "ACTIVE") {
      list = list.filter((u) => u.isActive);
    } else if (statusFilter === "DISABLED") {
      list = list.filter((u) => !u.isActive);
    }

    return list;
  }, [userList, statusFilter]);

  const startCount = userList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endCount = (currentPage - 1) * pageSize + userList.length;

  return (
    <div className="admin-page-root">
      {toastMessage && (
        <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            Staff & Customers {totalCount !== undefined ? `(${totalCount})` : `(Page ${currentPage})`}
          </h1>
          <p className="admin-page-subtitle">
            Showing {startCount} – {endCount} {totalCount ? `of ${totalCount}` : ""} accounts across roles and access levels
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => loadPagedUsers(currentPage, pageSize, roleFilter, searchQuery)}
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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="admin-search-input"
              style={{ width: 280 }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
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

        <div style={{ fontSize: "12.5px", color: "var(--admin-slate-600)" }}>
          {loading ? (
            <span>Loading users page {currentPage}...</span>
          ) : (
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong> • Showing {filteredUsers.length} users
            </span>
          )}
        </div>
      </div>

      {/* Data Table Container */}
      <div className="admin-table-container">
        {loading && userList.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--admin-slate-600)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "3px solid #E2E8F0",
                borderTopColor: "var(--admin-primary, #7A2832)",
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
                : "No user accounts found on this page."}
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
          <div className="admin-table-scroll">
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
                        {u.email && !u.email.endsWith("@phone.nilasa.local") ? u.email : (u.phone ? `Phone Account (+91 ${u.phone.replace(/\D/g, "").slice(-10)})` : "—")}
                      </td>
                      <td style={{ color: "var(--admin-slate-600)" }}>
                        {u.phone || "—"}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: isAdmin ? "var(--admin-primary-soft, #FDF2F3)" : "#F1F3F7",
                            color: isAdmin ? "var(--admin-primary, #7A2832)" : "var(--admin-slate-600)",
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
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        <AdminTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalCount}
          totalPages={totalPages}
          currentCount={userList.length}
          hasMore={hasMore}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[20, 50, 100]}
          itemLabel="customers"
          loading={loading}
        />
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

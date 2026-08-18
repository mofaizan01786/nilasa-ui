import {
  Product, Category, Coupon, Order, User, AuthResponse,
  CouponValidationResult, ProductStatus, OrderStatus, ProductVariant, ProductImage,
  CreateUserPayload, UpdateUserRolePayload, AdminResetPasswordPayload, ChangePasswordPayload,
  NavigationConfig, NavigationMenuItem, BannersConfig, RegisterCustomerPayload
} from "./types";
import { resolveProductImageUrl } from "./catalog";

// ─── Base URLs (Dynamically sourced from environment variables) ───
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "/api/v1";
export const SERVER_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || PUBLIC_API_URL;

export function getApiBaseUrl(): string {
  return typeof window === "undefined" ? SERVER_API_URL : PUBLIC_API_URL;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const localToken = window.localStorage.getItem("nilasa-auth-token");
  if (localToken) return localToken;
  try {
    const match = document.cookie.match(/(?:^|;\s*)nilasa_session=([^;]*)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
  } catch {
    // ignore
  }
  return null;
}

export async function getAuthTokenAsync(): Promise<string | null> {
  if (typeof window !== "undefined") {
    return getAuthToken();
  }
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("nilasa_session")?.value || null;
  } catch {
    return null;
  }
}

export function getAuthHeaders(token?: string): HeadersInit {
  const activeToken = token || getAuthToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;
  return headers;
}

export async function getAuthHeadersAsync(token?: string): Promise<HeadersInit> {
  const activeToken = token || (await getAuthTokenAsync());
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;
  return headers;
}

// ─── Safe Fetch Helper (handles connection errors gracefully) ──
async function safeFetch(url: string, options?: RequestInit): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch {
    // Backend offline / unreachable — silently return null
    return null;
  }
}

// ─── Normalise helpers ──────────────────────────────────
function normaliseProduct(p: Product): Product {
  const mainImage = resolveProductImageUrl(p.imageUrl || p.images?.[0]?.imageUrl);
  const images = (p.images ?? []).map(img => ({
    ...img,
    imageUrl: resolveProductImageUrl(img.imageUrl)
  }));
  const variants = (p.variants ?? []).map(v => ({
    ...v,
    imageUrl: v.imageUrl ? resolveProductImageUrl(v.imageUrl) : undefined
  }));

  return {
    ...p,
    id: p.productId ?? p.id,
    imageUrl: mainImage || undefined,
    images: images,
    variants: variants,
    status: p.status ?? "Published"
  };
}

function normaliseCategory(c: Category): Category {
  return { ...c, id: c.categoryId ?? c.id };
}

function normaliseOrder(o: Order): Order {
  return {
    ...o,
    id: o.orderId ?? o.id,
    createdAt: o.placedAt ?? o.createdAt,
    items: (o.items ?? []).map(item => ({
      ...item,
      id: item.orderItemId ?? item.id,
      productId: item.productVariantId ?? item.productId,
      unitPrice: item.priceAtPurchase ?? item.unitPrice
    }))
  };
}

function normaliseCoupon(c: Coupon): Coupon {
  return { ...c, id: c.couponId ?? c.id, active: c.isActive ?? c.active };
}

function normaliseUser(u: User): User {
  return {
    ...u,
    id: u.userId ?? u.id,
    phone: u.phone ?? null,
    isActive: u.isActive ?? true
  };
}

// ─── STOREFRONT API (Public, Live Data Only) ────────────

export async function fetchPublishedProducts(): Promise<Product[]> {
  const isClient = typeof window !== "undefined";
  const res = await safeFetch(`${getApiBaseUrl()}/products`, isClient ? { cache: "no-store" } : { next: { revalidate: 0 } });
  if (res && res.ok) {
    try {
      const data = await res.json();
      if (Array.isArray(data)) return data.map(normaliseProduct);
    } catch {
      // json parse error
    }
  }
  return [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const isClient = typeof window !== "undefined";
  const res = await safeFetch(`${getApiBaseUrl()}/products/slug/${encodeURIComponent(slug)}`, isClient ? { cache: "no-store" } : { next: { revalidate: 0 } });
  if (res && res.ok) {
    try {
      return normaliseProduct(await res.json());
    } catch {
      // json error
    }
  }
  return null;
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const isClient = typeof window !== "undefined";
  const res = await safeFetch(`${getApiBaseUrl()}/products/${id}`, isClient ? { cache: "no-store" } : { next: { revalidate: 0 } });
  if (res && res.ok) {
    try {
      return normaliseProduct(await res.json());
    } catch {
      // json error
    }
  }
  return null;
}

export async function fetchCategories(): Promise<Category[]> {
  const isClient = typeof window !== "undefined";
  const res = await safeFetch(`${getApiBaseUrl()}/categories`, isClient ? { cache: "no-store" } : { next: { revalidate: 0 } });
  if (res && res.ok) {
    try {
      const data = await res.json();
      if (Array.isArray(data)) return data.map(normaliseCategory);
    } catch {
      // json error
    }
  }
  return [];
}

// ─── ADMIN API (Products CRUD) ──────────────────────────

export async function fetchAllProductsAdmin(statusFilter?: string, token?: string): Promise<Product[]> {
  const headers = await getAuthHeadersAsync(token);
  const res = await safeFetch(`${getApiBaseUrl()}/products/admin`, { headers, cache: "no-store" });
  if (res && res.ok) {
    try {
      let data: Product[] = (await res.json()).map(normaliseProduct);
      if (statusFilter) {
        data = data.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
      }
      return data;
    } catch {
      // json error
    }
  }
  return [];
}

export async function createProduct(
  payload: { categoryId: number; name: string; slug: string; description?: string; basePrice: number },
  token?: string
): Promise<Product | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  if (res && (res.ok || res.status === 201)) {
    try {
      const data = await res.json();
      return normaliseProduct(data);
    } catch {
      // json error
    }
  }
  return null;
}

export async function updateProduct(
  id: number,
  payload: { categoryId: number; name: string; slug: string; description?: string; basePrice: number },
  token?: string
): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      productId: id,
      categoryId: payload.categoryId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || null,
      basePrice: payload.basePrice
    })
  });
  return !!res && (res.ok || res.status === 204);
}

export async function patchProductStatus(id: number, status: ProductStatus, token?: string): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/products/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ status })
  });
  return !!res && (res.ok || res.status === 204);
}

export async function deleteProduct(id: number, token?: string): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token)
  });
  return !!res && (res.ok || res.status === 204);
}

export async function uploadProductImage(
  id: number,
  file: File,
  sortOrder = 0,
  token?: string
): Promise<ProductImage | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sortOrder", String(sortOrder));
  const activeToken = token || getAuthToken();
  const headers: HeadersInit = {};
  if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

  const res = await safeFetch(`${PUBLIC_API_URL}/products/${id}/images`, {
    method: "POST",
    headers,
    body: formData
  });
  if (res && (res.ok || res.status === 201)) {
    try {
      const data = await res.json();
      return data;
    } catch {
      // json error
    }
  }
  return null;
}

export async function deleteProductImage(
  productId: number,
  productImageId: number,
  token?: string
): Promise<boolean> {
  const activeToken = token || getAuthToken();
  const headers: HeadersInit = {};
  if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

  const res = await safeFetch(`${PUBLIC_API_URL}/products/${productId}/images/${productImageId}`, {
    method: "DELETE",
    headers
  });
  return !!res && (res.ok || res.status === 204);
}

export async function createProductVariant(
  productId: number,
  payload: { size: string; color: string; sku: string; price: number; stockQuantity: number; imageUrl?: string },
  token?: string
): Promise<ProductVariant | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/products/${productId}/variants`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  if (res && (res.ok || res.status === 201)) {
    try {
      return await res.json();
    } catch {
      // json error
    }
  }
  return null;
}

export async function updateProductVariant(
  variantId: number,
  payload: { size: string; color: string; sku: string; price: number; stockQuantity: number; imageUrl?: string },
  token?: string
): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/products/variants/${variantId}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      productVariantId: variantId,
      size: payload.size,
      color: payload.color,
      sku: payload.sku,
      price: payload.price,
      stockQuantity: payload.stockQuantity,
      imageUrl: payload.imageUrl || null
    })
  });
  return !!res && (res.ok || res.status === 204);
}

export async function deleteProductVariant(variantId: number, token?: string): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/products/variants/${variantId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token)
  });
  return !!res && (res.ok || res.status === 204);
}

// ─── ADMIN API (Categories CRUD) ────────────────────────

export async function createCategory(
  payload: { name: string; slug: string; parentCategoryId?: number | null },
  token?: string
): Promise<Category | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/categories`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  if (res && (res.ok || res.status === 201)) {
    try {
      const data = await res.json();
      return normaliseCategory(data);
    } catch {
      // json error
    }
  }
  return null;
}

export async function updateCategory(
  id: number,
  payload: { name?: string; slug?: string; parentCategoryId?: number | null },
  token?: string
): Promise<Category | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  if (res && (res.ok || res.status === 200)) {
    try {
      const data = await res.json();
      return normaliseCategory(data);
    } catch {
      // json error
    }
  }
  return null;
}

// ─── ADMIN API (Coupons CRUD) ───────────────────────────

export async function fetchCouponsAdmin(token?: string): Promise<Coupon[]> {
  const headers = await getAuthHeadersAsync(token);
  const res = await safeFetch(`${getApiBaseUrl()}/coupons`, { headers, cache: "no-store" });
  if (res && res.ok) {
    try {
      const data = await res.json();
      if (Array.isArray(data)) return data.map(normaliseCoupon);
    } catch {
      // json error
    }
  }
  return [];
}

export async function createCoupon(
  payload: {
    code: string;
    discountType: string;
    discountValue: number;
    minOrderAmount: number;
    maximumDiscount?: number | null;
    usageLimit?: number | null;
    usagePerUser?: number | null;
    validFrom: string;
    validTo: string;
    isActive: boolean;
  },
  token?: string
): Promise<Coupon | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/coupons`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  if (res && (res.ok || res.status === 201)) {
    try {
      const data = await res.json();
      return normaliseCoupon(data);
    } catch {
      // json error
    }
  }
  return null;
}

export async function updateCoupon(
  id: number,
  payload: {
    discountValue?: number;
    minOrderAmount?: number;
    maximumDiscount?: number | null;
    usageLimit?: number | null;
    usagePerUser?: number | null;
    validFrom?: string;
    validTo?: string;
    isActive?: boolean;
  },
  token?: string
): Promise<Coupon | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/coupons/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  if (res && (res.ok || res.status === 200)) {
    try {
      const data = await res.json();
      return normaliseCoupon(data);
    } catch {
      // json error
    }
  }
  return null;
}

// ─── ADMIN & STOREFRONT (Orders) ────────────────────────

export async function fetchOrdersAdmin(statusFilter?: string, token?: string): Promise<Order[]> {
  const headers = await getAuthHeadersAsync(token);
  const res = await safeFetch(`${getApiBaseUrl()}/orders`, { headers, cache: "no-store" });
  if (res && res.ok) {
    try {
      let data: Order[] = (await res.json()).map(normaliseOrder);
      if (statusFilter) {
        data = data.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
      }
      return data;
    } catch {
      // json error
    }
  }
  return [];
}

export async function fetchOrderByIdAdmin(id: number, token?: string): Promise<Order | null> {
  const headers = await getAuthHeadersAsync(token);
  const res = await safeFetch(`${getApiBaseUrl()}/orders/${id}`, { headers, cache: "no-store" });
  if (res && res.ok) {
    try {
      return normaliseOrder(await res.json());
    } catch {
      // json error
    }
  }
  return null;
}

// ─── CHECKOUT & COUPON VALIDATION ───────────────────────

export async function validateCoupon(code: string, orderAmount: number, token?: string): Promise<CouponValidationResult | null> {
  const headers = getAuthHeaders(token);
  const res = await safeFetch(
    `${PUBLIC_API_URL}/coupons/validate/${encodeURIComponent(code)}?orderAmount=${orderAmount}`,
    { headers }
  );
  if (res && res.ok) {
    try {
      return await res.json();
    } catch {
      // json error
    }
  }
  return null;
}

export async function createOrder(
  payload: { addressId: number; items: { productVariantId: number; quantity: number }[] },
  token?: string
): Promise<number | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/orders`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  if (res && res.ok) {
    try {
      const data = await res.json();
      return typeof data === "number" ? data : data.orderId ?? data;
    } catch {
      // json error
    }
  }
  return null;
}

// ─── AUTH & VERIFICATION ────────────────────────────────

export async function sendVerificationCodeBackend(
  email: string,
  purpose: string = "Register"
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await safeFetch(`${PUBLIC_API_URL}/auth/send-verification-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), purpose })
    });
    if (res) {
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return {
          success: true,
          message: data.message || "Verification code dispatched."
        };
      }
      return {
        success: false,
        message: data.message || "Failed to dispatch verification code."
      };
    }
  } catch (err: any) {
    return { success: false, message: err.message || "Unable to reach verification service." };
  }
  return { success: false, message: "Verification service temporarily unavailable." };
}

export async function verifyCodeBackend(
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await safeFetch(`${PUBLIC_API_URL}/auth/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() })
    });
    if (res) {
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, message: data.message || "Code verified successfully." };
      }
      return { success: false, message: data.message || "Incorrect or expired verification code." };
    }
  } catch (err: any) {
    return { success: false, message: err.message || "Network error while verifying code." };
  }
  return { success: false, message: "Verification service unreachable." };
}

export async function loginBackend(
  email: string,
  password: string
): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
  try {
    const res = await safeFetch(`${PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password })
    });
    if (res) {
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, data };
      }
      return { success: false, error: data.message || "Invalid email or password." };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Unable to connect to authentication service." };
  }
  return { success: false, error: "Authentication service offline." };
}

export async function registerBackend(
  payload: RegisterCustomerPayload
): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
  try {
    const res = await safeFetch(`${PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        phone: payload.phone?.trim() || null,
        verificationCode: payload.verificationCode?.trim() || null
      })
    });
    if (res) {
      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 201) {
        return { success: true, data };
      }
      return { success: false, error: data.message || "Registration failed. Please try again." };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Unable to connect to registration service." };
  }
  return { success: false, error: "Registration service offline." };
}

export async function fetchCurrentUser(token?: string): Promise<User | null> {
  const headers = getAuthHeaders(token);
  const res = await safeFetch(`${PUBLIC_API_URL}/auth/me`, {
    headers
  });
  if (res && res.ok) {
    try {
      const data = await res.json();
      return normaliseUser(data);
    } catch {
      // json parse error
    }
  }
  return null;
}

export async function changePassword(payload: ChangePasswordPayload, token?: string): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  return !!res && (res.ok || res.status === 204);
}

export async function refreshTokenBackend(accessToken: string, refreshToken: string): Promise<AuthResponse | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, refreshToken })
  });
  if (res && res.ok) {
    try {
      return await res.json();
    } catch {
      // json error
    }
  }
  return null;
}

// ─── USER MANAGEMENT API (Admin Only) ───────────────────

export async function fetchUsersAdmin(
  skip = 0,
  take = 50,
  role?: string,
  search?: string,
  token?: string
): Promise<User[]> {
  const headers = await getAuthHeadersAsync(token);
  const params = new URLSearchParams();
  params.set("skip", String(skip));
  params.set("take", String(take));
  if (role && role !== "ALL") params.set("role", role);
  if (search && search.trim()) params.set("search", search.trim());

  const res = await safeFetch(`${getApiBaseUrl()}/users?${params.toString()}`, {
    headers,
    cache: "no-store"
  });
  if (res && res.ok) {
    try {
      const data = await res.json();
      if (Array.isArray(data)) return data.map(normaliseUser);
    } catch {
      // json error
    }
  }
  return [];
}

export async function fetchUserByIdAdmin(userId: number, token?: string): Promise<User | null> {
  const headers = await getAuthHeadersAsync(token);
  const res = await safeFetch(`${getApiBaseUrl()}/users/${userId}`, {
    headers,
    cache: "no-store"
  });
  if (res && res.ok) {
    try {
      return normaliseUser(await res.json());
    } catch {
      // json error
    }
  }
  return null;
}

export async function createUserAdmin(payload: CreateUserPayload, token?: string): Promise<User | null> {
  const res = await safeFetch(`${PUBLIC_API_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  if (res && (res.ok || res.status === 201)) {
    try {
      const data = await res.json();
      return normaliseUser(data);
    } catch {
      // json error
    }
  }
  return null;
}

export async function updateUserRoleAdmin(
  userId: number,
  payload: UpdateUserRolePayload,
  token?: string
): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/users/${userId}/role`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload)
  });
  return !!res && (res.ok || res.status === 204);
}

export async function resetUserPasswordAdmin(
  userId: number,
  newPassword: string,
  token?: string
): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/users/${userId}/reset-password`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ newPassword })
  });
  return !!res && (res.ok || res.status === 204);
}

// ─── PAYMENTS & REFUNDS (Admin Only) ─────────────────────

export async function refundPaymentAdmin(
  paymentId: number,
  amount?: number,
  token?: string
): Promise<boolean> {
  const res = await safeFetch(`${PUBLIC_API_URL}/payments/${paymentId}/refund`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ amount: amount || null })
  });
  return !!res && (res.ok || res.status === 200 || res.status === 204);
}

// ─── DYNAMIC NAVIGATION API ──────────────────────────────

export async function fetchNavigationConfig(): Promise<NavigationConfig | null> {
  try {
    const res = await fetch(`/api/navigation`, { cache: "no-store" });
    if (res && res.ok) {
      const json = await res.json();
      if (json && json.data) return json.data;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function saveNavigationConfig(
  items: NavigationMenuItem[],
  token?: string
): Promise<{ success: boolean; data?: NavigationConfig; error?: string }> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`/api/navigation`, {
      method: "POST",
      headers,
      body: JSON.stringify({ items })
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json.data };
    }
    const errJson = await res.json().catch(() => ({}));
    return { success: false, error: errJson.message || "Failed to save navigation" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while saving navigation" };
  }
}

// ─── DYNAMIC BANNERS & OFFERS API ────────────────────────

export async function fetchBannersConfig(): Promise<BannersConfig | null> {
  try {
    const res = await fetch(`/api/banners`, { cache: "no-store" });
    if (res && res.ok) {
      const json = await res.json();
      if (json && json.data) return json.data;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function saveBannersConfig(
  payload: Partial<BannersConfig>,
  token?: string
): Promise<{ success: boolean; data?: BannersConfig; error?: string }> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`/api/banners`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json.data };
    }
    const errJson = await res.json().catch(() => ({}));
    return { success: false, error: errJson.message || "Failed to save banners configuration" };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error while saving banners" };
  }
}

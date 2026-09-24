// Shared TypeScript interfaces — aligned to real .NET backend DTOs
// All IDs are int64 (number). JSON uses camelCase.

// ─── Enums ──────────────────────────────────────────────

export type ProductStatus = "Published" | "Draft" | "Archived";
export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded" | "Success";
export type DiscountType = "percentage" | "flat" | "Percentage" | "Flat";

export interface PagedAdminResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount?: number;
  totalPages?: number;
  hasMore: boolean;
}

// ─── Products ───────────────────────────────────────────

export interface ProductVariant {
  productVariantId: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface ProductImage {
  productImageId: number;
  imageUrl: string;
  thumbnailUrl?: string;
  sortOrder: number;
}

export interface Product {
  productId: number;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  status: ProductStatus;
  categoryId: number;
  categoryName?: string;
  variants: ProductVariant[];
  images: ProductImage[];

  // ── Merchandising & Catalog Attributes (Backend Aligned) ──
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
  tags?: string;
  mrp?: number;
  discountPercent?: number;
  brand?: string;
  averageRating?: number;
  reviewCount?: number;
  stockQuantity?: number;

  // ── UI-only fields (not from API) ──
  id?: number; // alias for backward compat
  categorySlug?: string;
  fabric?: string;
  color?: string;
  badge?: string;
  badgeType?: "gold" | "lavender" | "emerald";
  imageUrl?: string; // resolved from images[0]
  createdAt?: string;
  updatedAt?: string;
}

// ─── Filter Options (Backend Aligned) ────────────────────

export interface CategoryFilterItem {
  categoryId: number;
  name: string;
  slug: string;
  productCount: number;
}

export interface FilterOptions {
  categories: CategoryFilterItem[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
}

export interface ProductFilterParams {
  categoryId?: number;
  search?: string;
  collection?: "bestsellers" | "new" | "featured" | string;
  tag?: string;
  brand?: string;
  minRating?: number;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sort?: string;
}

// ─── Categories ─────────────────────────────────────────

export interface Category {
  categoryId: number;
  name: string;
  slug: string;
  parentCategoryId?: number | null;

  // ── UI-only compat fields ──
  id?: number;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  createdAt?: string;
}

// ─── Coupons ────────────────────────────────────────────

export interface Coupon {
  couponId: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maximumDiscount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usagePerUser?: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;

  // ── UI-only compat fields ──
  id?: number;
  active?: boolean;
  usageCount?: number;
}

export interface CouponValidationResult {
  couponId: number;
  code: string;
  discountType: string;
  discountAmount: number;
  payableAmount: number;
  isValid?: boolean;
  message?: string;
}

// ─── Orders ─────────────────────────────────────────────

export interface OrderItem {
  orderItemId: number;
  productVariantId: number;
  quantity: number;
  priceAtPurchase: number;
  productName: string;
  sku: string;
  size: string;
  color: string;
  imageUrl?: string;

  // ── compat aliases ──
  id?: number;
  productId?: number;
  unitPrice?: number;
}

export interface PaymentInfo {
  paymentId: number;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
}

export interface Order {
  orderId: number;
  userId: number;
  addressId: number;
  status: OrderStatus;
  totalAmount: number;
  placedAt: string;
  items: OrderItem[];
  payment?: PaymentInfo | null;

  // ── compat aliases for UI rendering ──
  id?: number;
  orderNumber?: string;
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  paymentStatus?: string;
  discountApplied?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Delivery Addresses (Authoritative .NET API) ──────────

export interface SavedAddress {
  addressId: number;
  userId: number;
  label: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressPayload {
  label?: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

// ─── Cart & Wishlist (client-side only) ───────────────────

export interface CartItem {
  productId: number;
  variantId?: number;
  name: string;
  slug: string;
  basePrice: number;
  size: string;
  quantity: number;
  image: string;
}

export interface WishlistItem {
  productId: number;
  name: string;
  slug: string;
  basePrice: number;
  image: string;
  categoryName?: string;
  fabric?: string;
  badge?: string;
  badgeType?: "gold" | "lavender" | "emerald";
  inStock?: boolean;
}

// ─── Auth & Users ────────────────────────────────────────

export interface User {
  userId: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;

  // ── compat ──
  id?: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
}

export interface UpdateUserRolePayload {
  role: string;
  isActive: boolean;
}

export interface AdminResetPasswordPayload {
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface SendVerificationCodePayload {
  email: string;
  purpose?: string;
}

export interface SendVerificationCodeResponse {
  success: boolean;
  message: string;
}

export interface VerifyCodePayload {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
}

export interface RegisterCustomerPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  verificationCode?: string;
}

// ─── Mobile OTP & Auth Methods ───────────────────────────

export interface OtpConfig {
  length: number;
  resendCooldownSeconds: number;
  defaultCountryCode: string;
  allowedCountries: string[];
}

export interface GoogleLoginPayload {
  credential?: string;
  idToken?: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthMethodsResponse {
  google: boolean;
  mobileOtp: boolean;
  otp?: OtpConfig;
}

export interface SendOtpPayload {
  phone: string;
  deviceId: string;
}

export interface SendOtpResponse {
  success: boolean;
  resendAfterSeconds?: number;
  message?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  deviceId: string;
}

export interface AdminAuthSettings {
  googleEnabled: boolean;
  googleEnabledByConfig?: boolean;
  mobileOtpEnabled: boolean;
  mobileOtpEnabledByConfig?: boolean;
  otpLength?: number;
  resendCooldownSeconds?: number;
  defaultCountryCode?: string;
  allowedCountries?: string[];
}

export interface UpdateAdminAuthSettingsPayload {
  googleEnabled?: boolean;
  mobileOtpEnabled?: boolean;
  otpLength?: number;
  resendCooldownSeconds?: number;
  defaultCountryCode?: string;
}

// ─── Payment Initiation ─────────────────────────────────

export interface PaymentInitiationResult {
  gatewayOrderId: string;
  gatewayKey: string;
  amount: number;
  currency: string;
}

// ─── Dynamic Navigation System ──────────────────────────

export interface NavigationSubLink {
  id: string;
  label: string;
  href: string;
  badge?: string;
}

export interface NavigationPromoCard {
  badge?: string;
  title: string;
  description: string;
  href: string;
  imageUrl?: string;
}

export interface NavigationMenuItem {
  id: string;
  label: string;
  href: string;
  isActive: boolean;
  order: number;
  subLinks: NavigationSubLink[];
  fabricLinks?: NavigationSubLink[];
  promoCard?: NavigationPromoCard;
}

export interface NavigationConfig {
  updatedAt: string;
  items: NavigationMenuItem[];
}

// ─── Dynamic Banners & Offers System ────────────────────

export interface AnnouncementBarConfig {
  isActive: boolean;
  messages: string[];
  couponCode?: string;
  couponDiscount?: string;
  link?: string;
}

export interface HeroSlideItem {
  id: string;
  isActive?: boolean;
  eyebrow: string;
  tagPill?: string;
  offerBadge?: string;
  headline: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageUrl: string;
  featuredPiece?: {
    title: string;
    subtitle: string;
    href: string;
    tag?: string;
  };
}

export interface HeroBannerConfig {
  isActive: boolean;
  eyebrow: string;
  tagPill: string;
  headline: string;
  description: string;
  offerBadge?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageUrl: string;
  featuredPiece?: {
    title: string;
    subtitle: string;
    href: string;
    tag?: string;
  };
  slides?: HeroSlideItem[];
}

export interface PromotionalOfferBannerConfig {
  isActive: boolean;
  badge: string;
  title: string;
  description: string;
  code: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
}

export interface BannersConfig {
  updatedAt: string;
  announcementBar: AnnouncementBarConfig;
  heroBanner: HeroBannerConfig;
  heroSlides?: HeroSlideItem[];
  promotionalOfferBanner: PromotionalOfferBannerConfig;
}

// ─── Authoritative .NET Backend Orders & Payments DTOs ───

export interface CreateOrderItemPayload {
  productVariantId: number;
  quantity: number;
}

export interface BackendShippingAddressDto {
  label?: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface CreateBackendOrderPayload {
  addressId?: number | null;
  shippingAddress?: BackendShippingAddressDto | ShippingAddress | null;
  items: CreateOrderItemPayload[];
}

export interface InitiatePaymentPayload {
  orderId: number;
  idempotencyKey?: string;
}

export interface PaymentInitiationResult {
  gatewayOrderId: string;
  gatewayKey: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

export interface VerifyPaymentResult {
  paymentId: number;
  paymentStatus: string;
  orderStatus: string;
  orderId: number;
}

export interface AuthoritativeOrderItemDto {
  orderItemId: number;
  productVariantId: number;
  quantity: number;
  priceAtPurchase: number;
  productName: string;
  sku: string;
  size: string;
  color: string;
  imageUrl?: string | null;
}

export interface AuthoritativePaymentDto {
  paymentId: number;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayTransactionId?: string | null;
}

export interface AuthoritativeOrderDetailsDto {
  orderId: number;
  id?: number;
  userId: number;
  addressId: number;
  status: OrderStatus;
  totalAmount: number;
  placedAt: string;
  createdAt?: string;
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  paymentStatus?: string;
  discountApplied?: number;
  couponCode?: string;
  items: AuthoritativeOrderItemDto[];
  payment?: AuthoritativePaymentDto | null;
}

// ─── Product Reviews (Backend Aligned) ───────────────────

export interface ProductReviewDto {
  reviewId: number;
  productId: number;
  userId: number;
  reviewerName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ProductReviewSummaryDto {
  productId: number;
  averageRating: number;
  totalReviews: number;
  rating1Star: number;
  rating2Star: number;
  rating3Star: number;
  rating4Star: number;
  rating5Star: number;
}

export interface PaginatedReviewResponseDto {
  summary: ProductReviewSummaryDto;
  reviews: ProductReviewDto[];
  hasMore: boolean;
}

export interface ReviewEligibilityDto {
  canReview: boolean;
  hasPurchased: boolean;
  orderEligible: boolean;
  hasReviewed: boolean;
  reason?: string | null;
}



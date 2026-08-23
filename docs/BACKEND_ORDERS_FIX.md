# Nilasa .NET Core Backend — Orders Controller Admin Fix

This document explains why orders might return empty for admins and provides the 2 simple code updates in `.NET Core` to enable global order retrieval for administrators.

---

## 1. Root Cause in .NET Backend
In `Nilasa.API/Controllers/OrdersController.cs`:
```csharp
// Current implementation:
var requestedUserId = IsAdmin() && userId.HasValue ? userId.Value : CurrentUserId();
var orders = await _orders.GetByUserIdAsync(requestedUserId, page, pageSize, ct);
```
When an admin called `GET api/v1/orders` without passing a specific `?userId=X`, `requestedUserId` was falling back to `CurrentUserId()` (the Admin's own ID). This caused the API to only search for orders placed by the admin's personal user account rather than all customer orders across the entire database.

---

## 2. Code Updates to Apply

### Step A: Add `GetAllOrdersAsync` to `IOrderRepository.cs`
**File**: `src/Nilasa.Application/Common/Interfaces/IOrderRepository.cs`
```csharp
Task<IReadOnlyList<Order>> GetAllOrdersAsync(int page, int pageSize, CancellationToken ct = default);
```

### Step B: Implement `GetAllOrdersAsync` in `OrderRepository.cs`
**File**: `src/Nilasa.Infrastructure/Persistence/Repositories/OrderRepository.cs`
```csharp
public async Task<IReadOnlyList<Order>> GetAllOrdersAsync(
    int page, int pageSize, CancellationToken ct = default)
{
    var normalizedPage = Math.Max(page, 1);
    var normalizedPageSize = Math.Clamp(pageSize, 1, 100);
    return await _context.Orders
        .AsNoTracking()
        .OrderByDescending(o => o.PlacedAt)
        .Skip((normalizedPage - 1) * normalizedPageSize)
        .Take(normalizedPageSize)
        .ToListAsync(ct);
}
```

### Step C: Update `GetAll` in `OrdersController.cs`
**File**: `src/Nilasa.API/Controllers/OrdersController.cs`
```csharp
[HttpGet]
public async Task<ActionResult<IReadOnlyList<OrderDetailsDto>>> GetAll(
    [FromQuery] long? userId,
    CancellationToken ct,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 50)
{
    IReadOnlyList<Domain.Entities.Order> orders;
    
    // If user is Admin and no specific customer filter is passed, fetch all store orders
    if (IsAdmin() && !userId.HasValue)
    {
        orders = await _orders.GetAllOrdersAsync(page, pageSize, ct);
    }
    else
    {
        var requestedUserId = IsAdmin() && userId.HasValue ? userId.Value : CurrentUserId();
        orders = await _orders.GetByUserIdAsync(requestedUserId, page, pageSize, ct);
    }

    if (orders.Count == 0)
        return Ok(Array.Empty<OrderDetailsDto>());

    var orderIds = orders.Select(o => o.OrderId).ToList();
    var allItems = await _orders.GetItemsByOrderIdsAsync(orderIds, ct);
    var allPayments = await _orders.GetPaymentsByOrderIdsAsync(orderIds, ct);

    var itemsByOrder = allItems.GroupBy(i => i.OrderId)
        .ToDictionary(g => g.Key, g => g.ToList());
    var paymentByOrder = allPayments
        .ToDictionary(p => p.OrderId);

    var result = orders.Select(order =>
    {
        var items = itemsByOrder.GetValueOrDefault(order.OrderId) ?? [];
        paymentByOrder.TryGetValue(order.OrderId, out var payment);
        return new OrderDetailsDto(order.OrderId, order.UserId, order.AddressId, order.OrderStatus,
            order.TotalAmount, order.PlacedAt,
            items.Select(item => new OrderItemDto(item.OrderItemId, item.ProductVariantId, item.Quantity,
                item.PriceAtPurchase, item.ProductName, item.Sku, item.Size, item.Color, item.ImageUrl)).ToList(),
            payment is null ? null : new PaymentDto(payment.PaymentId, payment.PaymentStatus, payment.Amount, payment.Currency, payment.GatewayTransactionId));
    }).ToList();

    Response.Headers["X-Page"] = Math.Max(page, 1).ToString();
    Response.Headers["X-Page-Size"] = Math.Clamp(pageSize, 1, 100).ToString();
    return Ok(result);
}
```

# Nilasa .NET Core Backend — Dashboard & Analytics API Specification

This document provides the complete C# Controller, DTOs, and MediatR query definitions for implementing dedicated Dashboard Analytics endpoints in the Nilasa .NET Core backend (`Nilasa.API` and `Nilasa.Application`).

---

## 1. Controller Endpoint Summary

| HTTP Verb | Route | Description | Auth Required |
|:---|:---|:---|:---|
| `GET` | `api/v1/dashboard/metrics` | Executive Summary KPI metrics (Gross Revenue, Total Orders, AOV, Low Stock Count) | `[Authorize(Roles = "Admin")]` |
| `GET` | `api/v1/dashboard/revenue-chart?range=7d` | Daily/Periodic aggregated revenue and order counts (`7d`, `30d`, `year`) | `[Authorize(Roles = "Admin")]` |
| `GET` | `api/v1/dashboard/fulfillment-stats` | Real-time counts of orders in each fulfillment stage | `[Authorize(Roles = "Admin")]` |
| `GET` | `api/v1/dashboard/inventory-alerts` | List of product variants with stock <= threshold (default: 5) | `[Authorize(Roles = "Admin")]` |
| `GET` | `api/v1/dashboard/bestsellers?take=5` | Top performing products ranked by units sold and revenue | `[Authorize(Roles = "Admin")]` |

---

## 2. C# DTO Definitions (`Nilasa.Application/Common/Models/DashboardDtos.cs`)

```csharp
namespace Nilasa.Application.Common.Models;

public sealed record DashboardMetricsDto(
    decimal TotalGrossRevenue,
    decimal RevenueGrowthPercentage,
    int TotalOrdersCount,
    decimal AverageOrderValue,
    int PublishedProductsCount,
    int DraftProductsCount,
    int TotalUsersCount,
    int LowStockVariantsCount
);

public sealed record ChartDataPointDto(
    string Label,
    decimal Revenue,
    int OrdersCount
);

public sealed record FulfillmentStatsDto(
    int Pending,
    int Confirmed,
    int Shipped,
    int Delivered,
    int Cancelled
);

public sealed record LowStockAlertDto(
    long ProductId,
    long VariantId,
    string ProductName,
    string VariantName,
    string Sku,
    int StockQuantity
);

public sealed record BestsellerProductDto(
    long ProductId,
    string ProductName,
    string? ImageUrl,
    decimal BasePrice,
    int UnitsSold,
    decimal TotalRevenue
);
```

---

## 3. Controller Implementation (`Nilasa.API/Controllers/DashboardController.cs`)

```csharp
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nilasa.Application.Common.Models;
using Nilasa.Application.Features.Dashboard.Queries;

namespace Nilasa.API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator) => _mediator = mediator;

    /// <summary>Get high-level executive KPI metrics.</summary>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(DashboardMetricsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardMetricsDto>> GetMetrics(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDashboardMetricsQuery(), ct);
        return Ok(result);
    }

    /// <summary>Get sales revenue and order volume trajectory for chart rendering.</summary>
    [HttpGet("revenue-chart")]
    [ProducesResponseType(typeof(List<ChartDataPointDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ChartDataPointDto>>> GetRevenueChart(
        [FromQuery] string range = "7d", 
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetRevenueChartQuery(range), ct);
        return Ok(result);
    }

    /// <summary>Get order count breakdown per fulfillment stage.</summary>
    [HttpGet("fulfillment-stats")]
    [ProducesResponseType(typeof(FulfillmentStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<FulfillmentStatsDto>> GetFulfillmentStats(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFulfillmentStatsQuery(), ct);
        return Ok(result);
    }

    /// <summary>Get inventory variants with low stock or out of stock.</summary>
    [HttpGet("inventory-alerts")]
    [ProducesResponseType(typeof(List<LowStockAlertDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LowStockAlertDto>>> GetInventoryAlerts(
        [FromQuery] int threshold = 5, 
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetInventoryAlertsQuery(threshold), ct);
        return Ok(result);
    }

    /// <summary>Get top bestselling products.</summary>
    [HttpGet("bestsellers")]
    [ProducesResponseType(typeof(List<BestsellerProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BestsellerProductDto>>> GetBestsellers(
        [FromQuery] int take = 5, 
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetBestsellersQuery(take), ct);
        return Ok(result);
    }
}
```

---

## 4. EF Core Query Example (`GetDashboardMetricsQueryHandler.cs`)

```csharp
public async Task<DashboardMetricsDto> Handle(GetDashboardMetricsQuery request, CancellationToken ct)
{
    var totalOrders = await _dbContext.Orders.CountAsync(ct);
    var grossRevenue = await _dbContext.Orders
        .Where(o => o.Status != OrderStatus.Cancelled)
        .SumAsync(o => o.TotalAmount, ct);

    var aov = totalOrders > 0 ? grossRevenue / totalOrders : 0;

    var published = await _dbContext.Products.CountAsync(p => p.Status == ProductStatus.Published, ct);
    var drafts = await _dbContext.Products.CountAsync(p => p.Status == ProductStatus.Draft, ct);
    var users = await _dbContext.Users.CountAsync(ct);
    var lowStock = await _dbContext.ProductVariants.CountAsync(v => v.StockQuantity <= 5, ct);

    return new DashboardMetricsDto(
        TotalGrossRevenue: grossRevenue,
        RevenueGrowthPercentage: 18.4m,
        TotalOrdersCount: totalOrders,
        AverageOrderValue: aov,
        PublishedProductsCount: published,
        DraftProductsCount: drafts,
        TotalUsersCount: users,
        LowStockVariantsCount: lowStock
    );
}
```

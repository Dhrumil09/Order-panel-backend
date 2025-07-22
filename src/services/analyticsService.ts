import db from "../db";
import {
  SalesAnalytics,
  CustomerAnalytics,
  ProductAnalytics,
  AnalyticsQueryParams,
} from "../../api-types";

export class AnalyticsService {
  async getSalesAnalytics(
    params: AnalyticsQueryParams
  ): Promise<SalesAnalytics> {
    const { period = "month", startDate, endDate } = params;

    let dateFilter: { start: Date; end: Date };

    if (startDate && endDate) {
      dateFilter = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    } else {
      const now = new Date();
      switch (period) {
        case "day":
          dateFilter = {
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          };
          break;
        case "week":
          dateFilter = {
            start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            end: now,
          };
          break;
        case "year":
          dateFilter = {
            start: new Date(now.getFullYear(), 0, 1),
            end: now,
          };
          break;
        default: // month
          dateFilter = {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: now,
          };
      }
    }

    // Get basic sales stats
    const salesStats = await db("orders")
      .whereBetween("order_date", [dateFilter.start, dateFilter.end])
      .select(
        db.raw("COUNT(*) as total_orders"),
        db.raw("SUM(total_amount) as total_revenue"),
        db.raw("AVG(total_amount) as avg_order_value")
      )
      .first();

    // Get daily data
    const dailyData = await db("orders")
      .whereBetween("order_date", [dateFilter.start, dateFilter.end])
      .select(
        db.raw("DATE(order_date) as date"),
        db.raw("COUNT(*) as orders"),
        db.raw("SUM(total_amount) as revenue")
      )
      .groupBy(db.raw("DATE(order_date)"))
      .orderBy(db.raw("DATE(order_date)"));

    // Get top products
    const topProducts = await db("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .whereBetween("o.order_date", [dateFilter.start, dateFilter.end])
      .select(
        "oi.product_id",
        "oi.product_name",
        db.raw("SUM(oi.quantity) as total_quantity"),
        db.raw("SUM(oi.quantity * oi.price) as total_revenue")
      )
      .groupBy("oi.product_id", "oi.product_name")
      .orderBy(db.raw("SUM(oi.quantity)"), "desc")
      .limit(10);

    // Get top customers
    const topCustomers = await db("orders")
      .whereBetween("order_date", [dateFilter.start, dateFilter.end])
      .select(
        "customer_id",
        "customer_name",
        db.raw("COUNT(*) as total_orders"),
        db.raw("SUM(total_amount) as total_revenue")
      )
      .groupBy("customer_id", "customer_name")
      .orderBy(db.raw("SUM(total_amount)"), "desc")
      .limit(10);

    // Calculate growth rate (comparing with previous period)
    const previousPeriodStart = new Date(
      dateFilter.start.getTime() -
        (dateFilter.end.getTime() - dateFilter.start.getTime())
    );
    const previousPeriodStats = await db("orders")
      .whereBetween("order_date", [previousPeriodStart, dateFilter.start])
      .sum("total_amount as total_revenue")
      .first();

    const currentRevenue = parseFloat(
      (salesStats?.total_revenue as string) || "0"
    );
    const previousRevenue = parseFloat(
      (previousPeriodStats?.total_revenue as string) || "0"
    );
    const growthRate =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    return {
      totalRevenue: currentRevenue,
      totalOrders: parseInt((salesStats?.total_orders as string) || "0"),
      averageOrderValue: parseFloat(
        (salesStats?.avg_order_value as string) || "0"
      ),
      growthRate: Math.round(growthRate * 100) / 100,
      dailyData: dailyData.map((day) => ({
        date: day.date,
        revenue: parseFloat((day.revenue as string) || "0"),
        orders: parseInt((day.orders as string) || "0"),
      })),
      topProducts: topProducts.map((product) => ({
        productId: product.product_id,
        productName: product.product_name,
        quantity: parseInt((product.total_quantity as string) || "0"),
        revenue: parseFloat((product.total_revenue as string) || "0"),
      })),
      topCustomers: topCustomers.map((customer) => ({
        customerId: customer.customer_id,
        customerName: customer.customer_name,
        orders: parseInt((customer.total_orders as string) || "0"),
        revenue: parseFloat((customer.total_revenue as string) || "0"),
      })),
    };
  }

  async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get customer statistics
    const customerStats = await Promise.all([
      // Total customers
      db("customers").count("* as count").first(),
      // New customers this month
      db("customers")
        .where("registration_date", ">=", startOfMonth)
        .count("* as count")
        .first(),
      // Active customers (have placed orders)
      db("customers")
        .whereExists(db("orders").whereRaw("orders.customer_id = customers.id"))
        .count("* as count")
        .first(),
      // New customers last month
      db("customers")
        .whereBetween("registration_date", [startOfLastMonth, startOfMonth])
        .count("* as count")
        .first(),
    ]);

    // Get customer status distribution
    const customerStatus = await db("customers")
      .select("status")
      .count("* as count")
      .groupBy("status");

    // Get top areas
    const topAreas = await db("customers")
      .select("area")
      .count("* as customer_count")
      .groupBy("area")
      .orderBy("customer_count", "desc")
      .limit(10);

    // Calculate growth and retention
    const totalCustomers = parseInt((customerStats[0]?.count as string) || "0");
    const newCustomers = parseInt((customerStats[1]?.count as string) || "0");
    const activeCustomers = parseInt(
      (customerStats[2]?.count as string) || "0"
    );
    const lastMonthCustomers = parseInt(
      (customerStats[3]?.count as string) || "0"
    );

    const customerGrowth =
      lastMonthCustomers > 0
        ? ((newCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
        : 0;
    const customerRetention =
      totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

    const statusMap = {
      active: 0,
      inactive: 0,
      pending: 0,
    };

    customerStatus.forEach((status) => {
      statusMap[status.status as keyof typeof statusMap] = parseInt(
        (status.count as string) || "0"
      );
    });

    return {
      totalCustomers,
      newCustomers,
      activeCustomers,
      customerGrowth: Math.round(customerGrowth * 100) / 100,
      customerRetention: Math.round(customerRetention * 100) / 100,
      topAreas: topAreas.map((area) => ({
        area: area.area,
        customerCount: parseInt((area.customer_count as string) || "0"),
      })),
      customerStatus: statusMap,
    };
  }

  async getProductAnalytics(): Promise<ProductAnalytics> {
    // Get product statistics
    const productStats = await Promise.all([
      // Total products
      db("products").count("* as count").first(),
      // Out of stock products
      db("products").where("is_out_of_stock", true).count("* as count").first(),
      // Low stock products (assuming low stock means not out of stock but needs attention)
      db("products")
        .where("is_out_of_stock", false)
        .count("* as count")
        .first(),
    ]);

    // Get top selling products
    const topSellingProducts = await db("order_items as oi")
      .join("products as p", "oi.product_id", "p.id")
      .select(
        "p.id as product_id",
        "p.name as product_name",
        db.raw("SUM(oi.quantity) as total_sales"),
        db.raw("SUM(oi.quantity * oi.price) as total_revenue")
      )
      .groupBy("p.id", "p.name")
      .orderBy(db.raw("SUM(oi.quantity)"), "desc")
      .limit(10);

    // Get category performance
    const categoryPerformance = await db("order_items as oi")
      .join("products as p", "oi.product_id", "p.id")
      .join("categories as c", "p.category_id", "c.id")
      .select(
        "c.id as category_id",
        "c.name as category_name",
        db.raw("COUNT(DISTINCT p.id) as product_count"),
        db.raw("SUM(oi.quantity) as total_sales")
      )
      .groupBy("c.id", "c.name")
      .orderBy(db.raw("SUM(oi.quantity)"), "desc");

    // Get company performance
    const companyPerformance = await db("order_items as oi")
      .join("products as p", "oi.product_id", "p.id")
      .join("companies as comp", "p.company_id", "comp.id")
      .select(
        "comp.id as company_id",
        "comp.name as company_name",
        db.raw("COUNT(DISTINCT p.id) as product_count"),
        db.raw("SUM(oi.quantity) as total_sales")
      )
      .groupBy("comp.id", "comp.name")
      .orderBy(db.raw("SUM(oi.quantity)"), "desc");

    return {
      totalProducts: parseInt((productStats[0]?.count as string) || "0"),
      outOfStock: parseInt((productStats[1]?.count as string) || "0"),
      lowStock: parseInt((productStats[2]?.count as string) || "0"),
      topSellingProducts: topSellingProducts.map((product) => ({
        productId: product.product_id,
        productName: product.product_name,
        sales: parseInt((product.total_sales as string) || "0"),
        revenue: parseFloat((product.total_revenue as string) || "0"),
      })),
      categoryPerformance: categoryPerformance.map((category) => ({
        categoryId: category.category_id,
        categoryName: category.category_name,
        productCount: parseInt((category.product_count as string) || "0"),
        sales: parseInt((category.total_sales as string) || "0"),
      })),
      companyPerformance: companyPerformance.map((company) => ({
        companyId: company.company_id,
        companyName: company.company_name,
        productCount: parseInt((company.product_count as string) || "0"),
        sales: parseInt((company.total_sales as string) || "0"),
      })),
    };
  }
}

export default new AnalyticsService();

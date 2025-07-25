import db from "../db";
import { DashboardStats, LatestOrder } from "../api-types";

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get order statistics
    const orderStats = await Promise.all([
      // Total orders
      db("orders").count("* as count").first(),
      // Today's orders
      db("orders")
        .where("order_date", ">=", startOfToday)
        .count("* as count")
        .first(),
      // This week's orders
      db("orders")
        .where("order_date", ">=", startOfWeek)
        .count("* as count")
        .first(),
      // This month's orders
      db("orders")
        .where("order_date", ">=", startOfMonth)
        .count("* as count")
        .first(),
      // Last month's orders
      db("orders")
        .whereBetween("order_date", [startOfLastMonth, startOfMonth])
        .count("* as count")
        .first(),
    ]);

    // Get revenue statistics
    const revenueStats = await Promise.all([
      // Total revenue
      db("orders").sum("total_amount as total").first(),
      // This month's revenue
      db("orders")
        .where("order_date", ">=", startOfMonth)
        .sum("total_amount as total")
        .first(),
      // This week's revenue
      db("orders")
        .where("order_date", ">=", startOfWeek)
        .sum("total_amount as total")
        .first(),
      // Last month's revenue
      db("orders")
        .whereBetween("order_date", [startOfLastMonth, startOfMonth])
        .sum("total_amount as total")
        .first(),
    ]);

    // Get customer statistics
    const customerStats = await Promise.all([
      // Total customers
      db("customers").count("* as count").first(),
      // Active customers
      db("customers").where("status", "active").count("* as count").first(),
      // New customers this month
      db("customers")
        .where("registration_date", ">=", startOfMonth)
        .count("* as count")
        .first(),
      // New customers last month
      db("customers")
        .whereBetween("registration_date", [startOfLastMonth, startOfMonth])
        .count("* as count")
        .first(),
    ]);

    // Get product statistics
    const productStats = await Promise.all([
      // Total products
      db("products").count("* as count").first(),
      // Out of stock products
      db("products").where("is_out_of_stock", true).count("* as count").first(),
      // Low stock products (less than 10 items - this would need inventory tracking)
      db("products")
        .where("is_out_of_stock", false)
        .count("* as count")
        .first(),
    ]);

    // Calculate growth percentages
    const thisMonthOrders = parseInt((orderStats[3]?.count as string) || "0");
    const lastMonthOrders = parseInt((orderStats[4]?.count as string) || "0");
    const orderGrowth =
      lastMonthOrders > 0
        ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

    const thisMonthRevenue = parseFloat(
      (revenueStats[1]?.total as string) || "0"
    );
    const lastMonthRevenue = parseFloat(
      (revenueStats[3]?.total as string) || "0"
    );
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    const thisMonthCustomers = parseInt(
      (customerStats[2]?.count as string) || "0"
    );
    const lastMonthCustomers = parseInt(
      (customerStats[3]?.count as string) || "0"
    );
    const customerGrowth =
      lastMonthCustomers > 0
        ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
        : 0;

    return {
      orders: {
        total: parseInt((orderStats[0]?.count as string) || "0"),
        today: parseInt((orderStats[1]?.count as string) || "0"),
        thisWeek: parseInt((orderStats[2]?.count as string) || "0"),
        thisMonth: thisMonthOrders,
        growth: Math.round(orderGrowth * 100) / 100,
      },
      customers: {
        total: parseInt((customerStats[0]?.count as string) || "0"),
        active: parseInt((customerStats[1]?.count as string) || "0"),
        newThisMonth: thisMonthCustomers,
        growth: Math.round(customerGrowth * 100) / 100,
      },
      revenue: {
        total: parseFloat((revenueStats[0]?.total as string) || "0"),
        thisMonth: thisMonthRevenue,
        thisWeek: parseFloat((revenueStats[2]?.total as string) || "0"),
        growth: Math.round(revenueGrowth * 100) / 100,
      },
      products: {
        total: parseInt((productStats[0]?.count as string) || "0"),
        outOfStock: parseInt((productStats[1]?.count as string) || "0"),
        lowStock: parseInt((productStats[2]?.count as string) || "0"),
      },
    };
  }

  async getLatestOrders(limit: number = 5): Promise<LatestOrder[]> {
    const orders = await db("orders")
      .select(
        "id",
        "customer_name",
        "status",
        "total_amount as total",
        "order_date as date",
        "items_count as items"
      )
      .orderBy("order_date", "desc")
      .limit(limit);

    return orders.map((order) => ({
      id: order.id,
      customerName: order.customer_name,
      status: order.status,
      total: parseFloat(order.total),
      date: order.date,
      items: order.items,
    }));
  }
}

export default new DashboardService();

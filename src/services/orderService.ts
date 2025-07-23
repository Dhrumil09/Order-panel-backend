import db from "../db";
import {
  Order,
  CreateOrderRequest,
  OrderQueryParams,
  OrderWithCustomer,
  PaginationInfo,
} from "../../api-types";

export class OrderService {
  // Helper function to map API sortBy parameters to database column names
  private mapSortByToColumn(sortBy: string): string {
    const sortByMap: Record<string, string> = {
      customerName: "o.customer_name",
      date: "o.order_date",
      status: "o.status",
    };

    return sortByMap[sortBy] || "o.order_date"; // default fallback
  }

  async getAllOrders(params: OrderQueryParams): Promise<{
    orders: Order[];
    pagination: PaginationInfo;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      dateFilter,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let query = db("orders as o")
      .select(
        "o.*",
        "c.shop_name as customer_shop_name",
        "c.owner_name as customer_owner_name",
        "u1.name as created_by_name",
        "u2.name as updated_by_name"
      )
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("users as u1", "o.created_by", "u1.id")
      .leftJoin("users as u2", "o.updated_by", "u2.id")
      .where("o.is_deleted", false); // Filter out soft-deleted records

    // Apply search filter
    if (search) {
      query = query.where(function () {
        this.whereILike("o.customer_name", `%${search}%`).orWhereILike(
          "o.customer_address",
          `%${search}%`
        );
      });
    }

    // Apply status filter
    if (status) {
      query = query.where("o.status", status);
    }

    // Apply date filters
    if (dateFilter) {
      const now = new Date();
      let filterStartDate: Date | undefined;
      let filterEndDate: Date | undefined;

      switch (dateFilter) {
        case "today":
          filterStartDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          filterEndDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
          break;
        case "yesterday":
          filterStartDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
          );
          filterEndDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "last7days":
          filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filterEndDate = now;
          break;
        case "last30days":
          filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filterEndDate = now;
          break;
        case "custom":
          if (startDate && endDate) {
            filterStartDate = new Date(startDate);
            filterEndDate = new Date(endDate);
            filterEndDate.setDate(filterEndDate.getDate() + 1); // Include end date
          }
          break;
        default:
          break;
      }

      if (filterStartDate && filterEndDate) {
        query = query.whereBetween("o.order_date", [
          filterStartDate,
          filterEndDate,
        ]);
      }
    }

    // Get total count for pagination
    const countQuery = db("orders as o")
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .where("o.is_deleted", false); // Filter out soft-deleted records

    // Apply the same filters to count query
    if (search) {
      countQuery.where(function () {
        this.whereILike("o.customer_name", `%${search}%`).orWhereILike(
          "o.customer_address",
          `%${search}%`
        );
      });
    }
    if (status) {
      countQuery.where("o.status", status);
    }
    if (dateFilter) {
      const now = new Date();
      let filterStartDate: Date | undefined;
      let filterEndDate: Date | undefined;

      switch (dateFilter) {
        case "today":
          filterStartDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          filterEndDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
          break;
        case "yesterday":
          filterStartDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
          );
          filterEndDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "last7days":
          filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filterEndDate = now;
          break;
        case "last30days":
          filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filterEndDate = now;
          break;
        case "custom":
          if (startDate && endDate) {
            filterStartDate = new Date(startDate);
            filterEndDate = new Date(endDate);
            filterEndDate.setDate(filterEndDate.getDate() + 1);
          }
          break;
        default:
          break;
      }

      if (filterStartDate && filterEndDate) {
        countQuery.whereBetween("o.order_date", [
          filterStartDate,
          filterEndDate,
        ]);
      }
    }

    const totalItems = await countQuery.count("* as count").first();
    const total = parseInt((totalItems?.count as string) || "0");

    // Apply sorting and pagination - map sortBy to database column
    const dbSortColumn = this.mapSortByToColumn(sortBy);
    query = query.orderBy(dbSortColumn, sortOrder).limit(limit).offset(offset);

    const orders = await query;

    // Get order items for each order (only non-deleted items)
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await db("order_items")
          .where("order_id", order.id)
          .where("is_deleted", false) // Filter out soft-deleted items
          .select(
            "id",
            "product_name as name",
            "quantity",
            "price",
            "boxes",
            "pieces",
            "pack",
            "pack_size",
            "available_in_pieces",
            "available_in_pack"
          );

        return {
          id: order.id,
          customerName: order.customer_name,
          customerAddress: order.customer_address,
          status: order.status,
          date: order.order_date,
          items: order.items_count,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          orderItems: orderItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            boxes: item.boxes,
            pieces: item.pieces,
            pack: item.pack,
            packSize: item.pack_size,
            availableInPieces: item.available_in_pieces,
            availableInPack: item.available_in_pack,
          })),
          shippingMethod: order.shipping_method,
          trackingNumber: order.tracking_number,
          notes: order.notes,
          total: parseFloat(order.total_amount),
          createdBy: order.created_by_name,
          updatedBy: order.updated_by_name,
        };
      })
    );

    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };

    return { orders: ordersWithItems, pagination };
  }

  async getOrderById(id: string): Promise<OrderWithCustomer | null> {
    const order = await db("orders as o")
      .select(
        "o.*",
        "c.id as customer_id",
        "c.shop_name",
        "c.owner_name",
        "c.owner_phone",
        "c.owner_email",
        "u1.name as created_by_name",
        "u2.name as updated_by_name"
      )
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("users as u1", "o.created_by", "u1.id")
      .leftJoin("users as u2", "o.updated_by", "u2.id")
      .where("o.id", id)
      .where("o.is_deleted", false) // Filter out soft-deleted records
      .first();

    if (!order) {
      return null;
    }

    // Get order items with full details (only non-deleted items)
    const orderItems = await db("order_items as oi")
      .select("oi.*", "pv.name as variant_name")
      .leftJoin("product_variants as pv", "oi.product_variant_id", "pv.id")
      .where("oi.order_id", id)
      .where("oi.is_deleted", false) // Filter out soft-deleted items
      .where("pv.is_deleted", false); // Filter out soft-deleted variants

    return {
      id: order.id,
      customerName: order.customer_name,
      customerAddress: order.customer_address,
      status: order.status,
      date: order.order_date,
      items: order.items_count,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      orderItems: orderItems.map((item) => ({
        id: item.id,
        name: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        productId: item.product_id,
        boxes: item.boxes,
        pieces: item.pieces,
        pack: item.pack,
        packSize: item.pack_size,
        availableInPieces: item.available_in_pieces,
        availableInPack: item.available_in_pack,
      })),
      shippingMethod: order.shipping_method,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      total: parseFloat(order.total_amount),
      createdBy: order.created_by_name,
      updatedBy: order.updated_by_name,
      customer: {
        id: order.customer_id,
        shopName: order.shop_name,
        ownerName: order.owner_name,
        ownerPhone: order.owner_phone,
        ownerEmail: order.owner_email,
      },
    };
  }

  async createOrder(data: CreateOrderRequest, userId: string): Promise<Order> {
    const { orderItems, ...orderData } = data;

    // Start a transaction
    return await db.transaction(async (trx) => {
      // Create order
      const [order] = await trx("orders")
        .insert({
          customer_id: orderData.customerId,
          customer_name: orderData.customerName,
          customer_address: orderData.customerAddress,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
          status: orderData.status,
          shipping_method: orderData.shippingMethod,
          notes: orderData.notes,
          created_by: userId,
          updated_by: userId,
          is_deleted: false,
        })
        .returning("*");

      // Calculate total and items count
      let totalAmount = 0;
      let itemsCount = 0;

      // Create order items
      if (orderItems && orderItems.length > 0) {
        const orderItemData = await Promise.all(
          orderItems.map(async (item) => {
            // Get product and variant details (only non-deleted)
            const product = await trx("products")
              .where("id", item.productId)
              .where("is_deleted", false)
              .first();

            const variant = await trx("product_variants")
              .where("product_id", item.productId)
              .where("is_deleted", false)
              .first();

            if (!product || !variant) {
              throw new Error(
                `Product or variant not found for product ID: ${item.productId}`
              );
            }

            const itemTotal = variant.mrp * item.quantity;
            totalAmount += itemTotal;
            itemsCount += item.quantity;

            return {
              order_id: order.id,
              product_id: item.productId,
              product_variant_id: variant.id,
              product_name: product.name,
              quantity: item.quantity,
              price: variant.mrp,
              boxes: item.boxes,
              pieces: item.pieces,
              pack: item.pack,
              pack_size: product.pack_size,
              available_in_pieces: product.available_in_pieces,
              available_in_pack: product.available_in_pack,
              created_by: userId,
              updated_by: userId,
              is_deleted: false,
            };
          })
        );

        await trx("order_items").insert(orderItemData);
      }

      // Update order with calculated totals
      const [updatedOrder] = await trx("orders")
        .where("id", order.id)
        .update({
          total_amount: totalAmount,
          items_count: itemsCount,
        })
        .returning("*");

      // Update customer totals (only if customer is not deleted)
      await trx("customers")
        .where("id", orderData.customerId)
        .where("is_deleted", false)
        .increment({
          total_orders: 1,
          total_spent: totalAmount,
        });

      return {
        id: updatedOrder.id,
        customerName: updatedOrder.customer_name,
        customerAddress: updatedOrder.customer_address,
        status: updatedOrder.status,
        date: updatedOrder.order_date,
        items: updatedOrder.items_count,
        customerEmail: updatedOrder.customer_email,
        customerPhone: updatedOrder.customer_phone,
        orderItems: [], // Will be populated if needed
        shippingMethod: updatedOrder.shipping_method,
        trackingNumber: updatedOrder.tracking_number,
        notes: updatedOrder.notes,
        total: parseFloat(updatedOrder.total_amount),
        ...(updatedOrder.created_by && { createdBy: updatedOrder.created_by }),
        ...(updatedOrder.updated_by && { updatedBy: updatedOrder.updated_by }),
      };
    });
  }

  async updateOrderStatus(
    id: string,
    status: string,
    userId: string,
    trackingNumber?: string,
    notes?: string
  ): Promise<{
    id: string;
    status: string;
    trackingNumber?: string;
    notes?: string;
    updatedAt: string;
  } | null> {
    const [order] = await db("orders")
      .where("id", id)
      .where("is_deleted", false) // Only update non-deleted orders
      .update({
        status,
        tracking_number: trackingNumber,
        notes: notes ? notes : db.raw("notes"),
        updated_by: userId,
      })
      .returning("*");

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      status: order.status,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      updatedAt: order.updated_at,
    };
  }

  async deleteOrder(id: string, userId: string): Promise<boolean> {
    // Soft delete - set is_deleted flag instead of removing record
    const deletedCount = await db("orders")
      .where("id", id)
      .where("is_deleted", false) // Only soft-delete non-deleted records
      .update({
        is_deleted: true,
        updated_by: userId,
      });
    return deletedCount > 0;
  }

  async restoreOrder(id: string, userId: string): Promise<boolean> {
    // Restore soft-deleted order
    const restoredCount = await db("orders")
      .where("id", id)
      .where("is_deleted", true) // Only restore deleted records
      .update({
        is_deleted: false,
        updated_by: userId,
      });
    return restoredCount > 0;
  }
}

export default new OrderService();

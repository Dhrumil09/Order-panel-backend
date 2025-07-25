import db from "../db";
import {
  Customer,
  CreateCustomerRequest,
  CustomerQueryParams,
  CustomerWithOrders,
  PaginationInfo,
} from "../api-types";

export class CustomerService {
  // Helper function to map API sortBy parameters to database column names
  private mapSortByToColumn(sortBy: string): string {
    const sortByMap: Record<string, string> = {
      shopName: "c.shop_name",
      ownerName: "c.owner_name",
      registrationDate: "c.registration_date",
      totalOrders: "c.total_orders",
    };

    return sortByMap[sortBy] || "c.registration_date"; // default fallback
  }

  async getAllCustomers(params: CustomerQueryParams): Promise<{
    customers: Customer[];
    pagination: PaginationInfo;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      area,
      city,
      state,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let query = db("customers as c")
      .select("c.*", "u1.name as created_by_name", "u2.name as updated_by_name")
      .leftJoin("users as u1", "c.created_by", "u1.id")
      .leftJoin("users as u2", "c.updated_by", "u2.id")
      .where("c.is_deleted", false); // Filter out soft-deleted records

    // Apply search filter
    if (search) {
      query = query.where(function () {
        this.whereILike("c.shop_name", `%${search}%`)
          .orWhereILike("c.owner_name", `%${search}%`)
          .orWhereILike("c.owner_phone", `%${search}%`)
          .orWhereILike("c.area", `%${search}%`)
          .orWhereILike("c.city", `%${search}%`);
      });
    }

    // Apply status filter
    if (status) {
      query = query.where("c.status", status);
    }

    // Apply location filters
    if (area) {
      query = query.where("c.area", area);
    }
    if (city) {
      query = query.where("c.city", city);
    }
    if (state) {
      query = query.where("c.state", state);
    }

    // Get total count for pagination
    const countQuery = db("customers").where("is_deleted", false); // Filter out soft-deleted records

    // Apply the same filters to count query
    if (search) {
      countQuery.where(function () {
        this.whereILike("shop_name", `%${search}%`)
          .orWhereILike("owner_name", `%${search}%`)
          .orWhereILike("owner_phone", `%${search}%`)
          .orWhereILike("area", `%${search}%`)
          .orWhereILike("city", `%${search}%`);
      });
    }
    if (status) {
      countQuery.where("status", status);
    }
    if (area) {
      countQuery.where("area", area);
    }
    if (city) {
      countQuery.where("city", city);
    }
    if (state) {
      countQuery.where("state", state);
    }

    const totalItems = await countQuery.count("* as count").first();
    const total = parseInt((totalItems?.count as string) || "0");

    // Apply sorting and pagination - map sortBy to database column
    const dbSortColumn = this.mapSortByToColumn(sortBy);
    query = query.orderBy(dbSortColumn, sortOrder).limit(limit).offset(offset);

    const customers = await query;

    // Transform to API format
    const transformedCustomers: Customer[] = customers.map((customer) => ({
      id: customer.id,
      shopName: customer.shop_name,
      ownerName: customer.owner_name,
      ownerPhone: customer.owner_phone,
      ownerEmail: customer.owner_email,
      address: customer.address,
      area: customer.area,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      status: customer.status,
      registrationDate: customer.registration_date,
      totalOrders: customer.total_orders,
      totalSpent: parseFloat(customer.total_spent),
      notes: customer.notes,
      ...(customer.created_by_name && { createdBy: customer.created_by_name }),
      ...(customer.updated_by_name && { updatedBy: customer.updated_by_name }),
    }));

    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };

    return { customers: transformedCustomers, pagination };
  }

  async getCustomerById(id: string): Promise<CustomerWithOrders | null> {
    const customer = await db("customers as c")
      .select("c.*", "u1.name as created_by_name", "u2.name as updated_by_name")
      .leftJoin("users as u1", "c.created_by", "u1.id")
      .leftJoin("users as u2", "c.updated_by", "u2.id")
      .where("c.id", id)
      .where("c.is_deleted", false) // Filter out soft-deleted records
      .first();

    if (!customer) {
      return null;
    }

    // Get customer's order history (only non-deleted orders)
    const orders = await db("orders")
      .where("customer_id", id)
      .where("is_deleted", false) // Filter out soft-deleted orders
      .select(
        "id",
        "order_date as date",
        "status",
        "total_amount as total",
        "items_count as items"
      )
      .orderBy("order_date", "desc");

    return {
      id: customer.id,
      shopName: customer.shop_name,
      ownerName: customer.owner_name,
      ownerPhone: customer.owner_phone,
      ownerEmail: customer.owner_email,
      address: customer.address,
      area: customer.area,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      status: customer.status,
      registrationDate: customer.registration_date,
      totalOrders: customer.total_orders,
      totalSpent: parseFloat(customer.total_spent),
      notes: customer.notes,
      ...(customer.created_by && { createdBy: customer.created_by }),
      ...(customer.updated_by && { updatedBy: customer.updated_by }),
      orders: orders.map((order) => ({
        id: order.id,
        date: order.date,
        status: order.status,
        total: parseFloat(order.total),
        items: order.items,
      })),
    };
  }

  async createCustomer(
    data: CreateCustomerRequest,
    userId: string
  ): Promise<Customer> {
    const [customer] = await db("customers")
      .insert({
        shop_name: data.shopName,
        owner_name: data.ownerName,
        owner_phone: data.ownerPhone,
        owner_email: data.ownerEmail,
        address: data.address,
        area: data.area,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        status: data.status,
        notes: data.notes,
        created_by: userId,
        updated_by: userId,
        is_deleted: false,
      })
      .returning("*");

    return {
      id: customer.id,
      shopName: customer.shop_name,
      ownerName: customer.owner_name,
      ownerPhone: customer.owner_phone,
      ownerEmail: customer.owner_email,
      address: customer.address,
      area: customer.area,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      status: customer.status,
      registrationDate: customer.registration_date,
      totalOrders: customer.total_orders,
      totalSpent: parseFloat(customer.total_spent),
      notes: customer.notes,
      ...(customer.created_by && { createdBy: customer.created_by }),
      ...(customer.updated_by && { updatedBy: customer.updated_by }),
    };
  }

  async updateCustomer(
    id: string,
    data: CreateCustomerRequest,
    userId: string
  ): Promise<Customer | null> {
    const [customer] = await db("customers")
      .where("id", id)
      .where("is_deleted", false) // Only update non-deleted records
      .update({
        shop_name: data.shopName,
        owner_name: data.ownerName,
        owner_phone: data.ownerPhone,
        owner_email: data.ownerEmail,
        address: data.address,
        area: data.area,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        status: data.status,
        notes: data.notes,
        updated_by: userId,
      })
      .returning("*");

    if (!customer) {
      return null;
    }

    return {
      id: customer.id,
      shopName: customer.shop_name,
      ownerName: customer.owner_name,
      ownerPhone: customer.owner_phone,
      ownerEmail: customer.owner_email,
      address: customer.address,
      area: customer.area,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      status: customer.status,
      registrationDate: customer.registration_date,
      totalOrders: customer.total_orders,
      totalSpent: parseFloat(customer.total_spent),
      notes: customer.notes,
      ...(customer.created_by && { createdBy: customer.created_by }),
      ...(customer.updated_by && { updatedBy: customer.updated_by }),
    };
  }

  async deleteCustomer(id: string, userId: string): Promise<boolean> {
    // Soft delete - set is_deleted flag instead of removing record
    const deletedCount = await db("customers")
      .where("id", id)
      .where("is_deleted", false) // Only soft-delete non-deleted records
      .update({
        is_deleted: true,
        updated_by: userId,
      });
    return deletedCount > 0;
  }

  async restoreCustomer(id: string, userId: string): Promise<boolean> {
    // Restore soft-deleted customer
    const restoredCount = await db("customers")
      .where("id", id)
      .where("is_deleted", true) // Only restore deleted records
      .update({
        is_deleted: false,
        updated_by: userId,
      });
    return restoredCount > 0;
  }

  async getLocationData(): Promise<{
    states: Array<{
      name: string;
      cities: Array<{
        name: string;
        areas: string[];
      }>;
    }>;
  }> {
    const locations = await db("customers")
      .select("state", "city", "area")
      .where("is_deleted", false) // Filter out soft-deleted records
      .distinct()
      .orderBy("state")
      .orderBy("city")
      .orderBy("area");

    const stateMap = new Map<string, Map<string, Set<string>>>();

    locations.forEach((location) => {
      if (!stateMap.has(location.state)) {
        stateMap.set(location.state, new Map());
      }

      const cityMap = stateMap.get(location.state)!;
      if (!cityMap.has(location.city)) {
        cityMap.set(location.city, new Set());
      }

      cityMap.get(location.city)!.add(location.area);
    });

    const states = Array.from(stateMap.entries()).map(
      ([stateName, cityMap]) => ({
        name: stateName,
        cities: Array.from(cityMap.entries()).map(([cityName, areaSet]) => ({
          name: cityName,
          areas: Array.from(areaSet).sort(),
        })),
      })
    );

    return { states };
  }
}

export default new CustomerService();

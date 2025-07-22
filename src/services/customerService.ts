import db from "../db";
import {
  Customer,
  CreateCustomerRequest,
  CustomerQueryParams,
  CustomerWithOrders,
  PaginationInfo,
} from "../../api-types";

export class CustomerService {
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
      sortBy = "registration_date",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let query = db("customers as c")
      .select("c.*", "u1.name as created_by_name", "u2.name as updated_by_name")
      .leftJoin("users as u1", "c.created_by", "u1.id")
      .leftJoin("users as u2", "c.updated_by", "u2.id");

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
    const countQuery = db("customers");

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

    // Apply sorting and pagination
    query = query.orderBy(sortBy, sortOrder).limit(limit).offset(offset);

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
      createdBy: customer.created_by_name,
      updatedBy: customer.updated_by_name,
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
      .first();

    if (!customer) {
      return null;
    }

    // Get customer's order history
    const orders = await db("orders")
      .where("customer_id", id)
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
      createdBy: customer.created_by_name,
      updatedBy: customer.updated_by_name,
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
      createdBy: undefined,
      updatedBy: undefined,
    };
  }

  async updateCustomer(
    id: string,
    data: CreateCustomerRequest,
    userId: string
  ): Promise<Customer | null> {
    const [customer] = await db("customers")
      .where("id", id)
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
      createdBy: undefined,
      updatedBy: undefined,
    };
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const deletedCount = await db("customers").where("id", id).del();
    return deletedCount > 0;
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

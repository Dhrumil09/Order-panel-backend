export interface DashboardStats {
    orders: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        growth: number;
    };
    customers: {
        total: number;
        active: number;
        newThisMonth: number;
        growth: number;
    };
    revenue: {
        total: number;
        thisMonth: number;
        thisWeek: number;
        growth: number;
    };
    products: {
        total: number;
        outOfStock: number;
        lowStock: number;
    };
}
export interface DashboardStatsResponse {
    success: boolean;
    data: DashboardStats;
    message: string;
}
export interface LatestOrder {
    id: string;
    customerName: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    total: number;
    date: string;
    items: number;
}
export interface LatestOrdersResponse {
    success: boolean;
    data: {
        orders: LatestOrder[];
    };
    message: string;
}
export interface Customer {
    id: string;
    shopName: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail: string;
    address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    status: "active" | "inactive" | "pending";
    registrationDate: string;
    totalOrders: number;
    totalSpent: number;
    notes?: string;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateCustomerRequest {
    shopName: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail: string;
    address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    status: "active" | "inactive" | "pending";
    notes?: string;
}
export interface CustomerWithOrders extends Customer {
    orders: Array<{
        id: string;
        date: string;
        status: string;
        total: number;
        items: number;
    }>;
}
export interface CustomersResponse {
    success: boolean;
    data: {
        customers: Customer[];
        pagination: PaginationInfo;
    };
    message: string;
}
export interface CustomerDetailsResponse {
    success: boolean;
    data: {
        customer: CustomerWithOrders;
    };
    message: string;
}
export interface CreateCustomerResponse {
    success: boolean;
    data: {
        customer: Customer;
    };
    message: string;
}
export interface DeleteCustomerResponse {
    success: boolean;
    message: string;
}
export interface LocationData {
    states: Array<{
        name: string;
        cities: Array<{
            name: string;
            areas: string[];
        }>;
    }>;
}
export interface LocationsResponse {
    success: boolean;
    data: LocationData;
    message: string;
}
export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    productId?: string;
    boxes?: number;
    pieces?: number;
    pack?: number;
    packSize?: number;
    availableInPieces?: boolean;
    availableInPack?: boolean;
}
export interface Order {
    id: string;
    customerName: string;
    customerAddress: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    date: string;
    items: number;
    customerEmail?: string;
    customerPhone?: string;
    orderItems?: OrderItem[];
    shippingMethod?: string;
    trackingNumber?: string;
    notes?: string;
    total: number;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateOrderRequest {
    customerId: string;
    customerName: string;
    customerAddress: string;
    customerEmail: string;
    customerPhone: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    orderItems: Array<{
        productId: string;
        quantity: number;
        boxes?: number;
        pieces?: number;
        pack?: number;
    }>;
    shippingMethod?: string;
    notes?: string;
}
export interface OrderWithCustomer extends Order {
    customer: {
        id: string;
        shopName: string;
        ownerName: string;
        ownerPhone: string;
        ownerEmail: string;
    };
}
export interface OrdersResponse {
    success: boolean;
    data: {
        orders: Order[];
        pagination: PaginationInfo;
    };
    message: string;
}
export interface OrderDetailsResponse {
    success: boolean;
    data: {
        order: OrderWithCustomer;
    };
    message: string;
}
export interface CreateOrderResponse {
    success: boolean;
    data: {
        order: Order;
    };
    message: string;
}
export interface UpdateOrderStatusRequest {
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    trackingNumber?: string;
    notes?: string;
}
export interface UpdateOrderStatusResponse {
    success: boolean;
    data: {
        order: {
            id: string;
            status: string;
            trackingNumber?: string;
            notes?: string;
            updatedAt: string;
        };
    };
    message: string;
}
export interface DeleteOrderResponse {
    success: boolean;
    message: string;
}
export interface ProductVariant {
    id: string;
    name: string;
    mrp: number;
}
export interface Product {
    id: string;
    name: string;
    companyId: string;
    categoryId: string;
    variants: ProductVariant[];
    isOutOfStock: boolean;
    availableInPieces: boolean;
    availableInPack: boolean;
    packSize?: number;
    createdAt: string;
    createdBy?: string;
    updatedBy?: string;
}
export interface ProductWithRelations extends Product {
    company: {
        id: string;
        name: string;
    };
    category: {
        id: string;
        name: string;
    };
}
export interface CreateProductRequest {
    name: string;
    companyId: string;
    categoryId: string;
    variants: Array<{
        name: string;
        mrp: number;
    }>;
    isOutOfStock: boolean;
    availableInPieces: boolean;
    availableInPack: boolean;
    packSize?: number;
}
export interface ProductsResponse {
    success: boolean;
    data: {
        products: ProductWithRelations[];
        pagination: PaginationInfo;
    };
    message: string;
}
export interface ProductDetailsResponse {
    success: boolean;
    data: {
        product: ProductWithRelations;
    };
    message: string;
}
export interface CreateProductResponse {
    success: boolean;
    data: {
        product: Product;
    };
    message: string;
}
export interface DeleteProductResponse {
    success: boolean;
    message: string;
}
export interface Company {
    id: string;
    name: string;
    productCount?: number;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateCompanyRequest {
    name: string;
}
export interface CreateCompanyResponse {
    success: boolean;
    data: {
        company: Company;
    };
    message: string;
}
export interface CompaniesResponse {
    success: boolean;
    data: {
        companies: Company[];
    };
    message: string;
}
export interface DeleteCompanyResponse {
    success: boolean;
    message: string;
}
export interface Category {
    id: string;
    name: string;
    productCount?: number;
    createdBy?: string;
    updatedBy?: string;
}
export interface CreateCategoryRequest {
    name: string;
}
export interface CreateCategoryResponse {
    success: boolean;
    data: {
        category: Category;
    };
    message: string;
}
export interface CategoriesResponse {
    success: boolean;
    data: {
        categories: Category[];
    };
    message: string;
}
export interface DeleteCategoryResponse {
    success: boolean;
    message: string;
}
export interface SalesAnalytics {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    growthRate: number;
    dailyData: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    topProducts: Array<{
        productId: string;
        productName: string;
        quantity: number;
        revenue: number;
    }>;
    topCustomers: Array<{
        customerId: string;
        customerName: string;
        orders: number;
        revenue: number;
    }>;
}
export interface SalesAnalyticsResponse {
    success: boolean;
    data: SalesAnalytics;
    message: string;
}
export interface CustomerAnalytics {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    customerGrowth: number;
    customerRetention: number;
    topAreas: Array<{
        area: string;
        customerCount: number;
    }>;
    customerStatus: {
        active: number;
        inactive: number;
        pending: number;
    };
}
export interface CustomerAnalyticsResponse {
    success: boolean;
    data: CustomerAnalytics;
    message: string;
}
export interface ProductAnalytics {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    topSellingProducts: Array<{
        productId: string;
        productName: string;
        sales: number;
        revenue: number;
    }>;
    categoryPerformance: Array<{
        categoryId: string;
        categoryName: string;
        productCount: number;
        sales: number;
    }>;
    companyPerformance: Array<{
        companyId: string;
        companyName: string;
        productCount: number;
        sales: number;
    }>;
}
export interface ProductAnalyticsResponse {
    success: boolean;
    data: ProductAnalytics;
    message: string;
}
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface ValidationError {
    type: "VALIDATION_ERROR";
    message: string;
    details: Array<{
        field: string;
        message: string;
    }>;
}
export interface AuthenticationError {
    type: "AUTHENTICATION_ERROR";
    message: string;
}
export interface AuthorizationError {
    type: "AUTHORIZATION_ERROR";
    message: string;
}
export interface NotFoundError {
    type: "NOT_FOUND";
    message: string;
}
export interface ServerError {
    type: "SERVER_ERROR";
    message: string;
}
export type ApiError = ValidationError | AuthenticationError | AuthorizationError | NotFoundError | ServerError;
export interface ErrorResponse {
    success: false;
    error: ApiError;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface RefreshTokenResponse {
    accessToken: string;
}
export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
}
export interface AuthResponse {
    success: boolean;
    data: LoginResponse | RefreshTokenResponse | {
        user: User;
    } | {
        users: User[];
    };
    message: string;
}
export type ApiResponse<T> = {
    success: true;
    data: T;
    message: string;
} | ErrorResponse;
export type StatusType = "active" | "inactive" | "pending";
export type OrderStatusType = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type SortOrderType = "asc" | "desc";
export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "inactive" | "pending";
    area?: string;
    city?: string;
    state?: string;
    sortBy?: "shopName" | "ownerName" | "registrationDate" | "totalOrders";
    sortOrder?: "asc" | "desc";
}
export interface OrderQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    dateFilter?: "today" | "yesterday" | "last7days" | "last30days" | "custom";
    startDate?: string;
    endDate?: string;
    sortBy?: "customerName" | "date" | "status";
    sortOrder?: "asc" | "desc";
}
export interface ProductQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    categoryId?: string;
    stockStatus?: "in-stock" | "out-of-stock";
    availability?: "pieces" | "pack" | "both";
    minPrice?: number;
    maxPrice?: number;
    sizeFilter?: string;
    sortBy?: "name" | "createdAt" | "price";
    sortOrder?: "asc" | "desc";
}
export interface AnalyticsQueryParams {
    period?: "day" | "week" | "month" | "year";
    startDate?: string;
    endDate?: string;
}
//# sourceMappingURL=api-types.d.ts.map
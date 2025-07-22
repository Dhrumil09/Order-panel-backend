# Admin Panel API Specification

**Last Updated**: December 2024  
**Version**: 1.0  
**Authentication**: JWT Bearer Token (Access Token + Refresh Token)  
**Soft Delete**: All delete operations use soft delete (isDeleted flag)  
**User Tracking**: All modifications track created_by and updated_by user IDs

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

### Login

**POST** `/auth/login`

**Request:**

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**

```typescript
interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
  message: string;
}
```

### Refresh Token

**POST** `/auth/refresh`

**Request:**

```typescript
interface RefreshTokenRequest {
  refreshToken: string;
}
```

**Response:**

```typescript
interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
  message: string;
}
```

### Register

**POST** `/auth/register`

**Request:**

```typescript
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}
```

**Response:**

```typescript
interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      createdAt: string;
    };
  };
  message: string;
}
```

### Get Current User

**GET** `/auth/me`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      createdAt: string;
    };
  };
  message: string;
}
```

### Get All Users

**GET** `/auth/users`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface AuthResponse {
  success: boolean;
  data: {
    users: Array<{
      id: string;
      email: string;
      name: string;
      createdAt: string;
    }>;
  };
  message: string;
}
```

---

## 1. DASHBOARD ENDPOINTS

### 1.1 Get Dashboard Stats

**GET** `/dashboard/stats`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface DashboardStatsResponse {
  success: boolean;
  data: {
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
  };
  message: string;
}
```

### 1.2 Get Latest Orders

**GET** `/dashboard/latest-orders`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface LatestOrdersResponse {
  success: boolean;
  data: {
    orders: Array<{
      id: string;
      customerName: string;
      status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
      total: number;
      date: string;
      items: number;
    }>;
  };
  message: string;
}
```

---

## 2. CUSTOMER ENDPOINTS

### 2.1 Get All Customers (with Pagination, Search, Filters)

**GET** `/customers`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term (searches shop name, owner name, phone, area, city)
- `status` (optional): Filter by status (active, inactive, pending)
- `area` (optional): Filter by area
- `city` (optional): Filter by city
- `state` (optional): Filter by state
- `sortBy` (optional): Sort field (shopName, ownerName, registrationDate, totalOrders)
- `sortOrder` (optional): Sort direction (asc, desc)

**Response:**

```typescript
interface CustomersResponse {
  success: boolean;
  data: {
    customers: Array<{
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
      createdBy?: string; // Name of user who created
      updatedBy?: string; // Name of user who last updated
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}
```

### 2.2 Get Customer Details with Order History

**GET** `/customers/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface CustomerDetailsResponse {
  success: boolean;
  data: {
    customer: {
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
      createdBy?: string; // Name of user who created
      updatedBy?: string; // Name of user who last updated
      orders: Array<{
        id: string;
        date: string;
        status: string;
        total: number;
        items: number;
      }>;
    };
  };
  message: string;
}
```

### 2.3 Create New Customer

**POST** `/customers`

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```typescript
interface CreateCustomerRequest {
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
```

**Response:**

```typescript
interface CreateCustomerResponse {
  success: boolean;
  data: {
    customer: {
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
    };
  };
  message: string;
}
```

### 2.4 Update Customer

**PUT** `/customers/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Request:** Same as CreateCustomerRequest

**Response:** Same as CreateCustomerResponse

### 2.5 Delete Customer (Soft Delete)

**DELETE** `/customers/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface DeleteCustomerResponse {
  success: boolean;
  message: string;
}
```

### 2.6 Restore Customer (Undo Soft Delete)

**PATCH** `/customers/:id/restore`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface RestoreCustomerResponse {
  success: boolean;
  message: string;
}
```

### 2.7 Get Location Data for Filters

**GET** `/customers/locations`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface LocationsResponse {
  success: boolean;
  data: {
    states: Array<{
      name: string;
      cities: Array<{
        name: string;
        areas: string[];
      }>;
    }>;
  };
  message: string;
}
```

---

## 3. ORDER ENDPOINTS

### 3.1 Get All Orders (with Pagination, Search, Filters)

**GET** `/orders`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term (searches customer name, address, order ID)
- `status` (optional): Filter by status (pending, processing, shipped, delivered, cancelled)
- `dateFilter` (optional): Date filter (today, yesterday, last7days, last30days, custom)
- `startDate` (optional): Start date for custom filter (YYYY-MM-DD)
- `endDate` (optional): End date for custom filter (YYYY-MM-DD)
- `sortBy` (optional): Sort field (customerName, date, status)
- `sortOrder` (optional): Sort direction (asc, desc)

**Response:**

```typescript
interface OrdersResponse {
  success: boolean;
  data: {
    orders: Array<{
      id: string;
      customerName: string;
      customerAddress: string;
      status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
      date: string;
      items: number;
      customerEmail?: string;
      customerPhone?: string;
      orderItems: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
      }>;
      shippingMethod?: string;
      trackingNumber?: string;
      notes?: string;
      total: number;
      createdBy?: string; // Name of user who created
      updatedBy?: string; // Name of user who last updated
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}
```

### 3.2 Get Order Details with Customer Info

**GET** `/orders/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface OrderDetailsResponse {
  success: boolean;
  data: {
    order: {
      id: string;
      customerName: string;
      customerAddress: string;
      status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
      date: string;
      items: number;
      customerEmail?: string;
      customerPhone?: string;
      orderItems: Array<{
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
      }>;
      shippingMethod?: string;
      trackingNumber?: string;
      notes?: string;
      total: number;
      createdBy?: string; // Name of user who created
      updatedBy?: string; // Name of user who last updated
      customer: {
        id: string;
        shopName: string;
        ownerName: string;
        ownerPhone: string;
        ownerEmail: string;
      };
    };
  };
  message: string;
}
```

### 3.3 Create New Order

**POST** `/orders`

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```typescript
interface CreateOrderRequest {
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
```

**Response:**

```typescript
interface CreateOrderResponse {
  success: boolean;
  data: {
    order: {
      id: string;
      customerName: string;
      customerAddress: string;
      status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
      date: string;
      items: number;
      customerEmail?: string;
      customerPhone?: string;
      orderItems: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
      }>;
      shippingMethod?: string;
      trackingNumber?: string;
      notes?: string;
      total: number;
    };
  };
  message: string;
}
```

### 3.4 Update Order Status

**PATCH** `/orders/:id/status`

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```typescript
interface UpdateOrderStatusRequest {
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  notes?: string;
}
```

**Response:**

```typescript
interface UpdateOrderStatusResponse {
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
```

### 3.5 Delete Order (Soft Delete)

**DELETE** `/orders/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface DeleteOrderResponse {
  success: boolean;
  message: string;
}
```

### 3.6 Restore Order (Undo Soft Delete)

**PATCH** `/orders/:id/restore`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface RestoreOrderResponse {
  success: boolean;
  message: string;
}
```

---

## 4. PRODUCT ENDPOINTS

### 4.1 Get All Products (with Pagination, Search, Filters)

**GET** `/products`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term (searches product name, company name, category name)
- `companyId` (optional): Filter by company - can be multiple
- `categoryId` (optional): Filter by category - can be multiple
- `stockStatus` (optional): Filter by stock status (in-stock, out-of-stock)
- `availability` (optional): Filter by availability (pieces, pack, both)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sizeFilter` (optional): Filter by variant size/name
- `sortBy` (optional): Sort field (name, createdAt, price)
- `sortOrder` (optional): Sort direction (asc, desc)

**Response:**

```typescript
interface ProductsResponse {
  success: boolean;
  data: {
    products: Array<{
      id: string;
      name: string;
      companyId: string;
      categoryId: string;
      variants: Array<{
        id: string;
        name: string;
        mrp: number;
      }>;
      isOutOfStock: boolean;
      availableInPieces: boolean;
      availableInPack: boolean;
      packSize?: number;
      createdAt: string;
      company: {
        id: string;
        name: string;
      };
      category: {
        id: string;
        name: string;
      };
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}
```

### 4.2 Get Product Details

**GET** `/products/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface ProductDetailsResponse {
  success: boolean;
  data: {
    product: {
      id: string;
      name: string;
      companyId: string;
      categoryId: string;
      variants: Array<{
        id: string;
        name: string;
        mrp: number;
      }>;
      isOutOfStock: boolean;
      availableInPieces: boolean;
      availableInPack: boolean;
      packSize?: number;
      createdAt: string;
      company: {
        id: string;
        name: string;
      };
      category: {
        id: string;
        name: string;
      };
    };
  };
  message: string;
}
```

### 4.3 Create New Product

**POST** `/products`

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```typescript
interface CreateProductRequest {
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
```

**Response:**

```typescript
interface CreateProductResponse {
  success: boolean;
  data: {
    product: {
      id: string;
      name: string;
      companyId: string;
      categoryId: string;
      variants: Array<{
        id: string;
        name: string;
        mrp: number;
      }>;
      isOutOfStock: boolean;
      availableInPieces: boolean;
      availableInPack: boolean;
      packSize?: number;
      createdAt: string;
    };
  };
  message: string;
}
```

### 4.4 Update Product

**PUT** `/products/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Request:** Same as CreateProductRequest

**Response:** Same as CreateProductResponse

### 4.5 Delete Product (Soft Delete)

**DELETE** `/products/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface DeleteProductResponse {
  success: boolean;
  message: string;
}
```

### 4.6 Restore Product (Undo Soft Delete)

**PATCH** `/products/:id/restore`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface RestoreProductResponse {
  success: boolean;
  message: string;
}
```

---

## 5. COMPANY & CATEGORY ENDPOINTS

### 5.1 Get All Companies

**GET** `/companies`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface CompaniesResponse {
  success: boolean;
  data: {
    companies: Array<{
      id: string;
      name: string;
      productCount: number;
    }>;
  };
  message: string;
}
```

### 5.2 Create Company

**POST** `/companies`

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```typescript
interface CreateCompanyRequest {
  name: string;
}
```

**Response:**

```typescript
interface CreateCompanyResponse {
  success: boolean;
  data: {
    company: {
      id: string;
      name: string;
    };
  };
  message: string;
}
```

### 5.3 Delete Company (Soft Delete)

**DELETE** `/companies/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface DeleteCompanyResponse {
  success: boolean;
  message: string;
}
```

### 5.4 Restore Company (Undo Soft Delete)

**PATCH** `/companies/:id/restore`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface RestoreCompanyResponse {
  success: boolean;
  message: string;
}
```

### 5.5 Get All Categories

**GET** `/categories`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Array<{
      id: string;
      name: string;
      productCount: number;
    }>;
  };
  message: string;
}
```

### 5.6 Create Category

**POST** `/categories`

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```typescript
interface CreateCategoryRequest {
  name: string;
}
```

**Response:**

```typescript
interface CreateCategoryResponse {
  success: boolean;
  data: {
    category: {
      id: string;
      name: string;
    };
  };
  message: string;
}
```

### 5.7 Delete Category (Soft Delete)

**DELETE** `/categories/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}
```

### 5.8 Restore Category (Undo Soft Delete)

**PATCH** `/categories/:id/restore`

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```typescript
interface RestoreCategoryResponse {
  success: boolean;
  message: string;
}
```

---

## 6. ANALYTICS ENDPOINTS

### 6.1 Get Sales Analytics

**GET** `/analytics/sales`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `period` (optional): Time period (day, week, month, year)
- `startDate` (optional): Start date for custom period (YYYY-MM-DD)
- `endDate` (optional): End date for custom period (YYYY-MM-DD)

**Response:**

```typescript
interface SalesAnalyticsResponse {
  success: boolean;
  data: {
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
  };
  message: string;
}
```

### 6.2 Get Customer Analytics

**GET** `/analytics/customers`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `period` (optional): Time period (day, week, month, year)
- `startDate` (optional): Start date for custom period (YYYY-MM-DD)
- `endDate` (optional): End date for custom period (YYYY-MM-DD)

**Response:**

```typescript
interface CustomerAnalyticsResponse {
  success: boolean;
  data: {
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
  };
  message: string;
}
```

### 6.3 Get Product Analytics

**GET** `/analytics/products`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

- `period` (optional): Time period (day, week, month, year)
- `startDate` (optional): Start date for custom period (YYYY-MM-DD)
- `endDate` (optional): End date for custom period (YYYY-MM-DD)

**Response:**

```typescript
interface ProductAnalyticsResponse {
  success: boolean;
  data: {
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
  };
  message: string;
}
```

---

## 7. ERROR RESPONSES

All endpoints can return the following error responses:

### 7.1 Validation Error (400)

```typescript
interface ValidationError {
  success: false;
  error: {
    type: "VALIDATION_ERROR";
    message: string;
    details: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

### 7.2 Authentication Error (401)

```typescript
interface AuthenticationError {
  success: false;
  error: {
    type: "AUTHENTICATION_ERROR";
    message: string;
  };
}
```

### 7.3 Authorization Error (403)

```typescript
interface AuthorizationError {
  success: false;
  error: {
    type: "AUTHORIZATION_ERROR";
    message: string;
  };
}
```

### 7.4 Not Found Error (404)

```typescript
interface NotFoundError {
  success: false;
  error: {
    type: "NOT_FOUND";
    message: string;
  };
}
```

### 7.5 Server Error (500)

```typescript
interface ServerError {
  success: false;
  error: {
    type: "SERVER_ERROR";
    message: string;
  };
}
```

---

## 8. RATE LIMITING

**Note**: Rate limiting is planned but not yet implemented.

- **Dashboard endpoints**: 100 requests per minute
- **CRUD endpoints**: 200 requests per minute
- **Analytics endpoints**: 50 requests per minute

Rate limit headers will be included in responses:

- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

---

## 9. IMPLEMENTATION NOTES

### 9.1 Authentication & Authorization

- All API endpoints (except `/auth/login` and `/auth/register`) require JWT authentication
- JWT tokens are sent via `Authorization: Bearer <access_token>` header
- Token expiration is configurable (default: 24 hours)
- User authentication is required for all data modifications

### 9.2 User Tracking

- All resources (customers, orders, products, companies, categories) track:
  - `created_by`: UUID of user who created the resource
  - `updated_by`: UUID of user who last modified the resource
  - `created_at`: Timestamp when resource was created
  - `updated_at`: Timestamp when resource was last modified
- User names are included in API responses for display purposes

### 9.3 Soft Delete Implementation

- All delete operations use soft delete (set `is_deleted = true`)
- Soft-deleted records are filtered out from all queries
- Restore endpoints are available to undo soft deletes
- Soft delete preserves data integrity and audit trails

### 9.4 Database Transactions

- Order creation uses database transactions for data consistency
- Product updates use transactions when updating variants
- Soft delete operations use transactions where needed

### 9.5 Sample Users

The system includes two sample users for testing:

- **Admin User**: `admin@example.com` / `admin123`
- **Regular User**: `user@example.com` / `user123`

---

## 10. API ENDPOINT SUMMARY

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `GET /auth/users` - Get all users

### Dashboard

- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/latest-orders` - Get latest orders

### Customers

- `GET /customers` - Get all customers (with pagination, search, filters)
- `GET /customers/:id` - Get customer details with order history
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer (soft delete)
- `PATCH /customers/:id/restore` - Restore customer (undo soft delete)
- `GET /customers/locations` - Get location data for filters

### Orders

- `GET /orders` - Get all orders (with pagination, search, filters)
- `GET /orders/:id` - Get order details with customer info
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Delete order (soft delete)
- `PATCH /orders/:id/restore` - Restore order (undo soft delete)

### Products

- `GET /products` - Get all products (with pagination, search, filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product (soft delete)
- `PATCH /products/:id/restore` - Restore product (undo soft delete)

### Companies & Categories

- `GET /companies` - Get all companies
- `POST /companies` - Create company
- `DELETE /companies/:id` - Delete company (soft delete)
- `PATCH /companies/:id/restore` - Restore company (undo soft delete)
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `DELETE /categories/:id` - Delete category (soft delete)
- `PATCH /categories/:id/restore` - Restore category (undo soft delete)

### Analytics

- `GET /analytics/sales` - Get sales analytics
- `GET /analytics/customers` - Get customer analytics
- `GET /analytics/products` - Get product analytics

This API specification provides a complete foundation for your admin panel with all the necessary endpoints, proper typing, comprehensive error handling, pagination support, authentication, user tracking, and soft delete functionality.

---

## 11. CHANGELOG & IMPLEMENTATION NOTES

### Version 1.0 - December 2024

#### 🔐 Authentication Module Implementation

- **Added**: JWT-based authentication with access and refresh tokens
- **Added**: User registration and login endpoints
- **Added**: Refresh token endpoint for token renewal
- **Added**: User management endpoints (get current user, get all users)
- **Added**: Password hashing using bcrypt
- **Added**: Authentication middleware for protected routes
- **Added**: Sample users for testing (admin@example.com/admin123, user@example.com/user123)

#### 👥 User Tracking System

- **Added**: `created_by` and `updated_by` fields to all relevant tables
- **Added**: User tracking in all CRUD operations
- **Added**: User names included in API responses for display
- **Modified**: All service methods to accept and store user IDs
- **Modified**: Database schema to include UUID foreign keys to users table

#### 🗑️ Soft Delete Implementation

- **Added**: `is_deleted` flag to all relevant tables
- **Added**: Soft delete functionality for all resources
- **Added**: Restore endpoints for all resources (`PATCH /:id/restore`)
- **Modified**: All queries to filter out soft-deleted records
- **Added**: Soft delete preserves data integrity and audit trails

#### 🔄 Refresh Token System

- **Added**: Separate access and refresh tokens
- **Added**: Access token with shorter expiry (15 minutes default)
- **Added**: Refresh token with longer expiry (7 days default)
- **Added**: Token refresh endpoint (`POST /auth/refresh`)
- **Modified**: Login response to include both access and refresh tokens
- **Added**: Token verification and generation utilities

#### 🛡️ Security Enhancements

- **Added**: JWT secret configuration via environment variables
- **Added**: Separate secrets for access and refresh tokens
- **Added**: Configurable token expiration times
- **Added**: Input validation and sanitization
- **Added**: CORS and Helmet security middleware

#### 📊 Database Schema Updates

- **Modified**: Users table to use UUID primary keys
- **Added**: User tracking foreign keys to all tables
- **Added**: Soft delete flags to all tables
- **Added**: Proper indexes for performance
- **Added**: Database migrations for all schema changes

#### 🔧 API Improvements

- **Modified**: All endpoints now require authentication (except login/register)
- **Added**: Comprehensive error handling with specific error types
- **Added**: Input validation for all endpoints
- **Added**: Pagination support for list endpoints
- **Added**: Search and filtering capabilities
- **Added**: Proper HTTP status codes and error messages

#### 📝 Documentation Updates

- **Updated**: API specification to reflect all changes
- **Added**: Comprehensive type definitions in api-types.ts
- **Added**: Postman collection for testing all APIs
- **Added**: Implementation notes and changelog
- **Updated**: All endpoint documentation with authentication requirements

#### 🧪 Testing & Development

- **Added**: Comprehensive Postman collection with automated token extraction
- **Added**: Sample data seeding for testing
- **Added**: Database migration and seeding scripts
- **Added**: Development environment setup instructions

### Technical Implementation Details

#### Authentication Flow

1. User logs in with email/password
2. System validates credentials and generates access + refresh tokens
3. Access token used for API requests (short-lived)
4. Refresh token used to get new access token when expired
5. All protected endpoints require valid access token

#### User Tracking Flow

1. All CRUD operations extract user ID from JWT token
2. User ID stored in `created_by` for new resources
3. User ID stored in `updated_by` for modifications
4. User names fetched and included in API responses

#### Soft Delete Flow

1. DELETE operations set `is_deleted = true` instead of removing records
2. All queries filter by `is_deleted = false`
3. Restore operations set `is_deleted = false`
4. Data integrity maintained for audit trails

#### Database Migrations Applied

1. `001_create_users_table.ts` - Users table with UUID primary keys
2. `009_add_user_tracking_fields.ts` - User tracking fields
3. `010_add_soft_delete_flags.ts` - Soft delete flags

#### Environment Variables Required

- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `JWT_EXPIRES_IN` - Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiry (default: 7d)

### Frontend Integration Notes

#### Authentication Integration

- Store both access and refresh tokens securely
- Use access token for API requests
- Implement automatic token refresh when access token expires
- Handle 401 responses by attempting token refresh

#### User Tracking Display

- All API responses now include `createdBy` and `updatedBy` user names
- Display user information in admin interface
- Show audit trail for data modifications

#### Soft Delete UI

- Implement "soft delete" instead of permanent deletion
- Add restore functionality in admin interface
- Consider showing deleted items in a separate view

#### Error Handling

- Handle authentication errors (401, 403)
- Handle validation errors (400)
- Handle server errors (500)
- Implement proper error messages and user feedback

---

## 12. RATE LIMITING (PLANNED)

Rate limiting will be implemented with different limits for different endpoint types:

- **Dashboard endpoints**: 100 requests per minute
- **CRUD endpoints**: 200 requests per minute
- **Analytics endpoints**: 50 requests per minute
- **Authentication endpoints**: 10 requests per minute

Rate limit headers will be included in responses:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## 13. API ENDPOINT SUMMARY

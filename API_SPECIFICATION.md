# Admin Panel API Specification

## Base URL
```
https://your-api-domain.com/api/v1
```

## Authentication
All API endpoints require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. DASHBOARD ENDPOINTS

### 1.1 Get Dashboard Stats
**GET** `/dashboard/stats`

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
      growth: number; // percentage
    };
    customers: {
      total: number;
      active: number;
      newThisMonth: number;
      growth: number; // percentage
    };
    revenue: {
      total: number;
      thisMonth: number;
      thisWeek: number;
      growth: number; // percentage
    };
    products: {
      total: number;
      outOfStock: number;
      lowStock: number; // less than 10 items
    };
  };
  message: string;
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 2315,
      "today": 12,
      "thisWeek": 89,
      "thisMonth": 345,
      "growth": 12.5
    },
    "customers": {
      "total": 1235,
      "active": 1189,
      "newThisMonth": 45,
      "growth": 15.2
    },
    "revenue": {
      "total": 1250000,
      "thisMonth": 89000,
      "thisWeek": 25000,
      "growth": 8.7
    },
    "products": {
      "total": 567,
      "outOfStock": 23,
      "lowStock": 45
    }
  },
  "message": "Dashboard stats retrieved successfully"
}
```

### 1.2 Get Latest Orders
**GET** `/dashboard/latest-orders?limit=5`

**Query Parameters:**
- `limit` (optional): Number of orders to return (default: 5)

**Response:**
```typescript
interface LatestOrdersResponse {
  success: boolean;
  data: {
    orders: Array<{
      id: string;
      customerName: string;
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
      total: number;
      date: string;
      items: number;
    }>;
  };
  message: string;
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "#12345",
        "customerName": "Owen Turner",
        "status": "shipped",
        "total": 120.00,
        "date": "2023-08-15",
        "items": 3
      },
      {
        "id": "#12346",
        "customerName": "Sophia Mitchell",
        "status": "processing",
        "total": 85.50,
        "date": "2023-08-14",
        "items": 2
      }
    ]
  },
  "message": "Latest orders retrieved successfully"
}
```

---

## 2. CUSTOMER ENDPOINTS

### 2.1 Get All Customers (with Pagination, Search, Filters)
**GET** `/customers`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term (searches shopName, ownerName, ownerPhone, area, city)
- `status` (optional): Filter by status (active, inactive, pending) - can be multiple
- `area` (optional): Filter by area - can be multiple
- `city` (optional): Filter by city - can be multiple
- `state` (optional): Filter by state - can be multiple
- `sortBy` (optional): Sort field (shopName, ownerName, registrationDate, totalOrders)
- `sortOrder` (optional): Sort order (asc, desc)

**Example Request:**
```
GET /customers?page=1&limit=10&search=electronics&status=active&area=Koramangala&sortBy=registrationDate&sortOrder=desc
```

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
      status: 'active' | 'inactive' | 'pending';
      registrationDate: string;
      totalOrders: number;
      totalSpent: number;
      notes?: string;
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

**Example Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "#CUST001",
        "shopName": "Kumar Electronics",
        "ownerName": "Rajesh Kumar",
        "ownerPhone": "+91 98765 43210",
        "ownerEmail": "rajesh.kumar@gmail.com",
        "address": "123 MG Road, Koramangala",
        "area": "Koramangala",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560034",
        "status": "active",
        "registrationDate": "2024-01-15",
        "totalOrders": 45,
        "totalSpent": 125000,
        "notes": "Premium customer, prefers express delivery"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Customers retrieved successfully"
}
```

### 2.2 Get Customer by ID (with Order History)
**GET** `/customers/:id`

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
      status: 'active' | 'inactive' | 'pending';
      registrationDate: string;
      totalOrders: number;
      totalSpent: number;
      notes?: string;
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

### 2.3 Create Customer
**POST** `/customers`

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
  status: 'active' | 'inactive' | 'pending';
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
      status: 'active' | 'inactive' | 'pending';
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

**Request:** Same as CreateCustomerRequest

**Response:** Same as CreateCustomerResponse

### 2.5 Delete Customer
**DELETE** `/customers/:id`

**Response:**
```typescript
interface DeleteCustomerResponse {
  success: boolean;
  message: string;
}
```

### 2.6 Get Location Data (for Filters)
**GET** `/customers/locations`

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

**Example Response:**
```json
{
  "success": true,
  "data": {
    "states": [
      {
        "name": "Karnataka",
        "cities": [
          {
            "name": "Bangalore",
            "areas": ["Koramangala", "Indiranagar", "Whitefield"]
          }
        ]
      },
      {
        "name": "Maharashtra",
        "cities": [
          {
            "name": "Mumbai",
            "areas": ["Andheri West", "Juhu", "Bandra"]
          }
        ]
      }
    ]
  },
  "message": "Location data retrieved successfully"
}
```

---

## 3. ORDER ENDPOINTS

### 3.1 Get All Orders (with Pagination, Search, Filters)
**GET** `/orders`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term (searches customerName, customerAddress, orderId)
- `status` (optional): Filter by status (pending, processing, shipped, delivered, cancelled) - can be multiple
- `dateFilter` (optional): Date filter (today, yesterday, last7days, last30days, custom)
- `startDate` (optional): Custom start date (YYYY-MM-DD) - required if dateFilter=custom
- `endDate` (optional): Custom end date (YYYY-MM-DD) - required if dateFilter=custom
- `sortBy` (optional): Sort field (customerName, date, status)
- `sortOrder` (optional): Sort order (asc, desc)

**Example Request:**
```
GET /orders?page=1&limit=10&search=electronics&status=shipped&dateFilter=last7days&sortBy=date&sortOrder=desc
```

**Response:**
```typescript
interface OrdersResponse {
  success: boolean;
  data: {
    orders: Array<{
      id: string;
      customerName: string;
      customerAddress: string;
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
      date: string;
      items: number;
      customerEmail?: string;
      customerPhone?: string;
      orderItems?: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
      }>;
      shippingMethod?: string;
      trackingNumber?: string;
      notes?: string;
      total: number;
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

**Example Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "#ORD001",
        "customerName": "Rajesh Kumar",
        "customerAddress": "123 MG Road, Koramangala, Bangalore, Karnataka 560034",
        "status": "shipped",
        "date": "2024-01-15",
        "items": 3,
        "customerEmail": "rajesh.kumar@gmail.com",
        "customerPhone": "+91 98765 43210",
        "orderItems": [
          {
            "id": "1",
            "name": "Wireless Headphones",
            "quantity": 1,
            "price": 120.00
          },
          {
            "id": "2",
            "name": "Phone Case",
            "quantity": 2,
            "price": 25.00
          }
        ],
        "shippingMethod": "Express Delivery",
        "trackingNumber": "DTDC123456789",
        "notes": "Customer requested signature confirmation",
        "total": 170.00
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 75,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Orders retrieved successfully"
}
```

### 3.2 Get Order by ID (with Customer Details)
**GET** `/orders/:id`

**Response:**
```typescript
interface OrderDetailsResponse {
  success: boolean;
  data: {
    order: {
      id: string;
      customerName: string;
      customerAddress: string;
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
      date: string;
      items: number;
      customerEmail?: string;
      customerPhone?: string;
      orderItems: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        productId: string;
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

### 3.3 Create Order
**POST** `/orders`

**Request:**
```typescript
interface CreateOrderRequest {
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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

**Request:**
```typescript
interface UpdateOrderStatusRequest {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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

### 3.5 Delete Order
**DELETE** `/orders/:id`

**Response:**
```typescript
interface DeleteOrderResponse {
  success: boolean;
  message: string;
}
```

---

## 4. PRODUCT ENDPOINTS

### 4.1 Get All Products (with Pagination, Search, Filters)
**GET** `/products`

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
- `sizeFilter` (optional): Size contains text
- `sortBy` (optional): Sort field (name, createdAt, price)
- `sortOrder` (optional): Sort order (asc, desc)

**Example Request:**
```
GET /products?page=1&limit=10&search=coffee&companyId=1&stockStatus=in-stock&minPrice=100&maxPrice=500&sortBy=name&sortOrder=asc
```

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

**Example Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "1",
        "name": "Premium Coffee Beans",
        "companyId": "1",
        "categoryId": "1",
        "variants": [
          {
            "id": "1",
            "name": "250g",
            "mrp": 299
          },
          {
            "id": "2",
            "name": "500g",
            "mrp": 499
          }
        ],
        "isOutOfStock": false,
        "availableInPieces": true,
        "availableInPack": true,
        "packSize": 12,
        "createdAt": "2024-01-15T10:30:00Z",
        "company": {
          "id": "1",
          "name": "Coffee Co."
        },
        "category": {
          "id": "1",
          "name": "Beverages"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Products retrieved successfully"
}
```

### 4.2 Get Product by ID
**GET** `/products/:id`

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

### 4.3 Create Product
**POST** `/products`

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

**Request:** Same as CreateProductRequest

**Response:** Same as CreateProductResponse

### 4.5 Delete Product
**DELETE** `/products/:id`

**Response:**
```typescript
interface DeleteProductResponse {
  success: boolean;
  message: string;
}
```

---

## 5. COMPANY & CATEGORY ENDPOINTS

### 5.1 Get All Companies
**GET** `/companies`

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

### 5.3 Delete Company
**DELETE** `/companies/:id`

**Response:**
```typescript
interface DeleteCompanyResponse {
  success: boolean;
  message: string;
}
```

### 5.4 Get All Categories
**GET** `/categories`

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

### 5.5 Create Category
**POST** `/categories`

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

### 5.6 Delete Category
**DELETE** `/categories/:id`

**Response:**
```typescript
interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}
```

---

## 6. ANALYTICS ENDPOINTS

### 6.1 Get Sales Analytics
**GET** `/analytics/sales`

**Query Parameters:**
- `period` (optional): Period for analytics (day, week, month, year)
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

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

All endpoints may return the following error responses:

### 7.1 Validation Error (400)
```typescript
interface ValidationErrorResponse {
  success: false;
  error: {
    type: 'VALIDATION_ERROR';
    message: string;
    details: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

**Example:**
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "shopName",
        "message": "Shop name is required"
      },
      {
        "field": "ownerEmail",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 7.2 Authentication Error (401)
```typescript
interface AuthenticationErrorResponse {
  success: false;
  error: {
    type: 'AUTHENTICATION_ERROR';
    message: string;
  };
}
```

### 7.3 Authorization Error (403)
```typescript
interface AuthorizationErrorResponse {
  success: false;
  error: {
    type: 'AUTHORIZATION_ERROR';
    message: string;
  };
}
```

### 7.4 Not Found Error (404)
```typescript
interface NotFoundErrorResponse {
  success: false;
  error: {
    type: 'NOT_FOUND';
    message: string;
  };
}
```

### 7.5 Server Error (500)
```typescript
interface ServerErrorResponse {
  success: false;
  error: {
    type: 'SERVER_ERROR';
    message: string;
  };
}
```

---

## 8. PAGINATION

All list endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Pagination response structure:
```typescript
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

---

## 9. SEARCH AND FILTERING

Most list endpoints support:
- **Text search**: Searches across relevant text fields
- **Status filtering**: Filter by status values (can be multiple)
- **Date filtering**: Filter by date ranges
- **Sorting**: Sort by various fields in ascending/descending order

**Example search queries:**

Customers:
```
GET /customers?search=electronics&status=active&area=Koramangala&sortBy=registrationDate&sortOrder=desc&page=1&limit=10
```

Orders:
```
GET /orders?search=rajesh&status=shipped&dateFilter=last7days&sortBy=date&sortOrder=desc&page=1&limit=10
```

Products:
```
GET /products?search=coffee&companyId=1&stockStatus=in-stock&minPrice=100&maxPrice=500&sortBy=name&sortOrder=asc&page=1&limit=10
```

---

## 10. RATE LIMITING

- **Dashboard endpoints**: 60 requests per minute
- **CRUD endpoints**: 100 requests per minute
- **Analytics endpoints**: 30 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 11. ENVIRONMENT VARIABLES

Required environment variables for the API:
```env
# Server
PORT=3000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.com
```

---

## 12. SUMMARY OF ENDPOINTS

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/latest-orders` - Get latest orders

### Customers
- `GET /customers` - Get all customers (with pagination, search, filters)
- `GET /customers/:id` - Get customer details with order history
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers/locations` - Get location data for filters

### Orders
- `GET /orders` - Get all orders (with pagination, search, filters)
- `GET /orders/:id` - Get order details with customer info
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Delete order

### Products
- `GET /products` - Get all products (with pagination, search, filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Companies & Categories
- `GET /companies` - Get all companies
- `POST /companies` - Create company
- `DELETE /companies/:id` - Delete company
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `DELETE /categories/:id` - Delete category

### Analytics
- `GET /analytics/sales` - Get sales analytics
- `GET /analytics/customers` - Get customer analytics
- `GET /analytics/products` - Get product analytics

This API specification provides a complete foundation for your admin panel with all the necessary endpoints, proper typing, comprehensive error handling, and pagination support. 
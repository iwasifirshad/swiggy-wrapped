import { SwiggyOrder, OrderCategory } from '../types';

// The endpoint Swiggy uses on the desktop website to fetch orders
const ORDERS_API_URL = 'https://www.swiggy.com/dapi/order/all';

/**
 * Helper to determine order type from raw data
 */
const getOrderType = (rawOrder: any): OrderCategory => {
  const type = (rawOrder.order_type || '').toUpperCase();
  const name = (rawOrder.restaurant_name || '').toLowerCase();

  if (type === 'INSTAMART' || name.includes('instamart')) return 'Instamart';
  if (type === 'DINEOUT' || type === 'DINING') return 'Dineout';
  if (type === 'GENIE') return 'Genie';
  
  // Default to Food, but double check name for edge cases
  return 'Food';
};

/**
 * Fetches all orders recursively until we hit a date limit or run out of orders.
 * NOTE: This relies on the user being logged in to Swiggy in the current browser session.
 * It uses the browser's cookies automatically via credentials: 'include'.
 */
export const fetchOrderHistory = async (
  onProgress: (count: number, totalEstimate: number) => void
): Promise<SwiggyOrder[]> => {
  let allOrders: SwiggyOrder[] = [];
  let orderId: string | null = null; // Used for pagination (offset)
  let hasMore = true;
  let pageCount = 0;
  
  // Target Year: 2025
  const TARGET_YEAR = 2025;
  
  // Safety limit - Increased to 100 to ensure we catch everything for heavy users
  const MAX_PAGES = 100; 

  while (hasMore && pageCount < MAX_PAGES) {
    try {
      const url = new URL(ORDERS_API_URL);
      if (orderId) {
        url.searchParams.append('order_id', orderId);
      }

      // We rely on the browser to attach the cookies for swiggy.com
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', 
        },
      });

      // Handle HTML responses (redirects to login)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
         throw new Error("Session invalid. Please log in to Swiggy.");
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expired. Please log in to Swiggy.");
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const json = await response.json();

      if (json.statusCode !== 0 || !json.data || !json.data.orders) {
        hasMore = false;
        break;
      }

      const newOrdersRaw = json.data.orders;
      
      if (newOrdersRaw.length === 0) {
        hasMore = false;
        break;
      }

      // Map raw data to our clean interface
      const cleanOrders: SwiggyOrder[] = newOrdersRaw.map((o: any) => ({
        order_id: o.order_id,
        order_time: o.order_time,
        order_total: Number(o.net_total || o.order_total || 0), // Ensure number
        restaurant_name: o.restaurant_name,
        restaurant_id: o.restaurant_id,
        restaurant_logo: o.restaurant_logo, // Extract logo hash
        delivery_fee: Number(o.delivery_charges || o.delivery_fee || 0), // Extract delivery fee
        order_items: o.order_items ? o.order_items.map((i: any) => ({
          item_id: i.item_id,
          name: i.name,
          price: Number(i.final_price || i.price || 0),
          quantity: Number(i.quantity || 1),
          is_veg: i.is_veg // "1" is Veg, "0" is Non-Veg usually
        })) : [],
        order_status: o.order_status,
        order_type: getOrderType(o) 
      }));

      // Filter for 2025 and check for stop condition
      for (const order of cleanOrders) {
        const orderDate = new Date(order.order_time);
        const orderYear = orderDate.getFullYear();
        
        // Strict filtering:
        // 1. Must be 2025
        // 2. Must be Delivered (ignore cancelled/failed)
        const isDelivered = (order.order_status || '').toLowerCase() === 'delivered';

        if (orderYear === TARGET_YEAR) {
          if (isDelivered) {
            allOrders.push(order);
          }
        } else if (orderYear < TARGET_YEAR) {
          // We reached past years (2024 and older), stop fetching
          hasMore = false;
        }
        // If orderYear > TARGET_YEAR (future?), ignore or keep.
      }
      
      if (!hasMore) break;

      // Update pagination cursor
      orderId = newOrdersRaw[newOrdersRaw.length - 1].order_id;
      
      pageCount++;
      onProgress(allOrders.length, -1); 

      // Add a small delay to be nice to the API
      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.error("Fetch error:", e);
      throw e;
    }
  }

  return allOrders;
};
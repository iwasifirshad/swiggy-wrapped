export interface SwiggyItem {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  is_veg: string; // "1" or "0"
}

export type OrderCategory = 'Food' | 'Instamart' | 'Dineout' | 'Genie' | 'Other';

export interface SwiggyOrder {
  order_id: string;
  order_time: string; // ISO or Timestamp
  order_total: number;
  restaurant_name: string;
  restaurant_id: string;
  restaurant_logo?: string; // Image hash
  delivery_fee: number;
  order_items: SwiggyItem[];
  order_status: string;
  delivery_time_in_seconds?: number;
  order_type: OrderCategory;
}

export interface OrderHistoryResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    orders: any[]; // Raw objects from API
    total_orders: number;
  };
}

export interface CategoryStat {
  count: number;
  spend: number;
}

export interface RestaurantRank {
  name: string;
  count: number;
  spend: number;
  image?: string;
}

export interface AnalysisResult {
  totalOrders: number;
  totalSpend: number;
  totalDeliveryFees: number;
  avgOrderValue: number;
  vegNonVegStats: {
    veg: number;
    nonVeg: number;
  };
  categoryStats: {
    Food: CategoryStat;
    Instamart: CategoryStat;
    Dineout: CategoryStat;
    Genie: CategoryStat;
  };
  restaurantRankings: RestaurantRank[]; 
  topRestaurant: {
    name: string;
    count: number;
    spend: number;
    image?: string;
  };
  topDish: {
    name: string;
    count: number;
  };
  orderingTimeDistribution: {
    morning: number;
    lunch: number;
    afternoon: number;
    dinner: number;
    lateNight: number;
  };
  personalityType: {
    title: string;
    description: string;
    icon: string;
  };
  topCuisine: string;
  dateRange: {
    start: string;
    end: string;
  };
}
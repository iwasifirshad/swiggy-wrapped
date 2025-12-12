import { SwiggyOrder, AnalysisResult, RestaurantRank } from '../types';

const detectCuisine = (itemNames: string[], restaurantName: string): string => {
  const text = (restaurantName + " " + itemNames.join(" ")).toLowerCase();
  
  if (text.includes('biryani')) return 'Biryani';
  if (text.includes('pizza')) return 'Pizza';
  if (text.includes('burger') || text.includes('mc') || text.includes('whopper')) return 'Burger';
  if (text.includes('dosa') || text.includes('idli')) return 'South Indian';
  if (text.includes('noodles') || text.includes('fried rice') || text.includes('manchurian')) return 'Chinese';
  if (text.includes('cake') || text.includes('dessert') || text.includes('ice cream')) return 'Desserts';
  if (text.includes('thali') || text.includes('roti') || text.includes('paneer')) return 'North Indian';
  if (text.includes('roll') || text.includes('wrap')) return 'Rolls & Wraps';
  if (text.includes('coffee') || text.includes('tea') || text.includes('chai')) return 'Beverages';
  if (text.includes('healthy') || text.includes('salad') || text.includes('bowl')) return 'Healthy';
  
  return 'Mixed';
};

export const analyzeOrders = (orders: SwiggyOrder[]): AnalysisResult => {
  const totalOrders = orders.length;
  let totalSpend = 0;
  let totalDeliveryFees = 0;
  
  const restaurantStats: Record<string, { count: number; spend: number; image?: string }> = {};
  const dishStats: Record<string, number> = {};
  const cuisineStats: Record<string, number> = {};
  
  const vegNonVegStats = { veg: 0, nonVeg: 0 };

  // Initialize Category Stats
  const categoryStats = {
    Food: { count: 0, spend: 0 },
    Instamart: { count: 0, spend: 0 },
    Dineout: { count: 0, spend: 0 },
    Genie: { count: 0, spend: 0 }
  };

  const timeDist = {
    morning: 0,   // 6 - 11
    lunch: 0,     // 11 - 15
    afternoon: 0, // 15 - 18
    dinner: 0,    // 18 - 23
    lateNight: 0  // 23 - 6
  };
  
  let maxOrderValue = 0;

  orders.forEach(order => {
    // 1. Total Spend & Delivery
    totalSpend += order.order_total;
    totalDeliveryFees += order.delivery_fee || 0;

    if (order.order_total > maxOrderValue) maxOrderValue = order.order_total;
    
    // 2. Category Segregation
    const type = order.order_type;
    if (categoryStats[type]) {
      categoryStats[type].count += 1;
      categoryStats[type].spend += order.order_total;
    } else {
      categoryStats['Food'].count += 1;
      categoryStats['Food'].spend += order.order_total;
    }

    // 3. Restaurants (Track Image)
    if (order.order_type === 'Food' || order.order_type === 'Dineout') {
        if (!restaurantStats[order.restaurant_name]) {
            restaurantStats[order.restaurant_name] = { count: 0, spend: 0, image: order.restaurant_logo };
        }
        restaurantStats[order.restaurant_name].count += 1;
        restaurantStats[order.restaurant_name].spend += order.order_total;
        
        // Update image if missing and available now
        if (!restaurantStats[order.restaurant_name].image && order.restaurant_logo) {
            restaurantStats[order.restaurant_name].image = order.restaurant_logo;
        }
    }

    // 4. Dishes, Cuisine & Veg/Non-Veg (Only for Food)
    if (order.order_type === 'Food') {
        const itemNames = order.order_items.map(i => i.name);
        const cuisine = detectCuisine(itemNames, order.restaurant_name);
        cuisineStats[cuisine] = (cuisineStats[cuisine] || 0) + 1;

        let isOrderNonVeg = false;
        
        // Check items to determine if order is Veg or Non-Veg
        // Rule: An order is Non-Veg if it contains at least one Non-Veg item.
        // Non-Veg item has is_veg === "0" or 0.
        order.order_items.forEach(item => {
            const name = item.name.trim(); 
            dishStats[name] = (dishStats[name] || 0) + item.quantity;
            
            // Explicitly check for "0" (Non-Veg)
            // Convert to string to safely handle number 0 or string "0"
            const isVegVal = String(item.is_veg);
            
            if (isVegVal === "0") {
                isOrderNonVeg = true;
            }
        });

        if (isOrderNonVeg) {
            vegNonVegStats.nonVeg += 1;
        } else {
            // If it contains no "0" items, we consider it Veg.
            // (Assuming empty items or "1" or undefined falls into Veg category for safety)
            vegNonVegStats.veg += 1;
        }
    }

    // 5. Time
    const date = new Date(order.order_time);
    const hour = date.getHours();

    if (hour >= 6 && hour < 11) timeDist.morning++;
    else if (hour >= 11 && hour < 15) timeDist.lunch++;
    else if (hour >= 15 && hour < 18) timeDist.afternoon++;
    else if (hour >= 18 && hour < 23) timeDist.dinner++;
    else timeDist.lateNight++;
  });

  // Calculate Restaurant Rankings (Sorted by Count Descending)
  const restaurantRankings: RestaurantRank[] = Object.entries(restaurantStats)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      spend: stats.spend,
      image: stats.image
    }))
    .sort((a, b) => b.count - a.count) // Descending by count
    .slice(0, 5); // Keep top 5 for display

  // Calculate Top Restaurant (The #1 spot)
  let topRestName = 'N/A';
  let topRestCount = 0;
  let topRestSpend = 0;
  let topRestImage = undefined;

  if (restaurantRankings.length > 0) {
    topRestName = restaurantRankings[0].name;
    topRestCount = restaurantRankings[0].count;
    topRestSpend = restaurantRankings[0].spend;
    topRestImage = restaurantRankings[0].image;
  }

  // Calculate Top Dish
  let topDishName = 'N/A';
  let topDishCount = 0;
  Object.entries(dishStats).forEach(([name, count]) => {
    if (count > topDishCount) {
      topDishCount = count;
      topDishName = name;
    }
  });

  // Calculate Top Cuisine
  let topCuisineName = 'Mixed';
  let topCuisineCount = 0;
  Object.entries(cuisineStats).forEach(([name, count]) => {
    if (name !== 'Mixed' && count > topCuisineCount) {
      topCuisineCount = count;
      topCuisineName = name;
    }
  });

  // Determine Personality
  const totalFoodOrders = categoryStats.Food.count;
  const totalInstamartOrders = categoryStats.Instamart.count;
  
  let personality = {
    title: "The Balanced Foodie",
    description: "You enjoy a bit of everything at reasonable hours.",
    icon: "🥗"
  };

  const lateNightPercent = (timeDist.lateNight / (totalOrders || 1)) * 100;
  
  if (totalInstamartOrders > totalFoodOrders) {
    personality = {
      title: "The Home Chef",
      description: "You order groceries more than cooked food. Your kitchen is your sanctuary.",
      icon: "🛒"
    };
  } else if (lateNightPercent > 20) {
    personality = {
      title: "Midnight Snacker",
      description: "When the city sleeps, you feast. The night is young and hungry.",
      icon: "🦉"
    };
  } else if (topDishCount > (totalFoodOrders * 0.4)) {
    personality = {
      title: "Comfort Loyalist",
      description: `You know what you like, and you stick to it. ${topDishName} is life.`,
      icon: "🛋️"
    };
  } else if (topCuisineName === 'Biryani' && topCuisineCount > (totalFoodOrders * 0.3)) {
    personality = {
      title: "Biryani Bae",
      description: "In a world of choices, you choose Biryani. Respect.",
      icon: "🍲"
    };
  } else if (topCuisineName === 'Healthy' && topCuisineCount > (totalFoodOrders * 0.3)) {
    personality = {
      title: "Health Nut",
      description: "Macros calculated. Fiber intake optimized. You are the discipline we all need.",
      icon: "🥦"
    };
  } else if (maxOrderValue > 2000 && (totalSpend / (totalOrders || 1)) > 800) {
    personality = {
      title: "The Royal Feast",
      description: "Price is just a number. Taste is everything.",
      icon: "👑"
    };
  }

  // Sort dates
  const sortedDates = orders.map(o => new Date(o.order_time).getTime()).sort();

  return {
    totalOrders,
    totalSpend,
    totalDeliveryFees,
    avgOrderValue: totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0,
    vegNonVegStats,
    categoryStats,
    restaurantRankings, 
    topRestaurant: {
      name: topRestName,
      count: topRestCount,
      spend: topRestSpend,
      image: topRestImage
    },
    topDish: {
      name: topDishName,
      count: topDishCount
    },
    orderingTimeDistribution: timeDist,
    personalityType: personality,
    topCuisine: topCuisineName,
    dateRange: {
      start: sortedDates.length ? new Date(sortedDates[0]).toLocaleDateString() : 'Jan 1',
      end: sortedDates.length ? new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString() : 'Dec 31'
    }
  };
};
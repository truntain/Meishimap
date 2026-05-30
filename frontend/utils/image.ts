export function getBeautifulImage(url: string | null, name: string = ''): string {
  const cleanUrl = url ? url.toLowerCase() : '';
  const cleanName = name ? name.toLowerCase() : '';

  // 1. Check if it's already a valid HTTP(S) URL or local uploaded file / base64 image
  if (
    cleanUrl.startsWith('http://') || 
    cleanUrl.startsWith('https://') || 
    cleanUrl.startsWith('/uploads/') || 
    cleanUrl.startsWith('uploads/') || 
    cleanUrl.startsWith('data:image/') ||
    cleanUrl.startsWith('/')
  ) {
    // If it's a relative path starting with uploads, ensure it points to backend host
    if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('uploads/')) {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const path = url!.startsWith('/') ? url! : `/${url!}`;
      return `${apiBase}${path}`;
    }
    return url!;
  }

  // 2. Resolve based on keywords in URL or Name (ordered from specific to general)

  // --- Specific Vietnamese Dishes ---
  // Match Bún Bò Huế
  if (cleanUrl.includes('bunbo') || cleanName.includes('bún bò')) {
    return 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&auto=format&fit=crop&q=80';
  }
  // Match Bún Chả
  if (cleanUrl.includes('buncha') || cleanName.includes('bún chả')) {
    return 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80';
  }
  // Match Bánh Mì
  if (cleanUrl.includes('banhmi') || cleanName.includes('bánh mì')) {
    return 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=80';
  }
  // Match Phở
  if (cleanUrl.includes('pho') || cleanName.includes('phở')) {
    return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80';
  }

  // --- Fast Food / Fried Chicken / Jollibee ---
  if (
    cleanUrl.includes('jollibee') || cleanName.includes('jollibee') ||
    cleanUrl.includes('chicken') || cleanName.includes('chicken') ||
    cleanName.includes('gà') || cleanUrl.includes('gà') ||
    cleanUrl.includes('fastfood') || cleanName.includes('fastfood') ||
    cleanUrl.includes('fast food') || cleanName.includes('fast food') ||
    cleanUrl.includes('fried') || cleanName.includes('rán')
  ) {
    return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';
  }

  // --- Japanese Noodles (Udon / Ramen) ---
  if (cleanUrl.includes('udon') || cleanName.includes('udon')) {
    // Beautiful Winston Chen Japanese Noodle Bowl Photo ID
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80';
  }
  if (cleanUrl.includes('ramen') || cleanName.includes('ramen') || cleanUrl.includes('noodle') || cleanName.includes('mì')) {
    // If it's specifically Shoyu/Tonkotsu ramen
    if (cleanName.includes('shoyu')) {
      return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&auto=format&fit=crop&q=80';
  }

  // --- Sushi / Sashimi / Omakase ---
  if (
    cleanUrl.includes('sushi') || cleanName.includes('sushi') ||
    cleanUrl.includes('sashimi') || cleanName.includes('sashimi') ||
    cleanUrl.includes('omakase') || cleanName.includes('omakase') ||
    cleanUrl.includes('otoro') || cleanName.includes('bụng cá ngừ')
  ) {
    if (cleanName.includes('sashimi') || cleanUrl.includes('sashimi')) {
      return 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&auto=format&fit=crop&q=80';
    }
    if (cleanName.includes('omakase') || cleanUrl.includes('omakase')) {
      return 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80';
  }

  // --- BBQ / Yakiniku / Steaks / Meat ---
  if (
    cleanUrl.includes('bbq') || cleanName.includes('bbq') ||
    cleanUrl.includes('yakiniku') || cleanName.includes('nướng') ||
    cleanUrl.includes('wagyu') || cleanName.includes('bò') ||
    cleanUrl.includes('karubi') || cleanName.includes('sườn') ||
    cleanName.includes('thịt')
  ) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80';
  }

  // --- Pizza & Pasta ---
  if (cleanUrl.includes('pizza') || cleanName.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80';
  }
  if (cleanUrl.includes('pasta') || cleanName.includes('mì ý')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80';
  }

  // --- Buffet ---
  if (cleanUrl.includes('buffet') || cleanName.includes('buffet')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80';
  }

  // --- Drinks / Cafe / Tea ---
  if (
    cleanUrl.includes('tea') || cleanName.includes('trà') ||
    cleanUrl.includes('milktea') || cleanName.includes('sữa') ||
    cleanUrl.includes('sake') || cleanName.includes('rượu') ||
    cleanUrl.includes('drink') || cleanName.includes('nước') ||
    cleanUrl.includes('shochu') || cleanName.includes('shochu')
  ) {
    if (cleanUrl.includes('sake') || cleanName.includes('sake') || cleanUrl.includes('shochu')) {
      return 'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80';
  }

  // --- Seafood ---
  if (
    cleanUrl.includes('seafood') || cleanName.includes('hải sản') ||
    cleanUrl.includes('oyster') || cleanName.includes('hàu') ||
    cleanUrl.includes('fish') || cleanName.includes('cá')
  ) {
    return 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&auto=format&fit=crop&q=80';
  }

  // --- Gyoza / Dimsum / Dumpling ---
  if (cleanUrl.includes('gyoza') || cleanName.includes('há cảo') || cleanName.includes('gyoza') || cleanName.includes('dumpling')) {
    return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80';
  }

  // --- Okonomiyaki / Pancakes ---
  if (cleanUrl.includes('okonomiyaki') || cleanName.includes('bánh xèo')) {
    return 'https://images.unsplash.com/photo-1592317702816-7243c3938b8c?w=600&auto=format&fit=crop&q=80';
  }

  // --- Appetizers / Salad / Veggies ---
  if (cleanUrl.includes('salad') || cleanName.includes('gỏi') || cleanName.includes('nộm') || cleanName.includes('rau')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80';
  }

  // --- Desserts ---
  if (cleanUrl.includes('ice') || cleanName.includes('kem') || cleanUrl.includes('dessert') || cleanName.includes('tráng miệng')) {
    return 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80';
  }

  // 3. Category/Combo Fallbacks
  if (cleanName.includes('suất') || cleanName.includes('combo') || cleanUrl.includes('combo')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  }

  // General fallback - Neutral beautiful restaurant interior (instead of meat/steak)
  return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
}

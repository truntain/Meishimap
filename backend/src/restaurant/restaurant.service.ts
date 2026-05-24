import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';

export type RestaurantResponse = {
  id: number;
  name: string;
  nameJp: string | null;
  category: string;
  rating: number;
  address: string;
  district: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  phone: string | null;
  imageUrl: string | null;
  hasJapaneseSupport: boolean;
  hours?: any;
  languages?: string;
  reviewCount?: number;
  menuItems?: any[];
};

const MOCK_MENU_ITEMS: Record<string, any[]> = {
  sushi: [
    { id: 101, name: 'Premium Sashimi Set', price: 450000, description: 'Lát cá hồi, cá ngừ, bạch tuộc tươi ngon.', category: 'sashimi', badge: 'Bán chạy nhất' },
    { id: 102, name: 'Sashimi Deluxe', price: 850000, description: 'Sashimi hảo hạng với cá ngừ đại dương, bào ngư.', category: 'sashimi', badge: 'Đặc sản' },
    { id: 103, name: 'Tempura Set', price: 220000, description: 'Tôm và rau củ chiên bột giòn rụm.', category: 'tempura', badge: '' },
    { id: 104, name: 'Matcha Ice Cream', price: 65000, description: 'Kem trà xanh Nhật Bản nguyên chất.', category: 'dessert', badge: '' }
  ],
  ramen: [
    { id: 201, name: 'Tonkotsu Ramen', price: 185000, description: 'Mì Ramen với nước dùng xương hầm 12 tiếng ngon ngọt.', category: 'ramen', badge: 'Bán chạy nhất' },
    { id: 202, name: 'Shoyu Ramen', price: 165000, description: 'Mì Ramen vị nước tương truyền thống thanh nhẹ.', category: 'ramen', badge: '' },
    { id: 203, name: 'Matcha Ice Cream', price: 65000, description: 'Kem trà xanh Nhật Bản nguyên chất.', category: 'dessert', badge: '' }
  ],
  kaiseki: [
    { id: 301, name: 'Sashimi Deluxe', price: 850000, description: 'Sashimi hảo hạng với cá ngừ đại dương, bào ngư.', category: 'sashimi', badge: 'Đặc sản' },
    { id: 302, name: 'Premium Sashimi Set', price: 450000, description: 'Lát cá hồi, cá ngừ, bạch tuộc tươi ngon.', category: 'sashimi', badge: '' },
    { id: 303, name: 'Matcha Ice Cream', price: 65000, description: 'Kem trà xanh Nhật Bản nguyên chất.', category: 'dessert', badge: '' }
  ],
};

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) { }

  async findAll(options: {
    q?: string;
    category?: string;
    sort?: 'rating' | 'name';
  }): Promise<RestaurantResponse[]> {
    const query = this.restaurantRepository.createQueryBuilder('restaurant');

    if (options.category && options.category !== 'all') {
      query.andWhere('restaurant.category = :category', {
        category: options.category,
      });
    }

    if (options.q?.trim()) {
      query.andWhere(
        `(
          restaurant.name ILIKE :q OR
          restaurant.name_jp ILIKE :q OR
          restaurant.address ILIKE :q OR
          restaurant.district ILIKE :q OR
          restaurant.city ILIKE :q OR
          restaurant.category ILIKE :q
        )`,
        { q: `%${options.q.trim()}%` },
      );
    }

    if (options.sort === 'name') {
      query.orderBy('restaurant.name', 'ASC');
    } else {
      query.orderBy('restaurant.rating', 'DESC').addOrderBy('restaurant.name', 'ASC');
    }

    const restaurants = await query.getMany();
    return restaurants.map((restaurant) => this.toResponse(restaurant));
  }

  async findFeatured(): Promise<RestaurantResponse[]> {
    const restaurants = await this.restaurantRepository.find({
      order: {
        rating: 'DESC',
        name: 'ASC',
      },
      take: 6,
    });
    return restaurants.map((restaurant) => this.toResponse(restaurant));
  }

  async findOne(id: number): Promise<RestaurantResponse> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['reviews'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const response = this.toResponse(restaurant);
    response.reviewCount = restaurant.reviews?.length || 0;

    const category = restaurant.category.toLowerCase();
    const menuItems = MOCK_MENU_ITEMS[category] || MOCK_MENU_ITEMS.sushi;
    response.menuItems = menuItems;

    return response;
  }

  private toResponse(restaurant: Restaurant): RestaurantResponse {
    return {
      id: restaurant.id,
      name: restaurant.name,
      nameJp: restaurant.name_jp,
      category: restaurant.category,
      rating: Number(restaurant.rating ?? 0),
      address: restaurant.address,
      district: restaurant.district,
      city: restaurant.city,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      description: restaurant.description,
      phone: restaurant.phone,
      imageUrl: restaurant.image_url,
      hasJapaneseSupport: restaurant.has_japanese_support,
      hours: {
        monday: '10:00 - 22:00',
        tuesday: '10:00 - 22:00',
        wednesday: '10:00 - 22:00',
        thursday: '10:00 - 22:00',
        friday: '10:00 - 22:00',
        saturday: '10:00 - 23:00',
        sunday: '10:00 - 23:00',
      },
      languages: restaurant.has_japanese_support ? 'Tiếng Việt, Tiếng Nhật, English' : 'Tiếng Việt, English',
      reviewCount: 0,
    };
  }
}

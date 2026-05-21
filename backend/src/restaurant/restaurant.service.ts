import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-item.entity';

export type MenuItemResponse = {
  id: number;
  name: string;
  nameJp: string | null;
  category: string;
  price: number;
  description: string | null;
  descriptionJp: string | null;
  imageUrl: string | null;
  badge: string | null;
};

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
  menuItems?: MenuItemResponse[];
};

@Injectable()
export class RestaurantService implements OnModuleInit {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async onModuleInit() {
    try {
      const menuCount = await this.menuItemRepository.count();
      if (menuCount === 0) {
        const restaurants = await this.restaurantRepository.find();
        if (restaurants.length > 0) {
          const seedItems = [
            { name: 'Premium Sashimi Set', name_jp: 'プレミアム刺身セット', category: 'sashimi', price: 450000, description: 'A curated selection of seasonal fish including Otoro, Sake, and Hamachi.', badge: '✅ Fresh Daily' },
            { name: 'Sashimi Deluxe', name_jp: 'デラックス刺身', category: 'sashimi', price: 380000, description: 'Premium cut fish with authentic wasabi and soy sauce.', badge: '✅ Fresh Daily' },
            { name: 'Tempura Set', name_jp: '天ぷらセット', category: 'tempura', price: 280000, description: 'Crispy light-battered shrimp and vegetables with dipping sauce.', badge: '✅ Fresh Daily' },
            { name: 'Tonkotsu Ramen', name_jp: '豚骨ラーメン', category: 'ramen', price: 195000, description: 'Rich pork bone broth simmered 18 hours, chashu pork, soft egg.', badge: '✅ Signature Dish' },
            { name: 'Shoyu Ramen', name_jp: '醤油ラーメン', category: 'ramen', price: 175000, description: 'Aromatic soy-based broth with tender chicken and bamboo shoots.', badge: '✅ Popular' },
            { name: 'Matcha Ice Cream', name_jp: '抹茶アイスクリーム', category: 'dessert', price: 65000, description: 'Premium Uji matcha ice cream served with red bean paste.', badge: '✅ Seasonal' },
          ];

          for (const restaurant of restaurants) {
            for (const item of seedItems) {
              const newItem = this.menuItemRepository.create({
                ...item,
                restaurantId: restaurant.id,
              });
              await this.menuItemRepository.save(newItem);
            }
          }
          console.log(`[RestaurantService] Seeded menu items for ${restaurants.length} restaurants.`);
        }
      }
    } catch (err) {
      console.error('[RestaurantService] Failed to seed menu items:', err);
    }
  }

  async findAll(options: {
    q?: string;
    category?: string;
    location?: string;
    sort?: 'rating' | 'name';
  }): Promise<RestaurantResponse[]> {
    const query = this.restaurantRepository.createQueryBuilder('restaurant');

    // Left join and select menu items to allow filtering by dish details
    query.leftJoinAndSelect('restaurant.menuItems', 'menuItem');

    const category = options.category?.trim();
    if (category && category !== 'all') {
      query.andWhere('LOWER(restaurant.category) = LOWER(:category)', {
        category,
      });
    }

    const keyword = options.q?.trim();
    if (keyword) {
      query.andWhere(
        `(
          restaurant.name ILIKE :q OR
          restaurant.name_jp ILIKE :q OR
          restaurant.address ILIKE :q OR
          restaurant.district ILIKE :q OR
          restaurant.city ILIKE :q OR
          restaurant.category ILIKE :q OR
          menuItem.name ILIKE :q OR
          menuItem.name_jp ILIKE :q OR
          menuItem.description ILIKE :q
        )`,
        { q: `%${keyword}%` },
      );
    }

    const location = options.location?.trim();
    if (location && location !== 'all') {
      query.andWhere(
        `(
          restaurant.address ILIKE :location OR
          restaurant.district ILIKE :location OR
          restaurant.city ILIKE :location
        )`,
        { location: `%${location}%` },
      );
    }

    if (options.sort === 'name') {
      query.orderBy('restaurant.name', 'ASC');
    } else {
      query
        .orderBy('restaurant.rating', 'DESC')
        .addOrderBy('restaurant.name', 'ASC');
    }

    const restaurants = await query.getMany();
    return restaurants.map((restaurant) => this.toResponse(restaurant));
  }

  async findOne(id: number): Promise<RestaurantResponse> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['menuItems'],
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng!');
    }

    return this.toResponse(restaurant);
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
      menuItems: restaurant.menuItems
        ? restaurant.menuItems.map((item) => ({
            id: item.id,
            name: item.name,
            nameJp: item.name_jp,
            category: item.category,
            price: Number(item.price),
            description: item.description,
            descriptionJp: item.description_jp,
            imageUrl: item.image_url,
            badge: item.badge,
          }))
        : [],
    };
  }
}

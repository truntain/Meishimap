import { Injectable } from '@nestjs/common';
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
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-item.entity';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ApprovalStatus } from '../common/enums';
import * as fs from 'fs';
import { join } from 'path';


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
  status?: string;
  rejectReason?: string | null;
  openingTime?: string;
  closingTime?: string;
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
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) { }

  private saveBase64File(base64Str: string | undefined, folderName: string): string | null {
    if (!base64Str) return null;
    
    // Check if it's already a URL/path
    if (base64Str.startsWith('http://') || base64Str.startsWith('https://') || base64Str.startsWith('/uploads/')) {
      return base64Str;
    }

    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    let extension = 'png';
    if (mimeType.includes('pdf')) {
      extension = 'pdf';
    } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      extension = 'jpg';
    } else if (mimeType.includes('webp')) {
      extension = 'webp';
    } else if (mimeType.includes('gif')) {
      extension = 'gif';
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    const uploadDir = join(process.cwd(), 'uploads', folderName);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const filePath = join(uploadDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${folderName}/${fileName}`;
  }

  async findAll(options: {
    q?: string;
    category?: string;
    location?: string;
    sort?: 'rating' | 'name';
  }): Promise<RestaurantResponse[]> {
    const query = this.restaurantRepository.createQueryBuilder('restaurant');

    // Always load menuItems so that they are present in the response
    query.leftJoinAndSelect('restaurant.menuItems', 'menuItems');

    query.andWhere('restaurant.status = :status', {
      status: ApprovalStatus.APPROVED,
    });

    let hasFilterMenuItemJoin = false;
    const ensureFilterMenuItemJoin = () => {
      if (!hasFilterMenuItemJoin) {
        query.leftJoin('restaurant.menuItems', 'filterMenuItem');
        hasFilterMenuItemJoin = true;
      }
    };

    if (options.category && options.category !== 'all') {
      const cat = options.category.toLowerCase();
      ensureFilterMenuItemJoin();

      if (cat === 'sushi_sashimi') {
        query.andWhere(
          `(restaurant.category ILIKE :sushi OR restaurant.category ILIKE :sashimi OR restaurant.category ILIKE :seafood OR restaurant.category ILIKE :maki OR
            filterMenuItem.category ILIKE :sushi OR filterMenuItem.category ILIKE :sashimi OR filterMenuItem.category ILIKE :seafood OR filterMenuItem.category ILIKE :maki OR
            filterMenuItem.name ILIKE :sushi OR filterMenuItem.name ILIKE :sashimi OR filterMenuItem.name ILIKE :seafood OR filterMenuItem.name ILIKE :maki OR
            filterMenuItem.name_jp ILIKE :sushi OR filterMenuItem.name_jp ILIKE :sashimi OR filterMenuItem.name_jp ILIKE :seafood OR filterMenuItem.name_jp ILIKE :maki)`,
          { sushi: '%sushi%', sashimi: '%sashimi%', seafood: '%seafood%', maki: '%maki%' }
        );
      } else if (cat === 'ramen_udon_soba') {
        query.andWhere(
          `(restaurant.category ILIKE :ramen OR restaurant.category ILIKE :udon OR restaurant.category ILIKE :soba OR restaurant.category ILIKE :noodle OR
            filterMenuItem.category ILIKE :ramen OR filterMenuItem.category ILIKE :udon OR filterMenuItem.category ILIKE :soba OR filterMenuItem.category ILIKE :noodle OR
            filterMenuItem.name ILIKE :ramen OR filterMenuItem.name ILIKE :udon OR filterMenuItem.name ILIKE :soba OR filterMenuItem.name ILIKE :noodle OR
            filterMenuItem.name_jp ILIKE :ramen OR filterMenuItem.name_jp ILIKE :udon OR filterMenuItem.name_jp ILIKE :soba OR filterMenuItem.name_jp ILIKE :noodle)`,
          { ramen: '%ramen%', udon: '%udon%', soba: '%soba%', noodle: '%noodle%' }
        );
      } else if (cat === 'yakiniku_bbq') {
        query.andWhere(
          `(restaurant.category ILIKE :bbq OR restaurant.category ILIKE :yakiniku OR restaurant.category ILIKE :grill OR
            filterMenuItem.category ILIKE :bbq OR filterMenuItem.category ILIKE :yakiniku OR filterMenuItem.category ILIKE :grill OR
            filterMenuItem.name ILIKE :bbq OR filterMenuItem.name ILIKE :yakiniku OR filterMenuItem.name ILIKE :grill OR
            filterMenuItem.name_jp ILIKE :bbq OR filterMenuItem.name_jp ILIKE :yakiniku OR filterMenuItem.name_jp ILIKE :grill)`,
          { bbq: '%bbq%', yakiniku: '%yakiniku%', grill: '%grill%' }
        );
      } else if (cat === 'izakaya') {
        query.andWhere(
          `(restaurant.category ILIKE :izakaya OR restaurant.category ILIKE :nhau OR
            filterMenuItem.category ILIKE :izakaya OR filterMenuItem.category ILIKE :nhau OR
            filterMenuItem.name ILIKE :izakaya OR filterMenuItem.name ILIKE :nhau OR
            filterMenuItem.name_jp ILIKE :izakaya OR filterMenuItem.name_jp ILIKE :nhau)`,
          { izakaya: '%izakaya%', nhau: '%nhậu%' }
        );
      } else if (cat === 'omakase_kaiseki') {
        query.andWhere(
          `(restaurant.category ILIKE :omakase OR restaurant.category ILIKE :kaiseki OR
            filterMenuItem.category ILIKE :omakase OR filterMenuItem.category ILIKE :kaiseki OR
            filterMenuItem.name ILIKE :omakase OR filterMenuItem.name ILIKE :kaiseki OR
            filterMenuItem.name_jp ILIKE :omakase OR filterMenuItem.name_jp ILIKE :kaiseki)`,
          { omakase: '%omakase%', kaiseki: '%kaiseki%' }
        );
      } else {
        query.andWhere(
          `(restaurant.category ILIKE :category OR
            filterMenuItem.category ILIKE :category OR
            filterMenuItem.name ILIKE :category OR
            filterMenuItem.name_jp ILIKE :category)`,
          { category: `%${options.category}%` }
        );
      }
    }

    if (options.location && options.location !== 'all') {
      query.andWhere('restaurant.district ILIKE :location', {
        location: `%${options.location.trim()}%`,
      });
    }

    if (options.q?.trim()) {
      ensureFilterMenuItemJoin();
      query.andWhere(
        `(
          restaurant.name ILIKE :q OR
          restaurant.name_jp ILIKE :q OR
          restaurant.address ILIKE :q OR
          restaurant.district ILIKE :q OR
          restaurant.city ILIKE :q OR
          restaurant.category ILIKE :q OR
          filterMenuItem.name ILIKE :q OR
          filterMenuItem.name_jp ILIKE :q OR
          filterMenuItem.description ILIKE :q
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
    const query = this.restaurantRepository.createQueryBuilder('restaurant');
    
    query.andWhere('restaurant.status = :status', {
      status: ApprovalStatus.APPROVED,
    });
    
    query.andWhere('restaurant.category ILIKE :category', {
      category: '%japanese%',
    });
    
    query.orderBy('restaurant.rating', 'DESC').addOrderBy('restaurant.name', 'ASC');
    query.take(4);
    
    const restaurants = await query.getMany();
    return restaurants.map((restaurant) => this.toResponse(restaurant));
  }

  async findOne(id: number): Promise<RestaurantResponse> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['reviews', 'menuItems'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const response = this.toResponse(restaurant);
    response.reviewCount = restaurant.reviews?.length || 0;

    response.menuItems = restaurant.menuItems?.map(item => ({
      id: item.id,
      name: item.name,
      price: `${Number(item.price).toLocaleString('vi-VN')}đ`,
      cat: item.category,
      icon: item.emoji || item.badge || '🍣',
      imageUrl: item.image_url || '',
      desc: item.description || '',
    })) || [];

    return response;
  }

  async findByOwner(ownerId: number): Promise<RestaurantResponse> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
      relations: ['reviews', 'menuItems'],
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của chủ nhà hàng này');
    }

    const response = this.toResponse(restaurant);
    response.reviewCount = restaurant.reviews?.length || 0;

    response.menuItems = restaurant.menuItems?.map(item => ({
      id: item.id,
      name: item.name,
      price: `${Number(item.price).toLocaleString('vi-VN')}đ`,
      cat: item.category,
      icon: item.emoji || item.badge || '🍣',
      imageUrl: item.image_url || '',
      desc: item.description || '',
    })) || [];

    return response;
  }

  async updateByOwner(ownerId: number, dto: UpdateRestaurantDto): Promise<RestaurantResponse> {
    let restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!restaurant) {
      // Create a new restaurant for this owner
      restaurant = this.restaurantRepository.create({
        owner: { id: ownerId } as any,
        name: dto.name || 'Nhà hàng mới của tôi',
        category: 'sushi',
        address: dto.address || 'Địa chỉ nhà hàng',
        latitude: 21.03,
        longitude: 105.85,
      });
    }

    if (dto.name !== undefined) restaurant.name = dto.name;
    if (dto.phone !== undefined) restaurant.phone = dto.phone;
    if (dto.address !== undefined) restaurant.address = dto.address;
    if (dto.district !== undefined) restaurant.district = dto.district;
    if (dto.city !== undefined) restaurant.city = dto.city;
    if (dto.latitude !== undefined) restaurant.latitude = dto.latitude;
    if (dto.longitude !== undefined) restaurant.longitude = dto.longitude;
    if (dto.image_url !== undefined) {
      const saved = this.saveBase64File(dto.image_url, 'restaurants');
      restaurant.image_url = saved || dto.image_url;
    }
    if (dto.imageUrl !== undefined) {
      const saved = this.saveBase64File(dto.imageUrl, 'restaurants');
      restaurant.image_url = saved || dto.imageUrl;
    }
    if (dto.has_japanese_support !== undefined) restaurant.has_japanese_support = dto.has_japanese_support;
    if (dto.hasJapaneseSupport !== undefined) restaurant.has_japanese_support = dto.hasJapaneseSupport;
    if (dto.description !== undefined) restaurant.description = dto.description;
    if (dto.openingTime !== undefined) restaurant.opening_time = dto.openingTime;
    if (dto.opening_time !== undefined) restaurant.opening_time = dto.opening_time;
    if (dto.closingTime !== undefined) restaurant.closing_time = dto.closingTime;
    if (dto.closing_time !== undefined) restaurant.closing_time = dto.closing_time;

    const updatedRestaurant = await this.restaurantRepository.save(restaurant);
    return this.findOne(updatedRestaurant.id);
  }

  async addMenuItem(ownerId: number, dto: CreateMenuItemDto) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của bạn');
    }

    const imageUrl = this.saveBase64File(dto.image_url || dto.imageUrl, 'menu-items');

    const menuItem = this.menuItemRepository.create({
      restaurant_id: restaurant.id,
      name: dto.name,
      name_jp: dto.name_jp || dto.nameJp || null,
      category: dto.category,
      price: dto.price,
      description: dto.description || null,
      image_url: imageUrl || null,
      badge: dto.badge || null,
      emoji: dto.icon || null,
    });

    await this.menuItemRepository.save(menuItem);
    return this.findByOwner(ownerId);
  }

  async updateMenuItem(ownerId: number, itemId: number, dto: UpdateMenuItemDto) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của bạn');
    }

    const menuItem = await this.menuItemRepository.findOne({
      where: { id: itemId, restaurant_id: restaurant.id },
    });

    if (!menuItem) {
      throw new NotFoundException('Không tìm thấy món ăn này trong thực đơn của bạn');
    }

    if (dto.name !== undefined) menuItem.name = dto.name;
    if (dto.name_jp !== undefined) menuItem.name_jp = dto.name_jp;
    if (dto.nameJp !== undefined) menuItem.name_jp = dto.nameJp;
    if (dto.category !== undefined) menuItem.category = dto.category;
    if (dto.price !== undefined) menuItem.price = dto.price;
    if (dto.description !== undefined) menuItem.description = dto.description;
    if (dto.image_url !== undefined) {
      menuItem.image_url = this.saveBase64File(dto.image_url, 'menu-items');
    }
    if (dto.imageUrl !== undefined) {
      menuItem.image_url = this.saveBase64File(dto.imageUrl, 'menu-items');
    }
    if (dto.badge !== undefined) menuItem.badge = dto.badge;
    if (dto.icon !== undefined) menuItem.emoji = dto.icon;

    await this.menuItemRepository.save(menuItem);
    return this.findByOwner(ownerId);
  }

  async deleteMenuItem(ownerId: number, itemId: number) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của bạn');
    }

    const menuItem = await this.menuItemRepository.findOne({
      where: { id: itemId, restaurant_id: restaurant.id },
    });

    if (!menuItem) {
      throw new NotFoundException('Không tìm thấy món ăn này trong thực đơn của bạn');
    }

    await this.menuItemRepository.remove(menuItem);
    return this.findByOwner(ownerId);
  }


  private formatTime(timeStr: string | null | undefined, defaultTime: string): string {
    if (!timeStr) return defaultTime;
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  }

  private toResponse(restaurant: Restaurant): RestaurantResponse {
    const formattedOpen = this.formatTime(restaurant.opening_time, '08:00');
    const formattedClose = this.formatTime(restaurant.closing_time, '22:00');

    const response: RestaurantResponse = {
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
        monday: `${formattedOpen} - ${formattedClose}`,
        tuesday: `${formattedOpen} - ${formattedClose}`,
        wednesday: `${formattedOpen} - ${formattedClose}`,
        thursday: `${formattedOpen} - ${formattedClose}`,
        friday: `${formattedOpen} - ${formattedClose}`,
        saturday: `${formattedOpen} - ${formattedClose}`,
        sunday: `${formattedOpen} - ${formattedClose}`,
      },
      languages: restaurant.has_japanese_support ? 'Tiếng Việt, Tiếng Nhật, English' : 'Tiếng Việt, English',
      reviewCount: 0,
      status: restaurant.status,
      rejectReason: restaurant.rejectReason,
      openingTime: formattedOpen,
      closingTime: formattedClose,
    };

    if (restaurant.menuItems) {
      response.menuItems = restaurant.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        nameJp: item.name_jp,
        price: Number(item.price),
        description: item.description,
        category: item.category,
        imageUrl: item.image_url || '',
        icon: item.emoji || item.badge || '🍣',
      }));
    }

    return response;
  }
}

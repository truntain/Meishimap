import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async findByRestaurant(restaurantId: number) {
    return this.reviewRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}

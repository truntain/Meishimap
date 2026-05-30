import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { User } from '../user/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByRestaurant(restaurantId: number) {
    return this.reviewRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createReviewDto: CreateReviewDto, userId: number): Promise<Review> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: createReviewDto.restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const review = this.reviewRepository.create({
      restaurant,
      user,
      stars: createReviewDto.stars,
      title: createReviewDto.title,
      content: createReviewDto.content,
      visitDate: createReviewDto.visitDate,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Cập nhật lại điểm đánh giá trung bình của nhà hàng
    await this.updateRestaurantRating(restaurant.id);

    return savedReview;
  }

  async findByOwner(ownerId: number) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });
    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của bạn');
    }
    return this.reviewRepository.find({
      where: { restaurant: { id: restaurant.id } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async reply(reviewId: number, ownerId: number, replyText: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['restaurant', 'restaurant.owner'],
    });
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }
    if (!review.restaurant.owner || review.restaurant.owner.id !== ownerId) {
      throw new NotFoundException('Bạn không sở hữu nhà hàng có đánh giá này');
    }
    review.ownerReply = replyText;
    return this.reviewRepository.save(review);
  }

  async report(reviewId: number, ownerId: number, reason: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['restaurant', 'restaurant.owner'],
    });
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }
    if (!review.restaurant.owner || review.restaurant.owner.id !== ownerId) {
      throw new NotFoundException('Bạn không sở hữu nhà hàng có đánh giá này');
    }
    review.isReported = true;
    review.reportReason = reason;
    return this.reviewRepository.save(review);
  }

  private async updateRestaurantRating(restaurantId: number) {
    const reviews = await this.reviewRepository.find({
      where: { restaurant: { id: restaurantId } },
    });
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.stars, 0);
      const avg = sum / reviews.length;
      await this.restaurantRepository.update(restaurantId, {
        rating: avg.toFixed(1),
      });
    } else {
      await this.restaurantRepository.update(restaurantId, {
        rating: '0.0',
      });
    }
  }

  async findAll() {
    return this.reviewRepository.find({
      relations: ['user', 'restaurant'],
      order: { createdAt: 'DESC' },
    });
  }

  async dismissReport(reviewId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }
    review.isReported = false;
    review.reportReason = null;
    return this.reviewRepository.save(review);
  }

  async delete(reviewId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['restaurant'],
    });
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }
    const restaurantId = review.restaurant?.id;
    await this.reviewRepository.remove(review);
    if (restaurantId) {
      await this.updateRestaurantRating(restaurantId);
    }
    return { success: true };
  }

  async adminClear(reviewId: number, clearContent?: boolean, clearReply?: boolean) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['restaurant'],
    });
    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá');
    }
    if (clearContent) {
      review.content = '';
      review.isReported = false;
      review.reportReason = null;
    }
    if (clearReply) {
      review.ownerReply = null;
    }
    return this.reviewRepository.save(review);
  }
}

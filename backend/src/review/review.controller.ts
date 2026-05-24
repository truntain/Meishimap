import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('restaurant/:id')
  findByRestaurant(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.findByRestaurant(id);
  }
}

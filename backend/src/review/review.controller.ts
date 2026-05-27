import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request, Patch, Delete, ForbiddenException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  findAll(@Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Chỉ admin mới có quyền thực hiện hành động này');
    }
    return this.reviewService.findAll();
  }

  @Get('restaurant/:id')
  findByRestaurant(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.findByRestaurant(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-restaurant')
  findMyRestaurant(@Request() req) {
    return this.reviewService.findByOwner(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reply')
  reply(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('replyText') replyText: string,
  ) {
    return this.reviewService.reply(id, req.user.userId, replyText);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  report(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('reason') reason: string,
  ) {
    return this.reviewService.report(id, req.user.userId, reason);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/dismiss-report')
  dismissReport(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Chỉ admin mới có quyền thực hiện hành động này');
    }
    return this.reviewService.dismissReport(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Chỉ admin mới có quyền thực hiện hành động này');
    }
    return this.reviewService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewService.create(createReviewDto, req.user.userId);
  }
}

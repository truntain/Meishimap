import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiOperation({ summary: 'Lấy danh sách nhà hàng cho màn tìm kiếm' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['rating', 'name'] })
  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('sort') sort?: 'rating' | 'name',
  ) {
    return this.restaurantService.findAll({ q, category, sort });
  }
}

import { Controller, Get, Query, Param, ParseIntPipe, UseGuards, Request, Body, Patch, Post, Delete } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';



@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) { }

  @ApiOperation({ summary: 'Lấy danh sách nhà hàng nổi bật cho trang chủ' })
  @Get('featured')
  findFeatured() {
    return this.restaurantService.findFeatured();
  }

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

  @ApiOperation({ summary: 'Lấy thông tin nhà hàng của chủ tài khoản hiện tại' })
  @UseGuards(JwtAuthGuard)
  @Get('my-restaurant')
  findMyRestaurant(@Request() req) {
    return this.restaurantService.findByOwner(req.user.userId);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin nhà hàng của chủ tài khoản hiện tại' })
  @UseGuards(JwtAuthGuard)
  @Patch('my-restaurant')
  updateMyRestaurant(@Request() req, @Body() updateDto: UpdateRestaurantDto) {
    return this.restaurantService.updateByOwner(req.user.userId, updateDto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin nhà hàng của chủ tài khoản hiện tại (POST)' })
  @UseGuards(JwtAuthGuard)
  @Post('my-restaurant')
  updateMyRestaurantPost(@Request() req, @Body() updateDto: UpdateRestaurantDto) {
    return this.restaurantService.updateByOwner(req.user.userId, updateDto);
  }

  @ApiOperation({ summary: 'Thêm món ăn mới vào thực đơn' })
  @UseGuards(JwtAuthGuard)
  @Post('my-restaurant/menu-items')
  addMenuItem(@Request() req, @Body() createDto: CreateMenuItemDto) {
    return this.restaurantService.addMenuItem(req.user.userId, createDto);
  }

  @ApiOperation({ summary: 'Cập nhật món ăn trong thực đơn' })
  @UseGuards(JwtAuthGuard)
  @Patch('my-restaurant/menu-items/:itemId')
  updateMenuItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateDto: UpdateMenuItemDto,
  ) {
    return this.restaurantService.updateMenuItem(req.user.userId, itemId, updateDto);
  }

  @ApiOperation({ summary: 'Xóa món ăn khỏi thực đơn' })
  @UseGuards(JwtAuthGuard)
  @Delete('my-restaurant/menu-items/:itemId')
  deleteMenuItem(@Request() req, @Param('itemId', ParseIntPipe) itemId: number) {
    return this.restaurantService.deleteMenuItem(req.user.userId, itemId);
  }

  @ApiOperation({ summary: 'Lấy chi tiết nhà hàng' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantService.findOne(id);
  }
}

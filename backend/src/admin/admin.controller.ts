import { 
  Controller, Get, Post, Body, Param, ParseIntPipe, 
  UseGuards, Request, ForbiddenException 
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(req: any) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }
  }

  @Get('stats')
  getStats(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getStats();
  }

  @Get('approvals')
  getApprovals(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getApprovals();
  }

  @Post('approvals/:id/approve')
  approveRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    this.checkAdmin(req);
    return this.adminService.approveRestaurant(id);
  }

  @Post('approvals/:id/reject')
  rejectRestaurant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('rejectReason') rejectReason: string,
  ) {
    this.checkAdmin(req);
    return this.adminService.rejectRestaurant(id, rejectReason);
  }
}

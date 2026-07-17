import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  NotificationChannel,
  NotificationEvent,
} from '../generated/prisma/client';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get notifications',
  })
  getNotifications(
    @Request() req: any,
    @Query('event') event?: NotificationEvent,
    @Query('isRead') isRead?: string,
  ) {
    return this.notificationsService.getNotifications({
      tenantId: req.user.tenantId,
      userId: req.user.userId ?? req.user.sub,
      event,
      isRead:
        isRead === undefined
          ? undefined
          : isRead === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
  })
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(
      req.user.tenantId,
      req.user.userId ?? req.user.sub,
    );
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read',
  })
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(
      req.user.tenantId,
      req.user.userId ?? req.user.sub,
    );
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark one notification as read',
  })
  markAsRead(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(
      req.user.tenantId,
      id,
      req.user.userId ?? req.user.sub,
    );
  }

  @Get('preferences/me')
  @ApiOperation({
    summary: 'Get notification preferences',
  })
  getPreferences(@Request() req: any) {
    return this.notificationsService.getPreferences(
      req.user.tenantId,
      req.user.userId ?? req.user.sub,
    );
  }

  @Post('preferences/me')
  @ApiOperation({
    summary: 'Create or update notification preference',
  })
  @ApiBody({
    schema: {
      example: {
        event: 'LOW_STOCK',
        channel: 'EMAIL',
        enabled: true,
      },
    },
  })
  updatePreference(
    @Request() req: any,
    @Body()
    body: {
      event: NotificationEvent;
      channel: NotificationChannel;
      enabled: boolean;
    },
  ) {
    return this.notificationsService.updatePreference(
      req.user.tenantId,
      req.user.userId ?? req.user.sub,
      body,
    );
  }

  @Post('deliveries/process')
  @ApiOperation({
    summary: 'Process pending notification deliveries',
  })
  processDeliveries() {
    return this.notificationsService.processPendingDeliveries();
  }
}
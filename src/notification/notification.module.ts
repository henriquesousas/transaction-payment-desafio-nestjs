import { Module } from '@nestjs/common';
import { NOTIFICATION_SERVICE } from '@app/core/feature/notification/notification.service';
import { EmailNotificationService } from './email-notification.service';
import { HttpModule } from '@app/core/common/http/http.module';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: NOTIFICATION_SERVICE,
      useClass: EmailNotificationService,
    },
  ],
  exports: [NOTIFICATION_SERVICE],
})
export class NotificationModule {}

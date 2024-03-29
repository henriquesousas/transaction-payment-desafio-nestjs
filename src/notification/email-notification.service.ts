import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';
import { NotificationServie } from '@app/core/feature/notification/notification.service';

@Injectable()
export class EmailNotificationService implements NotificationServie {
  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
  ) {}
  async send(): Promise<boolean> {
    const request = this.http
      .get(this.configService.get('NOTIFICATION_URL'))
      .pipe(
        map((res) => {
          return res.data.message;
        }),
      )
      .pipe(
        catchError((error) => {
          throw new HttpException(
            error.response.data,
            error.response.status ?? 500,
          );
        }),
      );
    return await lastValueFrom(request);
  }
}

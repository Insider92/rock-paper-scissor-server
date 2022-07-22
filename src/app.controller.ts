import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// import { ApiTags } from '@nestjs/swagger';
import { HttpHealthIndicator, HealthCheckService } from '@nestjs/terminus';

@Controller('v1/app')
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get('health')
  @ApiTags('app')
  check(): any {
    // Just a dummy function
    // Could be used to check memory and database for the given environment
    return this.health.check([
      async (): Promise<any> =>
        this.http.pingCheck('aerq', 'https://www.aerq.com/'),
    ]);
  }
}

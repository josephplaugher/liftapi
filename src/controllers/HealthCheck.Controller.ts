import { Controller, Get } from '@nestjs/common';

@Controller('healthcheck')
export default class HealthCheck {
    @Get()
    getHealth() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}

import { BadRequestException, Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/middleware/JwtGuard';
import { Auth0JwtPayload } from 'src/models/JwtAuthPayload';
import PrService from 'src/service/PrService';

@UseGuards(JwtAuthGuard)
@Controller('pr')
export default class PrController {
    constructor(private readonly prService: PrService) { }

    @Get(':name')
    async getByLiftName(@Param('name') name: string, @Req() req: { user: Auth0JwtPayload }) {
        try {
            return await this.prService.getByLiftName(req.user.sub, name);
        } catch (error: any) {
            console.log(error);
            throw new BadRequestException(`could not get personal record for ${name}`);
        }
    }
}

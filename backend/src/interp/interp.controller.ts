import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { InterpretationService } from './interp.service'
import { AuthGuard } from '@nestjs/passport'
import { DrawService } from './draw.service'

@Controller('api/interp')
export class InterpretationController {
  constructor(private readonly service: InterpretationService, private readonly drawService: DrawService) {}

  @Get()
  async getOne(
    @Query('card_name') card_name: string,
    @Query('category') category: string,
    @Query('position') position: string,
    @Query('language') language: string,
  ) {
    return this.service.findOne({ card_name, category, position, language })
  }

  @Get('draw')
  async draw(@Query('category') category?: string, @Query('language') language = 'en') {
    return this.drawService.draw(category, language)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('import')
  async importData(@Body() body: { items: any[] }) {
    return this.service.importMany(body.items)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('export')
  async exportData() {
    return this.service.exportAll()
  }
}

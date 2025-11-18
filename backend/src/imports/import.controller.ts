import { Controller, Post, UseGuards, UploadedFile, UseInterceptors, Res, Get } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Interpretation } from '../entities/interpretation.entity'
import { parse } from '@fast-csv/parse'
import { format } from '@fast-csv/format'
import type { Response } from 'express'
import type { Express } from 'express'

@Controller('api/import')
@UseGuards(AuthGuard('jwt'))
export class ImportController {
  constructor(@InjectRepository(Interpretation) private repo: Repository<Interpretation>) {}

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file?: Express.Multer.File) {
    if (!file) return { error: 'No file' }
    const rows: any[] = []
    await new Promise<void>((resolve, reject) => {
      parse({ headers: true })
        .on('error', reject)
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve())
        .write(file.buffer)
    })
    const entities = rows.map((r) => ({
      card_name: r.card_name,
      category: r.category,
      position: r.position,
      language: r.language,
      summary: r.summary,
      interpretation: r.interpretation,
      action: r.action,
      future: r.future,
      recommendation: r.recommendation ? JSON.parse(r.recommendation) : null,
    }))
    const saved = await this.repo.save(this.repo.create(entities))
    return { count: saved.length }
  }

  @Get('csv')
  async exportCsv(@Res() res: Response) {
    const data = await this.repo.find()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="interpretations.csv"')
    const csvStream = format({ headers: true })
    csvStream.pipe(res)
    data.forEach((item) => {
      csvStream.write({
        card_name: item.card_name,
        category: item.category,
        position: item.position,
        language: item.language,
        summary: item.summary,
        interpretation: item.interpretation,
        action: item.action,
        future: item.future,
        recommendation: item.recommendation ? JSON.stringify(item.recommendation) : '',
      })
    })
    csvStream.end()
  }
}

import { Body, Controller, Post } from '@nestjs/common';

@Controller('api/questionnaire')
export class QuestionnaireController {
  @Post()
  async submit(@Body() body: { q1: string; q2: string; q3: string }) {
    // No persistence for now; echo back
    return { received: body };
  }
}

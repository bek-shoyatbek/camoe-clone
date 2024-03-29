import { Module } from '@nestjs/common';

import { GeneratorsService } from './generators.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GeneratorsService],
})
export class GeneratorsModule {}

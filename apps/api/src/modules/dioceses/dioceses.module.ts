import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diocese } from '@companion/entities';

import { DiocesesController } from './dioceses.controller';
import { DiocesesService } from './dioceses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Diocese])],
  controllers: [DiocesesController],
  providers: [DiocesesService],
})
export class DiocesesModule {}

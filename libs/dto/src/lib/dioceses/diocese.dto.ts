import { ApiProperty } from '@nestjs/swagger';
import {
  DIOCESE_PUBLICATION_STATUSES,
  DIOCESE_TYPES,
  type DiocesePublicationStatus,
  type DioceseType,
} from '@companion/entities';

export class DioceseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: DIOCESE_TYPES, enumName: 'DioceseType' })
  type!: DioceseType;

  @ApiProperty({ format: 'uuid', type: String, nullable: true })
  provinceId!: string | null;

  @ApiProperty()
  seatCity!: string;

  @ApiProperty()
  state!: string;

  @ApiProperty({ enum: DIOCESE_PUBLICATION_STATUSES, enumName: 'DiocesePublicationStatus' })
  publicationStatus!: DiocesePublicationStatus;
}

export class DiocesePageDto {
  @ApiProperty({ type: [DioceseDto] })
  items!: DioceseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Pass as cursor for the next page; null on the last page',
  })
  nextCursor!: string | null;
}

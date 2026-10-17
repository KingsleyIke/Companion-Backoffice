import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { decodeCursor, encodeCursor } from '@companion/common';
import type { CursorPageQueryDto, DioceseDto, DiocesePageDto } from '@companion/dto';
import { Diocese } from '@companion/entities';

@Injectable()
export class DiocesesService {
  constructor(@InjectRepository(Diocese) private readonly dioceses: Repository<Diocese>) {}

  // Public listing: only published dioceses, enforced here in the query rather than by callers.
  async listPublished({ cursor, limit }: CursorPageQueryDto): Promise<DiocesePageDto> {
    const query = this.dioceses
      .createQueryBuilder('diocese')
      .where('diocese.publicationStatus = :published', { published: 'published' })
      .orderBy('diocese.name', 'ASC')
      .addOrderBy('diocese.id', 'ASC')
      .limit(limit + 1);

    if (cursor !== undefined) {
      // The id is bound as a uuid parameter: anything else would fail in Postgres as a 500.
      const after = decodeCursor(cursor, 2);
      if (!after || !isUUID(after[1])) {
        throw new BadRequestException('Invalid cursor');
      }
      const [name, id] = after;
      query.andWhere('(diocese.name, diocese.id) > (:name, :id)', { name, id });
    }

    const rows = await query.getMany();
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];
    return {
      items: page.map(toDioceseDto),
      nextCursor: hasMore ? encodeCursor([last.name, last.id]) : null,
    };
  }
}

function toDioceseDto(diocese: Diocese): DioceseDto {
  return {
    id: diocese.id,
    name: diocese.name,
    slug: diocese.slug,
    type: diocese.type,
    provinceId: diocese.provinceId,
    seatCity: diocese.seatCity,
    state: diocese.state,
    publicationStatus: diocese.publicationStatus,
  };
}

import { writeFileSync } from 'node:fs';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app/app.module';
import { configureApp, createOpenApiDocument } from '../src/app/configure-app';

// Preview mode builds the route map without instantiating providers, so no database is needed.
async function generate(outputPath: string): Promise<void> {
  const app = await NestFactory.create(AppModule, { preview: true, logger: false });
  configureApp(app);
  const document = createOpenApiDocument(app);
  // A property whose type Swagger cannot infer (a nullable or an inferred type) is published as an
  // empty Object schema. Fail instead, so every DTO property gets an explicit type.
  if (document.components?.schemas?.['Object']) {
    throw new Error(
      'OpenAPI spec contains an untyped Object schema: give the DTO property an explicit type',
    );
  }
  writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
}

generate(process.argv[2] ?? 'libs/contracts/openapi.json');

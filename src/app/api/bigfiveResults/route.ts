import { NextRequest, NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { BigFiveResultEntity } from '../../../entities/BigFiveResultEntity';
import { AICoachingPromptEntity } from '../../../entities/AICoachingPromptEntity';
import { parse } from 'csv-parse/sync';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [BigFiveResultEntity, AICoachingPromptEntity],
  migrations: [],
  subscribers: [],
});

export async function POST(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const repository = AppDataSource.getRepository(BigFiveResultEntity);

    // Expecting body to be JSON with testId and files content as array of { filename, content }
    const body = await request.json();
    const { testId, files } = body;

    if (!testId || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Invalid request format, expected testId and files array' }, { status: 400 });
    }

    const entities: BigFiveResultEntity[] = [];

    for (const file of files) {
      const records = parse(file.content, {
        columns: true,
        skip_empty_lines: true,
      });

      // Determine if category or subcategory by checking if categories match main traits
      const mainTraits = ['Neuroticism', 'Extraversion', 'Openness To Experience', 'Agreeableness', 'Conscientiousness'];
      const isCategory = records.every((r: any) => mainTraits.includes(r.category));

      for (const record of records) {
        const entity = new BigFiveResultEntity();
        entity.category = record.category;
        entity.score = parseInt(record.You, 10);
        entity.comment = '';
        entity.userTestId = testId;
        entity.resultType = isCategory ? 'category' : 'subcategory';
        entities.push(entity);
      }
    }

    await repository.save(entities);

    return NextResponse.json({ message: 'BigFive results imported successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const url = new URL(request.url);
    const testId = url.searchParams.get('testId');
    if (!testId) {
      return NextResponse.json({ error: 'Missing testId query parameter' }, { status: 400 });
    }
    const repository = AppDataSource.getRepository(BigFiveResultEntity);
    const results = await repository.find({ where: { userTestId: testId } });

    // Group results by resultType for easier frontend consumption
    const categories = results.filter(r => r.resultType === "category");
    const subcategories = results.filter(r => r.resultType === "subcategory");

    return NextResponse.json({
      categories,
      subcategories,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
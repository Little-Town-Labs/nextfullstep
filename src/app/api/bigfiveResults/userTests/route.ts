import { NextRequest, NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { BigFiveResultEntity } from '../../../../entities/BigFiveResultEntity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [BigFiveResultEntity],
  migrations: [],
  subscribers: [],
});

export async function GET(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const repository = AppDataSource.getRepository(BigFiveResultEntity);
    const userTestIds = await repository
      .createQueryBuilder('result')
      .select('DISTINCT result.userTestId', 'userTestId')
      .getRawMany();
    return NextResponse.json(userTestIds.map(row => row.userTestId));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
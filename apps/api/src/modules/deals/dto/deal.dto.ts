import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DealStatus } from '@prisma/client';

export class CreateDealDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  pipelineId!: string;

  @IsString()
  stageId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  expectedClose?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class MoveDealDto {
  @IsString()
  stageId!: string;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;
}

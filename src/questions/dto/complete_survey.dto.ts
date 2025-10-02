import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionAnswerDto {
  @IsNumber()
  @IsNotEmpty()
  no: number;

  @IsString()
  @IsNotEmpty()
  level: '기초' | '경험' | '응용';

  @IsNumber()
  @IsNotEmpty()
  value: number;
}

export class AnswerBlockDto {
  @IsString()
  @IsNotEmpty()
  tag: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  questions: QuestionAnswerDto[];
}

export class CompleteSurveyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerBlockDto)
  answers: AnswerBlockDto[];
}

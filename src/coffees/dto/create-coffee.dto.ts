import { IsNotEmpty, IsNumber, IsString, IsUrl, MaxLength, Min, MinLength, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoffeeDto {
  // não pode ser vazio
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  // mínimo de 10 e máximo de 200 caracteres
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  description: string;

  // número positivo com até 2 casas decimais
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @IsUrl()
  imageUrl: string;

  @IsArray()
  @IsNotEmpty()
  tags: string[];
} 
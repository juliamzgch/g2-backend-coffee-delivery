import { IsNotEmpty, IsString, IsInt, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AddItemDto {
  @IsNotEmpty()
  @IsString()
  coffeeId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  price: number;
} 
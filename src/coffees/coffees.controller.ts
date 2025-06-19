import { Controller, Get, Post, Delete, Body, Param, HttpStatus, HttpCode, Query, Patch } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  // a) GET /coffees - Listar todos os cafés disponíveis
  @Get()
  async findAll() {
    return this.coffeesService.findAll();
  }

  // b) GET /coffees/:id - Obter detalhes de um café específico
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(id);
  }

  // c) POST /coffees - Criar um novo café
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  // d) PATCH /coffees/:id - Atualizar informações de um café
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  // e) DELETE /coffees/:id - Remover um café do catálogo
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
  }

  @Get('search')
  async search(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('name') name?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    const tagsList = tags ? tags.split(',') : [];
    
    return this.coffeesService.searchCoffees({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      name,
      tags: tagsList,
      limit: +limit,
      offset: +offset,
    });
  }

} 
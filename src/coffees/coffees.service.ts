import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { start } from 'repl';
import { skip } from '@prisma/client/runtime/library';
import { filter, min, take } from 'rxjs';

@Injectable()
export class CoffeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const coffees = await this.prisma.coffee.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return coffees.map(coffee => ({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    }));
  }

  async findOne(id: string) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee with ID ${id} not found`);
    }

    return {
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    };
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    // código aqui

    const { name, description, price, imageUrl, tags } = createCoffeeDto;

    const existingCoffee = await this.prisma.coffee.findFirst({
      where: { name },
    });

    if (existingCoffee) {
      throw new BadRequestException(`Coffee with name: ${name} already exists`);
    }

    const coffee = await this.prisma.coffee.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        tags: {
          create: tags.map(tag => ({
            tag: {
              connectOrCreate: {
                where: { name: tag },
                create: { name: tag },
              },
            },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        }
      }
    });

    return {
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag.name),
      message: "Coffee created sucessfully"
    }
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id }
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee with ID ${id} not found`)
    }

    const { name, description, price, imageUrl, tags } = updateCoffeeDto;

    if (tags) {
      await this.prisma.coffeeTag.deleteMany({
        where: { coffeeId: id }
      });

      await Promise.all(
        tags.map(tag => 
          this.prisma.coffeeTag.create({
            data: {
              coffee: { connect: { id }},
              tag: {
                connectOrCreate: {
                  where: { name: tag },
                  create: { name: tag },
                },
              },
            },
          }),
        ),
      );
    }

    const updatedCoffee = await this.prisma.coffee.update({
      where: { id },
      data: {
        name,
        description,
        price,
        imageUrl,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });


    // Atualizar os dados do café
    return {
      ...updatedCoffee,
      tags: updatedCoffee.tags.map(coffeeTag => coffeeTag.tag.name),
      message: "Coffee updated sucessfully"
    }
  }


  async remove(id: string) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee with ID ${id} not found`);
    }

    const deletedCoffee = await this.prisma.coffee.delete({
      where: { id },
    });

    return {
      coffee: deletedCoffee,
      message: "Coffee deleted sucessfully"
    }
  }

  async searchCoffees(params: {
    startDate?: Date;
    endDate?: Date;
    minPrice?: number;
    maxPrice?: number;
    name?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
    const { startDate, endDate, minPrice, maxPrice, name, tags, limit = 10, offset = 0 } = params;

    // Construir o filtro
    const filter: any = {}

    // Filtro por data
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.gte = startDate;
      }
      if (endDate) {
        filter.createdAt.lte = endDate;
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.gte = minPrice;
      }
      if (maxPrice) {
        filter.price.lte = maxPrice;
      }
    }

    // Filtro por nome
    if (name) {
      filter.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    // Filtro por tags
    if (tags && tags.length > 0) {
      filter.tags = {
        some: {
          tag: {
            name: {
              in: tags,
            },
          },
        },
      };
    }
  

    // Buscar os cafés com paginação
    const coffees = await 
      this.prisma.coffee.findMany({
        where: filter,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        skip: offset,
        take: limit,
      });

    // Formatar a resposta

    const formatted = coffees.map(coffee => ({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag.name),
    }));

    return {
      data: formatted,
      pagination: {
        limit,
        offset,
        hasMore: coffees.length === limit,
      },
    };
  }
} 
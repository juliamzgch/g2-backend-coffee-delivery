import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { threadId } from 'worker_threads';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            coffee: true, // Inclui os detalhes do café associado ao item
          },
        },
      },
    });
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    return cart;
  }

  async addItem(cartId: string, addItemDto: AddItemDto) {
    const { coffeeId, quantity } = addItemDto;

    // Verificar se o café existe
    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee with ID ${coffeeId} not found`);
    }

    return this.prisma.cartItem.create({
      data: {
        cartId,
        coffeeId,
        quantity,
        unitPrice: coffee.price,
      },
      include: {
        coffee: true, // Inclui os detalhes do café associado ao item
      },
    });
  }

  async updateItem(cartId: string, itemId: string, updateItemDto: UpdateItemDto) {
    // Verificar se o item existe no carrinho
    const item = await this.prisma.cartItem.findUnique({
      where: {
        id: itemId,
        cartId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart ${cartId}`);
    }

    if (updateItemDto.quantity > 5) {
      throw new BadRequestException("Quantity cannot be greater than 5") 
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: updateItemDto.quantity, // Atualiza a quantidade do item
      },
      include: {
        coffee: true, // Inclui os detalhes do café associado ao item
      }
    });
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: {
        id: itemId,
        cartId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in cart ${cartId}`);
    }
    try {
      await this.prisma.cartItem.delete({
        where: { id: itemId },
        include: {
          coffee: true, // Inclui os detalhes do café associado ao item
        },
      });
    }
    catch (error) {
      throw new BadRequestException(`Error removing item with ID ${itemId} from cart ${cartId}`);
    }
    
  }
} 
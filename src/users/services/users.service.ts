import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { Order } from '../entities/order.entiti';
import { ProductsService } from 'src/products/services/products.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private productService: ProductsService,
    //ejemplo injeccion de dependencias
    //@Inject('API_KEY') private apiKey: string,
    //injeccion de dpendencias
    private configService: ConfigService,
  ) {}

  private counterId = 1;
  private users: User[] = [
    {
      id: 1,
      email: 'correo@mail.com',
      password: '12345',
      role: 'admin',
    },
  ];

  findAll() {
    const apiKey = this.configService.get('API_KEY');
    const dbname = this.configService.get('DATABASE_NAME');
    console.log(apiKey, dbname);

    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  create(data: CreateUserDto) {
    this.counterId = this.counterId + 1;
    const newUser = {
      id: this.counterId,
      ...data,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, changes: UpdateUserDto) {
    const user = this.findOne(id);
    const index = this.users.findIndex((item) => item.id === id);
    this.users[index] = {
      ...user,
      ...changes,
    };
    return this.users[index];
  }

  remove(id: number) {
    const index = this.users.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`User #${id} not found`);
    }
    this.users.splice(index, 1);
    return true;
  }

  //creamos el servicio que retorna las ordenes de un usuario
  getOrderByUser(id: number): Order {
    //reutiliamos la funcion de obtener un usuario
    const user = this.findOne(id);

    //retornamos un objeto tipo orden
    return {
      date: new Date(),
      user,
      products: this.productService.findAll().filter((item) => item.id === id),
    };
  }
}

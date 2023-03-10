import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { firstValueFrom } from 'rxjs';
import { HttpModule, HttpService } from '@nestjs/axios';
import { DatabaseModule } from './database/database.module';
import { enviroments } from './enviroments';
import { AppController } from './app.controller';
import config from './config';

@Module({
  //imports nos sirve para importan otros modulos y separar los controladores y servicios
  imports: [
    ProductsModule,
    UsersModule,
    HttpModule,
    DatabaseModule,
    //agregamos el modulo de nest para variables de entorno y especificamos la ruta de donde jalara la config y ponemos como global
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV] || '.env',
      //carga el objeto de la estructura de la config
      load: [config],
      isGlobal: true,
      //agreamos una validacion de esquema
      validationSchema: Joi.object({
        API_KEY: Joi.number().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      //agregamos un provider
      provide: 'TASKS',
      //permiten manda valores desde un peticion asincrona
      useFactory: async (http: HttpService) => {
        const response = http.get('https://jsonplaceholder.typicode.com/todos');
        const tasks = await firstValueFrom(response);
        return tasks.data;
      },
      //injectamos HttpServices
      inject: [HttpService],
    },
  ],
})
export class AppModule {}

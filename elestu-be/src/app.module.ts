import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './users/user.module'
import { StudioModule } from './studios/studio.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { User } from './users/user.entity'
import {Service} from "./services/service.entity";
import {Studio} from "./studios/studio.entity";
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'EleStuAdmin',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'EleStu',
      entities: [User,Service,Studio],
      synchronize: false, // Disable auto-sync
      logging: true,
    }),
    AuthModule,
    UserModule,
    StudioModule,
    ServicesModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
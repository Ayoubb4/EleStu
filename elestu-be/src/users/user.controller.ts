import { Controller, Get, Param, Post, Body, Logger } from '@nestjs/common'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private userService: UserService) {}

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string) {
        return this.userService.findById(parseInt(id));
    }

    @Post('register')
    async register(@Body() userData: any) {
        this.logger.log(`Solicitud de registro recibida: ${JSON.stringify(userData)}`);
        try {
            const result = await this.userService.create(userData);
            this.logger.log('Usuario registrado exitosamente');
            return result;
        } catch (error) {
            this.logger.error(`Error en el registro: ${error.message}`);
            throw error;
        }
    }
}
import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
// Make sure @types/multer is installed (npm install --save-dev @types/multer)
// This type should be available globally if @types/multer is correctly set up.
// If you still have issues, you might need to adjust tsconfig.json or use 'any' as a last resort.

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // Crear un servicio con archivo
  @Post()
  @UseInterceptors(FileInterceptor('image')) // Para procesar el archivo 'image'
  async create(@Body() createServiceDto: CreateServiceDto, @UploadedFile() file: Express.Multer.File) {
    console.log("User ID recibido en el backend:", createServiceDto.userid);
    console.log('Recibiendo solicitud para crear servicio:', createServiceDto);
    if (file) {
      console.log('Archivo recibido:', file.originalname);
      createServiceDto.image = file.filename;
    }
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.servicesService.findOne(id);
  }
}

import { IsNumber, IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateServiceBookingDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    serviceId: number;

    @IsEmail()
    @IsNotEmpty()
    userEmail: string;

    @IsString()
    @IsNotEmpty()
    serviceTitle: string;

    @IsString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    time: string;

    @IsString()
    @IsOptional()
    description?: string | null;

    @IsNumber()
    @IsNotEmpty()
    price: number;
}
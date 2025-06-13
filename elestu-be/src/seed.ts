// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServicesService } from './services/services.service';
import { User } from './users/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateServiceDto } from './services/dto/create-service.dto';
import axios from 'axios';

const serviceData = {
    Cantante: {
        titles: ['Cantante para Eventos y Bodas', 'Voz para Jingles Publicitarios', 'Corista de Estudio Profesional'],
        descriptions: [
            'Ofrezco mi voz versátil para bodas, fiestas y eventos corporativos. Amplio repertorio de baladas, pop y rock.',
            'Creación de melodías y grabación de jingles para marcas. Entrega rápida y profesional.',
            'Aporto armonías y coros para grabaciones de estudio. Experiencia en múltiples géneros musicales.',
        ],
        keywords: 'singer,microphone,singing,vocalist',
    },
    Productor: {
        titles: ['Producción de Beats de Trap/Hip-Hop', 'Mezcla y Mastering Profesional', 'Producción Musical Completa'],
        descriptions: [
            'Creo beats originales y modernos para artistas de trap y hip-hop. Listos para usar en tus temas.',
            'Servicio de mezcla y mastering para llevar tus canciones al siguiente nivel. Sonido potente y claro.',
            'Te ayudo a desarrollar tu canción desde la idea inicial hasta el producto final. Arreglos, producción y post-producción.',
        ],
        keywords: 'music,producer,studio,mixing,console',
    },
    DJ: {
        titles: ['DJ para Fiestas y Discotecas', 'Sesiones de Deep House & Techno', 'DJ de Bodas con Equipo Propio'],
        descriptions: [
            'Animo cualquier tipo de fiesta con los mejores éxitos actuales y clásicos. Experiencia en discotecas y eventos privados.',
            'Sesiones especializadas en Deep House, Tech House y Techno para clubs y festivales. Ambiente elegante y contundente.',
            'Servicio completo de DJ para bodas, incluyendo equipo de sonido e iluminación profesional. Planificación musical personalizada.',
        ],
        keywords: 'dj,turntable,mixer,club,party',
    },
    'Músico de Sesión': {
        titles: ['Guitarrista de Sesión (Eléctrica/Acústica)', 'Bajista para Grabaciones', 'Baterista de Estudio'],
        descriptions: [
            'Grabo guitarras eléctricas o acústicas para tus producciones. Me adapto a cualquier estilo, desde rock hasta flamenco.',
            'Líneas de bajo sólidas y creativas para tus canciones. Equipo profesional para un sonido de alta calidad.',
            'Baterista con amplia experiencia en estudio. Grabo pistas de batería dinámicas y con pegada para tu proyecto.',
        ],
        keywords: 'guitar,bass,drums,musician,instrument',
    },
    Compositor: {
        titles: ['Composición de Letras y Melodías', 'Bandas Sonoras para Cortometrajes', 'Arreglos Musicales para Artistas'],
        descriptions: [
            'Creo letras y melodías originales para cantantes y bandas. Trabajo contigo para capturar tu visión artística.',
            'Composición de música original para proyectos audiovisuales. Aporto la emoción que tu historia necesita.',
            'Desarrollo arreglos de cuerdas, vientos o teclados para enriquecer tus composiciones.',
        ],
        keywords: 'composer,sheet,music,piano,writing',
    },
    Otro: {
        titles: ['Técnico de Sonido en Directo', 'Clases de Producción Musical', 'Diseño de Sonido para Videojuegos'],
        descriptions: [
            'Ofrezco mis servicios como técnico de sonido para conciertos y eventos en directo. Garantizo una calidad de audio impecable.',
            'Clases particulares de producción musical con Ableton Live o Logic Pro X. Para todos los niveles.',
            'Creación de efectos de sonido (SFX) y ambientes para videojuegos y aplicaciones interactivas.',
        ],
        keywords: 'sound,audio,engineer,technology',
    },
};

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('✅ Aplicación iniciada. Conectando a servicios...');

    const servicesService = app.get(ServicesService);
    const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

    const existingUsers = await usersRepository.find();
    if (existingUsers.length === 0) {
        console.error('❌ Error: No hay usuarios en la base de datos. Por favor, crea al menos un usuario antes de ejecutar el seed.');
        await app.close();
        return;
    }
    console.log(`ℹ️  Encontrados ${existingUsers.length} usuarios existentes.`);

    for (const serviceType of Object.keys(serviceData)) {
        console.log(`\n🌱 Creando 3 servicios de tipo: ${serviceType}...`);
        for (let i = 0; i < 3; i++) {
            const randomUser = existingUsers[Math.floor(Math.random() * existingUsers.length)];
            const randomIndex = Math.floor(Math.random() * serviceData[serviceType].titles.length);

            // --- CORREGIDO: Declaramos explícitamente el tipo de la variable ---
            let imageAsBase64: string | null = null;
            try {
                console.log(`   - Descargando imagen para "${serviceData[serviceType].titles[randomIndex]}"...`);
                const imageUrl = `https://source.unsplash.com/400x300/?${serviceData[serviceType].keywords}`;
                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

                // --- CORREGIDO: Le decimos a TypeScript que response.data es un ArrayBuffer ---
                const buffer = Buffer.from(response.data as ArrayBuffer);
                const mimeType = response.headers['content-type'];
                imageAsBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
                console.log(`   - Imagen convertida a Base64.`);

            } catch (imageError) {
                console.error(`   🔥 Error al descargar/convertir la imagen:`, imageError.message);
                // Si hay un error, imageAsBase64 se quedará como null, lo cual es correcto.
            }

            const serviceToCreate: CreateServiceDto = {
                title: serviceData[serviceType].titles[randomIndex],
                description: serviceData[serviceType].descriptions[randomIndex],
                price: Math.floor(Math.random() * (500 - 50 + 1) + 50),
                serviceType: serviceType,
                userid: randomUser.id,
                image: imageAsBase64, // Ahora 'imageAsBase64' es de tipo string | null, compatible con el DTO
            };

            try {
                await servicesService.create(serviceToCreate);
                console.log(`   👍 Servicio '${serviceToCreate.title}' creado y asignado al usuario ${randomUser.id}.`);
            } catch (error) {
                console.error(`   🔥 Error al crear el servicio '${serviceToCreate.title}':`, error.message);
            }
        }
    }

    console.log('\n✅ Proceso de semillado completado.');
    await app.close();
}

bootstrap();
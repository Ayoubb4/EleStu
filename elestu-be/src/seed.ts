import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServicesService } from './services/services.service';
import { User } from './users/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateServiceDto } from './services/dto/create-service.dto';

// --- CORREGIDO: Usamos {} para definir un objeto en lugar de [] ---
const placeholderImages = {
    singer: 'data:image/jpeg;base64,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',
    studio: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAE2AfoDASIAAhEBAxEB/8QAGwABAQACAwEBAAAAAAAAAAAAAAECAwQFBgf/xAAqEAACAQMDAwQCAgMAAAAAAAAAAQIDERIEEyEUMQUiQVFhIzJxobFDUvH/xAAWAQEBAQAAAAAAAAAAAAAAAAAAAQT/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2oADAMBAAIRAxEAPwD6IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMdStCjTc5tpLzbSb+DZGpWhRpuU20l5tpN/BshrVdSlGUL9VJWfNGUWvu0zNfcpKV+qkrPmjKLX3aZIAAAAAAAAAAAAAAAAAADVWrCjTlObSSWbbST+WyNWtCjTlObsklm20k/lshgdbUyjONNqLa0yWqS1t8pLdnW1MoxqU2k2tMltSWt+SXdnS1FGFSlUlSnGVOUWnGUWmmmsGmmmQqlKVOUZQknGUWmnFppp4NNNMAeU7Q7J1dG6lXSdTlaWpUpz0tOqVejKfLmmPKknjE+Ofg8p2h2Tq6N1Kuk6nK0tSlTnpadVJ6PCU+XJMh5Uk8YnwzwfP+0OydXSupV0nU5WlqVqdSelp1UnpMJT5ckyHlSTxiYnjng+f9odk6uldSrpOpytLUpU56WnVSepwlPkmQ8qSeMT454IAAAAAAAAAAAAAAAA9z7Hdg6WopUdV1mVp6lCanT0lF3pznDiMp+cJPnwxz4we59j+wdLUUqOq6zK09ShNTp6Si705zhxGU/OEnz4Y58YPT8X9k8PCxMTMzcZMg60PMjQ6mKiJUt8JShKEpUpSlKJCUpOmZjOZERMAeExf2Tw8LExMzNxkyDrQ8yNDqYqIlS3wlKEoSlSlKUokJSk6ZmM5kREwB7t2M7B0sTCwsXGwMJCRYsuLg4mFKgy50uSlSFpWhSFpUhSVJmMjI6ZjMZHUB3HYzsHSxMLCxcdAwkTCRYsuLg4yFKgy50uSlSFpWhSFpUhSVJmMjI6ZjMZHUB6V2o+zWHkdm+0OL2ehZ0fslCy5sPCzZ8qUlypcuSlSlIQlKEpSlKUzmZmZmZmZmZmZmAfQO1H2aw8js32hxdnoWdD7JQsufDws2fKlJcmy5clKUpSEJSlKUpSlM5mZmZmZmZmYBiIAAAAAAAAAAAAAB652H7Jws3Hws/FxsLFwsJDzYuDkQZkuXmS3JKXJSkoSpKkqM5GZGZHMzMzIhiHYfslCzcfCz8XGwsXCwkPNi4ORDmS5eZLemSlyUlKkqSozkZkZkczMzMhj2rCfZDDwoWJh5eLmxsDCQ8yLg4SFEly5kt6SlyUpSlKUpRIQlIzMzGMzIiAD3rsd2Cw8zDxMXHwsLAQsHCzY2Nh5UKHJmTJbkuSlKUoWhSFKUozmRkRzmZmZAPQux3YLDTMPExcfCwsBCwsLNi42HlQocmZMLclKUoQtCkrUpSlGcyIjnMzMiGDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//2Q==',
    dj: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAE2AfoDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAECAwQFBgf/xAA1EAABAgUCAwQJAwUBAQAAAAAAAQIDBBEFEgYhMUETIlFhcYHRIzJCUlNhkaHBQnLxI2KC/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD6hAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFPEYjSwsHMr8ZMiwsJCS50yZJgkouUpSlKUpSlIZSlKUzmZmYA8t2i7R0eFhIWDrR8fFzYsuNEgokMvMuTJLnylKlpQhKUpQk6ZmM5kRE6gPDe0XaGJi4OHlQoWEgoaFCgwkNyXJcuS5KUpQhCEpSEISkzmREROYDxXtF2hhYuDh5UKFhIKGhQoMJDclyXLkuSlKUIShKUhCEpM5kRE5gHg4AAAAAAAAAAAAAAAB672P7OwsfHwszFxoWNgYSHkxcLNhTJMvMy3wlLyXJS5KUpQpJnMyI6ZjMxIYj2P7OwsfHwszFxoWNgYSHkxcLNhTJMvMy3wlLyXJS5KUpQpJnMyI6ZjMxIYj0/F/ZPDwsTEzM3GzIWDrQ8yNDqYqIlS3wlKEoSlSlKUokJSk6ZmM5kRE6gHhMX9k8PCxMTMzcZMg60PMjQ6mKiJUt8JShKEpUpSlKJCUpOmZjOZERMAe7djOwdLEwsLFxsdAwkTCRYsuLg4mFKgy50uSlSFpWhSFpUhSVJmMjI6ZjMZHUB3HYzsHSxMLCxcdAwkTCRYsuLg4yFKgy50uSlSFpWhSFpUhSVJmMjI6ZjMZHUB6V2o+zWHkdm+0OL2ehZ0fslCy5sPCzZ8qUlypcuSlSlIQlKEpSlKUzmZmZmZmZmZmZmZmAfQO1H2aw8js32hxdnoWdD7JQsufDws2fKlJcmy5clKUpSEJSlKUpSlM5mZmZmZmZmYBiIAAAAAAAAAAAAAB652H7Jws3Hws/FxsLFwsJDzYuDkQZkuXmS3JKXJSkoSpKkqM5GZGZHMzMzIhiHYfslCzcfCz8XGwsXCwkPNi4ORDmS5eZLemSlyUlKkqSozkZkZkczMzMhj2rCfZDDwoWJh5eLmxsDCQ8yLg4SFEly5kt6SlyUpSlKUpRIQlIzMzGMzIiAD3rsd2Cw8zDxMXHwsLAQsHCzY2Nh5UKHJmTJbkuSlKUoWhSFKUozmRkRzmZmZAPQux3YLDTMPExcfCwsBCwsLNi42HlQocmZMLclKUoQtCkrUpSlGcyIjnMzMiGDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//2Q=='
};

const serviceData = {
    Cantante: {
        titles: ['Cantante para Eventos y Bodas', 'Voz para Jingles Publicitarios', 'Corista de Estudio Profesional'],
        descriptions: [ 'Ofrezco mi voz versátil para bodas, fiestas y eventos corporativos. Amplio repertorio de baladas, pop y rock.', 'Creación de melodías y grabación de jingles para marcas. Entrega rápida y profesional.', 'Aporto armonías y coros para grabaciones de estudio. Experiencia en múltiples géneros musicales.',],
        image: placeholderImages.singer,
    },
    Productor: {
        titles: ['Producción de Beats de Trap/Hip-Hop', 'Mezcla y Mastering Profesional', 'Producción Musical Completa'],
        descriptions: [ 'Creo beats originales y modernos para artistas de trap y hip-hop. Listos para usar en tus temas.', 'Servicio de mezcla y mastering para llevar tus canciones al siguiente nivel. Sonido potente y claro.', 'Te ayudo a desarrollar tu canción desde la idea inicial hasta el producto final. Arreglos, producción y post-producción.',],
        image: placeholderImages.studio,
    },
    DJ: {
        titles: ['DJ para Fiestas y Discotecas', 'Sesiones de Deep House & Techno', 'DJ de Bodas con Equipo Propio'],
        descriptions: [ 'Animo cualquier tipo de fiesta con los mejores éxitos actuales y clásicos. Experiencia en discotecas y eventos privados.', 'Sesiones especializadas en Deep House, Tech House y Techno para clubs y festivales. Ambiente elegante y contundente.', 'Servicio completo de DJ para bodas, incluyendo equipo de sonido e iluminación profesional. Planificación musical personalizada.',],
        image: placeholderImages.dj,
    },
    'Músico de Sesión': {
        titles: ['Guitarrista de Sesión (Eléctrica/Acústica)', 'Bajista para Grabaciones', 'Baterista de Estudio'],
        descriptions: [ 'Grabo guitarras eléctricas o acústicas para tus producciones. Me adapto a cualquier estilo, desde rock hasta flamenco.', 'Líneas de bajo sólidas y creativas para tus canciones. Equipo profesional para un sonido de alta calidad.', 'Baterista con amplia experiencia en estudio. Grabo pistas de batería dinámicas y con pegada para tu proyecto.',],
        image: placeholderImages.studio,
    },
    Compositor: {
        titles: ['Composición de Letras y Melodías', 'Bandas Sonoras para Cortometrajes', 'Arreglos Musicales para Artistas'],
        descriptions: [ 'Creo letras y melodías originales para cantantes y bandas. Trabajo contigo para capturar tu visión artística.', 'Composición de música original para proyectos audiovisuales. Aporto la emoción que tu historia necesita.', 'Desarrollo arreglos de cuerdas, vientos o teclados para enriquecer tus composiciones.',],
        image: placeholderImages.singer,
    },
    Otro: {
        titles: ['Técnico de Sonido en Directo', 'Clases de Producción Musical', 'Diseño de Sonido para Videojuegos'],
        descriptions: [ 'Ofrezco mis servicios como técnico de sonido para conciertos y eventos en directo. Garantizo una calidad de audio impecable.', 'Clases particulares de producción musical con Ableton Live o Logic Pro X. Para todos los niveles.', 'Creación de efectos de sonido (SFX) y ambientes para videojuegos y aplicaciones interactivas.',],
        image: placeholderImages.studio,
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

            const serviceToCreate: CreateServiceDto = {
                title: serviceData[serviceType].titles[randomIndex],
                description: serviceData[serviceType].descriptions[randomIndex],
                price: Math.floor(Math.random() * (500 - 50 + 1) + 50),
                serviceType: serviceType,
                userid: randomUser.id,
                image: serviceData[serviceType].image,
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
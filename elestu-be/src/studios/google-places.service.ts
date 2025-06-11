// src/studios/google-places.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface GooglePlacesResponse {
    status: string;
    results: any[];
    error_message?: string; // Añadido para mejor feedback de errores
}

function getPhotoUrl(photo_reference: string, apiKey: string, maxwidth = 400) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photo_reference}&key=${apiKey}`;
}

@Injectable()
export class GooglePlacesService {
    private apiKey = process.env.Maps_API_KEY;

    // --- MODIFICADO: Ahora acepta una ciudad opcional para filtrar la búsqueda ---
    async searchRecordingStudios(city?: string) {
        if (!this.apiKey) {
            throw new HttpException('Google Maps API key missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

        // Construimos la consulta dinámicamente
        const query = city
            ? `estudios de grabación en ${city}`
            : 'estudios de grabación en España';

        try {
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: {
                    query,
                    language: 'es', // Añadido: para que los resultados vengan en español
                    key: this.apiKey,
                },
            });

            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new HttpException(
                    `Google Places API error: ${response.data.status} - ${response.data.error_message || ''}`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Si no hay resultados, devolvemos un array vacío
            if (response.data.status === 'ZERO_RESULTS') {
                return [];
            }

            // Mapear para añadir url foto construida
            const places = response.data.results.map(place => ({
                place_id: place.place_id,
                name: place.name,
                formatted_address: place.formatted_address,
                // --- AÑADIDO: Guardamos también la latitud y longitud por si las necesitamos en el futuro ---
                location: place.geometry.location,
                photoUrl: place.photos && place.photos.length > 0
                    ? getPhotoUrl(place.photos[0].photo_reference, this.apiKey!)
                    : null,
            }));

            return places;
        } catch (error) {
            // Mejoramos el log del error
            console.error('Error fetching from Google Places:', error.message);
            throw new HttpException(
                `Error fetching from Google Places: ${error.message}`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
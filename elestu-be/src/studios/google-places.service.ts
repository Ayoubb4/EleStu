// src/studios/google-places.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface GooglePlacesResponse {
    status: string;
    results: any[];
    error_message?: string;
    // --- AÑADIDO: Interfaz para el resultado de la nueva función de detalles ---
    result?: any;
}

function getPhotoUrl(photo_reference: string, apiKey: string, maxwidth = 400) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photo_reference}&key=${apiKey}`;
}

@Injectable()
export class GooglePlacesService {
    private apiKey = process.env.Maps_API_KEY;

    // Búsqueda por texto (la que ya teníamos)
    async searchRecordingStudios(city?: string) {
        if (!this.apiKey) {
            throw new HttpException('Google Maps API key missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
        const query = city ? `estudios de grabación en ${city}` : 'estudios de grabación en España';

        try {
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: {
                    query,
                    language: 'es',
                    key: this.apiKey,
                    fields: 'place_id,name,formatted_address,geometry,photos,rating,user_ratings_total,website,international_phone_number'
                }
            });

            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new HttpException(`Google Places API error: ${response.data.status} - ${response.data.error_message || ''}`, HttpStatus.BAD_REQUEST);
            }
            if (response.data.status === 'ZERO_RESULTS') return [];

            return this.formatPlaces(response.data.results);
        } catch (error) {
            console.error('Error fetching from Google Places Text Search:', error.message);
            throw new HttpException(`Error fetching from Google Places: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // Nuevo método de búsqueda por cercanía (más rápido y preciso)
    async searchStudiosNearby(lat: number, lng: number) {
        if (!this.apiKey) {
            throw new HttpException('Google Maps API key missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

        try {
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: {
                    location: `${lat},${lng}`,
                    // --- AÑADIDO: Comentamos la línea original para no borrarla ---
                    // radius: 50000,
                    // --- AÑADIDO: Nueva línea con el radio corregido para búsquedas locales ---
                    radius: 15000,
                    keyword: 'estudio de grabación',
                    language: 'es',
                    key: this.apiKey,
                },
            });

            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new HttpException(`Google Places API error: ${response.data.status} - ${response.data.error_message || ''}`, HttpStatus.BAD_REQUEST);
            }
            if (response.data.status === 'ZERO_RESULTS') return [];

            return this.formatPlaces(response.data.results);
        } catch (error) {
            console.error('Error fetching from Google Places Nearby Search:', error.message);
            throw new HttpException(`Error fetching from Google Places: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    // --- AÑADIDO: ¡NUEVA FUNCIONALIDAD! Obtener detalles completos de un solo estudio ---
    // Esto es muy útil para la página de vista previa del estudio, puedes obtener hasta las reseñas.
    async getStudioDetails(placeId: string) {
        if (!this.apiKey) {
            throw new HttpException('Google Maps API key missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const url = 'https://maps.googleapis.com/maps/api/place/details/json';

        try {
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: {
                    place_id: placeId,
                    language: 'es',
                    key: this.apiKey,
                    // Pedimos un set de datos muy completo
                    fields: 'name,formatted_address,international_phone_number,website,rating,user_ratings_total,reviews,opening_hours,photos,geometry'
                }
            });

            if (response.data.status !== 'OK') {
                throw new HttpException(`Google Place Details API error: ${response.data.status} - ${response.data.error_message || ''}`, HttpStatus.BAD_REQUEST);
            }

            const place = response.data.result;
            // Devolvemos el lugar con un formato similar al de la búsqueda, pero con más detalles.
            return {
                ...this.formatPlaces([place])[0], // Reutilizamos el formateador
                reviews: place.reviews || [], // Reseñas de usuarios
                opening_hours: place.opening_hours?.weekday_text || [] // Horario de apertura
            };

        } catch (error) {
            console.error('Error fetching from Google Place Details:', error.message);
            throw new HttpException(`Error fetching from Google Place Details: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }


    // Función de ayuda para no repetir código de formateo
    private formatPlaces(places: any[]): any[] {
        return places.map(place => ({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address || place.vicinity || 'Dirección no especificada',
            location: place.geometry.location,
            photoUrl: place.photos && place.photos.length > 0
                ? getPhotoUrl(place.photos[0].photo_reference, this.apiKey!)
                : null,
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            website: place.website || null,
            phone: place.international_phone_number || null,
        }));
    }
}
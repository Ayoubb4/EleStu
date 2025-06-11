// src/studios/google-places.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface GooglePlacesResponse {
    status: string;
    results: any[];
    error_message?: string;
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
            // --- MODIFICADO: Añadimos el parámetro 'fields' para pedir explícitamente los datos que necesitamos ---
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: {
                    query,
                    language: 'es',
                    key: this.apiKey,
                    fields: 'place_id,name,formatted_address,geometry,photos' // <-- ESTA LÍNEA ES LA SOLUCIÓN
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
            // --- MODIFICADO: Aquí también añadimos el parámetro 'fields' para consistencia, aunque Nearby Search devuelve más campos por defecto ---
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: {
                    location: `${lat},${lng}`,
                    radius: 50000,
                    keyword: 'estudio de grabación',
                    language: 'es',
                    key: this.apiKey,
                    // No se usa 'fields' en Nearby Search, pero lo dejamos aquí comentado por si Google cambia su API en el futuro.
                    // A diferencia de Text Search, Nearby Search devuelve la dirección (vicinity) por defecto.
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

    // Función de ayuda para no repetir código de formateo
    private formatPlaces(places: any[]): any[] {
        return places.map(place => ({
            place_id: place.place_id,
            name: place.name,
            // --- MODIFICADO: Usamos 'formatted_address' si existe, si no, 'vicinity' que es lo que devuelve Nearby Search a veces ---
            formatted_address: place.formatted_address || place.vicinity || 'Dirección no especificada',
            location: place.geometry.location,
            photoUrl: place.photos && place.photos.length > 0
                ? getPhotoUrl(place.photos[0].photo_reference, this.apiKey!)
                : null,
        }));
    }
}
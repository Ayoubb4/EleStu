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
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: { query, language: 'es', key: this.apiKey }
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

    // --- AÑADIDO: Nuevo método de búsqueda por cercanía (más rápido y preciso) ---
    async searchStudiosNearby(lat: number, lng: number) {
        if (!this.apiKey) {
            throw new HttpException('Google Maps API key missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

        try {
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: {
                    location: `${lat},${lng}`,
                    radius: 50000, // 50km de radio, un buen radio para una ciudad/provincia
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

    // --- AÑADIDO: Función de ayuda para no repetir código de formateo ---
    private formatPlaces(places: any[]): any[] {
        return places.map(place => ({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            location: place.geometry.location,
            photoUrl: place.photos && place.photos.length > 0
                ? getPhotoUrl(place.photos[0].photo_reference, this.apiKey!)
                : null,
        }));
    }
}
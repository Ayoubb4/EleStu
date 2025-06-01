//src/studios/google-places.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface GooglePlacesResponse {
    status: string;
    results: any[];
}

function getPhotoUrl(photo_reference: string, apiKey: string, maxwidth = 400) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photo_reference}&key=${apiKey}`;
}

@Injectable()
export class GooglePlacesService {
    private apiKey = process.env.Maps_API_KEY;

    async searchRecordingStudiosInSpain() {
        if (!this.apiKey) {
            throw new HttpException('Google Maps API key missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
        const query = 'estudios de grabación en España';

        try {
            const response = await axios.get<GooglePlacesResponse>(url, {
                params: {
                    query,
                    key: this.apiKey,
                },
            });

            if (response.data.status !== 'OK') {
                throw new HttpException(
                    `Google Places API error: ${response.data.status}`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Mapear para añadir url foto construida
            const places = response.data.results.map(place => ({
                place_id: place.place_id,
                name: place.name,
                formatted_address: place.formatted_address,
                photoUrl: place.photos && place.photos.length > 0
                    ? getPhotoUrl(place.photos[0].photo_reference, this.apiKey!)
                    : null,
            }));

            return places;
        } catch (error) {
            throw new HttpException(
                `Error fetching from Google Places: ${error.message}`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}

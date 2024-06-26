import React, { useState } from 'react';
const imageUrl = new URL('./assets/vite.svg', import.meta.url).href;
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useQuery } from 'react-query';

const containerStyle = {
    width: '100%',
    height: '900px',
};

const center = {
    lat: 37.7749,
    lng: -122.4194,
};

interface Coordinate {
    lat: number;
    lng: number;
}

interface CoordinateData {
    timestamp: string;
    coordinates: string; // Adjusted to match the provided data format
}

interface MapComponentProps {
    id: string;
}

const fetchCoordinates = async (id: string): Promise<Coordinate[]> => {
    const response = await fetch(`http://localhost:80/gps/coordinates/rental/${id}`);
    const data: CoordinateData[] = await response.json();
    return data.map(item => JSON.parse(item.coordinates)); // Parse the coordinates string into an object
};

const MapComponent: React.FC<MapComponentProps> = ({ id }) => {
    const [mapCenter, setMapCenter] = useState(center);
    const [carIcon, setCarIcon] = useState<google.maps.Icon | undefined>(undefined);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const { data: coordinates = [], refetch } = useQuery(['coordinates', id], () => fetchCoordinates(id), {
        onSuccess: (coords) => {
            if (coords.length > 0) {
                setMapCenter({
                    lat: coords[0].lat,
                    lng: coords[0].lng,
                });
                fetchDirections(coords);
            }
        },
        onError: (error) => {
            console.error('Error fetching coordinates: ', error);
        },
        refetchOnWindowFocus: false,
    });

    const fetchDirections = (coordinates: Coordinate[]) => {
        if (window.google && window.google.maps && coordinates.length > 1) {
            const waypoints = coordinates.slice(1, -1).map(coord => ({
                location: { lat: coord.lat, lng: coord.lng },
                stopover: true
            }));

            const origin = { lat: coordinates[0].lat, lng: coordinates[0].lng };
            const destination = { lat: coordinates[coordinates.length - 1].lat, lng: coordinates[coordinates.length - 1].lng };

            const directionsService = new window.google.maps.DirectionsService();

            directionsService.route(
                { origin, destination, waypoints, travelMode: window.google.maps.TravelMode.DRIVING },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                        console.error(`Error fetching directions: ${status} - ${JSON.stringify(result)}`);
                    }
                }
            );
        }
    };

    const handleLoad = () => {
        if (window.google && window.google.maps) {
            setCarIcon({
                url: `${imageUrl}`,
                scaledSize: new window.google.maps.Size(50, 50),
            });
            refetch();
        }
    };

    return (
        <LoadScript
            googleMapsApiKey={import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY}
            onLoad={handleLoad}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={15}
            >
                {coordinates.map((coord, index) => (
                    <Marker
                        key={index}
                        position={{ lat: coord.lat, lng: coord.lng }}
                        icon={carIcon}
                    />
                ))}
                {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            polylineOptions: {
                                strokeColor: '#FF0000',
                                strokeOpacity: 1.0,
                                strokeWeight: 2
                            }
                        }}
                    />
                )}
            </GoogleMap>
        </LoadScript>
    );
};

export default MapComponent;

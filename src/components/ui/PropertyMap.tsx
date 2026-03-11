"use client";

import { useEffect, useState, useRef } from "react";
import 'leaflet/dist/leaflet.css';

/* ───────── POIs (Pontos de Interesse) por região ───────── */

interface PoiItem {
    name: string;
    type: 'park' | 'hospital' | 'airport' | 'metro' | 'beach';
    lat: number;
    lng: number;
}

const POIS_DATABASE: Record<string, PoiItem[]> = {
    "São Paulo": [
        { name: "Parque Ibirapuera", type: "park", lat: -23.5874, lng: -46.6576 },
        { name: "Parque Villa-Lobos", type: "park", lat: -23.5467, lng: -46.7236 },
        { name: "Parque do Povo", type: "park", lat: -23.5857, lng: -46.6920 },
        { name: "Parque Augusta", type: "park", lat: -23.5531, lng: -46.6568 },
        { name: "Parque Buenos Aires", type: "park", lat: -23.5396, lng: -46.6618 },
        { name: "Hospital Sírio-Libanês", type: "hospital", lat: -23.5597, lng: -46.6540 },
        { name: "Hospital Albert Einstein", type: "hospital", lat: -23.5988, lng: -46.7147 },
        { name: "Hospital das Clínicas (USP)", type: "hospital", lat: -23.5578, lng: -46.6698 },
        { name: "Aeroporto de Congonhas (CGH)", type: "airport", lat: -23.6261, lng: -46.6564 },
        { name: "Aeroporto de Guarulhos (GRU)", type: "airport", lat: -23.4356, lng: -46.4731 },
        { name: "Estação Consolação", type: "metro", lat: -23.5573, lng: -46.6600 },
        { name: "Estação Paulista", type: "metro", lat: -23.5581, lng: -46.6639 },
        { name: "Estação Trianon-MASP", type: "metro", lat: -23.5568, lng: -46.6622 },
    ],
    "Santos": [
        { name: "Jardim Botânico de Santos", type: "park", lat: -23.9665, lng: -46.3434 },
        { name: "Parque Roberto Mário Santini", type: "park", lat: -23.9710, lng: -46.3277 },
        { name: "Praia de Santos", type: "beach", lat: -23.9730, lng: -46.3320 },
        { name: "Hospital Ana Costa", type: "hospital", lat: -23.9565, lng: -46.3313 },
        { name: "Hospital São Lucas", type: "hospital", lat: -23.9534, lng: -46.3249 },
        { name: "Aeroporto de Guarujá (GJM)", type: "airport", lat: -23.9875, lng: -46.2750 },
    ],
    "Guarujá": [
        { name: "Praia de Pitangueiras", type: "beach", lat: -23.9925, lng: -46.2570 },
        { name: "Praia da Enseada", type: "beach", lat: -23.9977, lng: -46.2292 },
        { name: "Parque Natural da Serra do Guararu", type: "park", lat: -23.9753, lng: -46.1897 },
        { name: "Hospital Santo Amaro", type: "hospital", lat: -23.9890, lng: -46.2525 },
        { name: "Aeroporto de Guarujá (GJM)", type: "airport", lat: -23.9875, lng: -46.2750 },
    ],
};

const POI_CONFIG: Record<string, { color: string; emoji: string; label: string }> = {
    park: { color: '#22c55e', emoji: '🌳', label: 'Parque' },
    hospital: { color: '#ef4444', emoji: '🏥', label: 'Hospital' },
    airport: { color: '#3b82f6', emoji: '✈️', label: 'Aeroporto' },
    metro: { color: '#8b5cf6', emoji: '🚇', label: 'Metrô' },
    beach: { color: '#06b6d4', emoji: '🏖️', label: 'Praia' },
};

interface PropertyMapProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listings: any[];
    singleView?: boolean;
}

/**
 * Mapa que usa Leaflet diretamente (sem react-leaflet) para evitar
 * problemas de SSR e import dinâmico com Next.js.
 */
export default function PropertyMap({ listings, singleView }: PropertyMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstanceRef = useRef<any>(null);
    const [ready, setReady] = useState(false);

    // Determina POIs relevantes
    const firstListing = listings[0];
    const city = firstListing?.address?.city || '';
    const nearbyPois = singleView ? (POIS_DATABASE[city] || []) : [];

    useEffect(() => {
        let cancelled = false;

        // Importa Leaflet apenas no client-side
        import('leaflet').then((L) => {
            if (cancelled || !mapRef.current) return;

            // Se o container já tem mapa inicializado, não cria outro
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((mapRef.current as any)._leaflet_id) return;

            // Fix default icon paths (webpack issue)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            });

            // Centro e zoom
            const lat = firstListing?.latLng?._f_lat || firstListing?.address?.lat || -23.5505;
            const lng = firstListing?.latLng?._f_lng || firstListing?.address?.lng || -46.6333;
            const zoom = singleView ? 14 : 11;

            // Cria o mapa
            const map = L.map(mapRef.current).setView([lat, lng], zoom);
            mapInstanceRef.current = map;

            // Tile layer (CARTO Voyager)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19,
            }).addTo(map);

            // Helper: Cria ícone de emoji
            const makeEmojiIcon = (emoji: string, bgColor: string, size: number = 28) => {
                return L.divIcon({
                    html: `<div style="
                        display:flex;align-items:center;justify-content:center;
                        width:${size}px;height:${size}px;border-radius:50%;
                        background:${bgColor};
                        font-size:${Math.round(size * 0.5)}px;
                        box-shadow:0 2px 6px rgba(0,0,0,0.3);
                        border:2px solid white;
                    ">${emoji}</div>`,
                    className: '',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                    popupAnchor: [0, -(size / 2)],
                });
            };

            // Marcadores dos imóveis
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            listings.forEach((listing: any) => {
                const mLat = listing.latLng?._f_lat || listing.address?.lat;
                const mLng = listing.latLng?._f_lng || listing.address?.lng;
                if (!mLat || !mLng) return;

                const title = listing._mstitle?.pt_BR || 'Unidade Vivare';
                const region = listing.address?.region || listing.address?.city || '';

                const icon = singleView
                    ? makeEmojiIcon('🏠', '#b89a5c', 36)
                    : new L.Icon.Default();

                L.marker([mLat, mLng], { icon })
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family:system-ui;font-size:13px;width:180px">
                            <a href="/unidades/${listing.id}" target="_blank" style="font-weight:bold;color:#1a1a1a;text-decoration:none">
                                ${title}
                            </a>
                            <div style="color:#888;font-size:11px;margin-top:2px">${region}</div>
                        </div>
                    `);
            });

            // Marcadores dos POIs
            nearbyPois.forEach((poi) => {
                const config = POI_CONFIG[poi.type];
                if (!config) return;

                const icon = makeEmojiIcon(config.emoji, config.color);

                L.marker([poi.lat, poi.lng], { icon })
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family:system-ui;font-size:13px">
                            <strong>${poi.name}</strong>
                            <div style="color:#888;font-size:11px">${config.label}</div>
                        </div>
                    `);
            });

            setReady(true);
        });

        // Cleanup
        return () => {
            cancelled = true;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="w-full h-full flex flex-col">
            <div
                ref={mapRef}
                className="w-full flex-1 min-h-[300px]"
                style={{ zIndex: 0 }}
            />

            {/* Legenda dos POIs */}
            {singleView && nearbyPois.length > 0 && ready && (
                <div className="flex flex-wrap gap-2 mt-3 px-1">
                    {Object.entries(POI_CONFIG)
                        .filter(([type]) => nearbyPois.some(p => p.type === type))
                        .map(([type, config]) => (
                            <span key={type} className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                                <span>{config.emoji}</span>
                                <span>{config.label}</span>
                            </span>
                        ))
                    }
                </div>
            )}
        </div>
    );
}

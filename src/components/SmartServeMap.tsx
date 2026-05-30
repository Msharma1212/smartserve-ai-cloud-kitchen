import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Navigation, Bike, Compass, MapPin } from "lucide-react";

interface SmartServeMapProps {
  riderLat: number;
  riderLon: number;
  customerLat: number;
  customerLon: number;
  outletLat: number;
  outletLon: number;
  isMiniMode?: boolean;
}

export default function SmartServeMap({
  riderLat,
  riderLon,
  customerLat,
  customerLon,
  outletLat,
  outletLon,
  isMiniMode = false,
}: SmartServeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const riderMarker = useRef<maplibregl.Marker | null>(null);
  const outletMarker = useRef<maplibregl.Marker | null>(null);
  const customerMarker = useRef<maplibregl.Marker | null>(null);

  // Load stylesheet dynamically
  useEffect(() => {
    const linkId = "maplibre-style-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@4.7.0/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // CartoDB Dark Matter osm tiles
    const styleSpec = {
      version: 8,
      sources: {
        "cartodb-dark": {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap © CARTO"
        }
      },
      layers: [
        {
          id: "dark-tile-layer",
          type: "raster",
          source: "cartodb-dark",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    const initialCenter: [number, number] = [
      (riderLon + customerLon) / 2 || 77.2183,
      (riderLat + customerLat) / 2 || 28.6299,
    ];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleSpec as any,
      center: initialCenter,
      zoom: isMiniMode ? 11 : 13,
      attributionControl: false,
    });

    const m = map.current;

    m.on("load", () => {
      // Add custom orange route source
      m.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [outletLon || 77.2183, outletLat || 28.6299],
              [riderLon || 77.2183, riderLat || 28.6299],
              [customerLon || 77.2183, customerLat || 28.6299],
            ],
          },
        },
      });

      // Add glow line layer
      m.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#f97316",
          "line-width": 6,
          "line-opacity": 0.45,
          "line-blur": 5,
        },
      });

      // Add core line layer
      m.addLayer({
        id: "route-main",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#fb923c",
          "line-width": 2.5,
        },
      });

      // Fetch dynamic OSRM routing
      triggerRouteUpdate();
    });

    // Clean up on component unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update Route Polyline and marker points dynamically
  const triggerRouteUpdate = async () => {
    if (!map.current) return;

    const startCorner = [outletLon || 77.2183, outletLat || 28.6299];
    const endCorner = [customerLon || 77.2183, customerLat || 28.6299];

    try {
      // Fetch public OSRM mapping route geometries on the fly
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCorner[0]},${startCorner[1]};${endCorner[0]},${endCorner[1]}?overview=full&geometries=geojson`
      );

      if (response.ok) {
        const bodyData = await response.json();
        if (bodyData.routes && bodyData.routes[0]) {
          const routeSource = map.current.getSource("route") as maplibregl.GeoJSONSource;
          if (routeSource) {
            routeSource.setData({
              type: "Feature",
              properties: {},
              geometry: bodyData.routes[0].geometry,
            });
          }
        }
      }
    } catch (e) {
      console.warn("OSRM routing offline, fall back to simple direct lines", e);
    }
  };

  // Synchronize dynamic coordinates, markers & bounds updates
  useEffect(() => {
    if (!map.current) return;

    const m = map.current;

    // Kitchen (outlet) marker
    if (!outletMarker.current) {
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center";
      el.style.width = "40px";
      el.style.height = "40px";
      el.innerHTML = `
        <div class="absolute inset-0 rounded-full bg-orange-500/20 animate-ping"></div>
        <div class="relative w-8 h-8 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-sm shadow-xl cursor-default">
          🏪
        </div>
      `;
      outletMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([outletLon || 77.2183, outletLat || 28.6299])
        .addTo(m);
    } else {
      outletMarker.current.setLngLat([outletLon || 77.2183, outletLat || 28.6299]);
    }

    // Customer Target marker
    if (!customerMarker.current) {
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center";
      el.style.width = "40px";
      el.style.height = "40px";
      el.innerHTML = `
        <div class="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"></div>
        <div class="relative w-8 h-8 rounded-full bg-red-650 bg-red-600 border-2 border-white flex items-center justify-center text-sm shadow-lg cursor-default">
          📍
        </div>
      `;
      customerMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([customerLon || 77.2183, customerLat || 28.6299])
        .addTo(m);
    } else {
      customerMarker.current.setLngLat([customerLon || 77.2183, customerLat || 28.6299]);
    }

    // Rider Live Position Tracker
    if (!riderMarker.current) {
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center transition-all duration-1000 ease-out";
      el.style.width = "48px";
      el.style.height = "48px";
      el.innerHTML = `
        <div class="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" style="animation-duration: 3s"></div>
        <div class="relative w-9 h-9 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-lg shadow-2xl animate-bounce" style="animation-duration: 2s">
          🛵
        </div>
      `;
      riderMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([riderLon || 77.2183, riderLat || 28.6299])
        .addTo(m);
    } else {
      // Smooth movement interpolation simulation
      riderMarker.current.setLngLat([riderLon || 77.2183, riderLat || 28.6299]);
    }

    // Auto fit viewport bounds to frame entire transaction track
    try {
      const coordinates = [
        [outletLon || 77.2183, outletLat || 28.6299],
        [riderLon || 77.2183, riderLat || 28.6299],
        [customerLon || 77.2183, customerLat || 28.6299],
      ];

      const bounds = coordinates.reduce(
        (acc, coord) => acc.extend(coord as [number, number]),
        new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
      );

      m.fitBounds(bounds, {
        padding: isMiniMode ? 15 : 65,
        maxZoom: 15,
        duration: 1500,
      });
    } catch (e) {
      console.warn("Bounding box calculation error:", e);
    }

    // Trigger update OSRM
    triggerRouteUpdate();
  }, [riderLat, riderLon, customerLat, customerLon, outletLat, outletLon]);

  return (
    <div className="w-full h-full relative group">
      {/* Container map frame */}
      <div ref={mapContainer} className="w-full h-full" id="smart-serve-maplibre-root" />
      
      {/* Brand Watermark Overlay */}
      <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded text-[9.5px] font-mono border border-slate-800 flex items-center gap-1.5 z-10 text-orange-400 font-extrabold shadow-md leading-none">
        <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
        <span>SMARTSERVE OPENSTREETMAP INTERPOLATION</span>
      </div>
    </div>
  );
}

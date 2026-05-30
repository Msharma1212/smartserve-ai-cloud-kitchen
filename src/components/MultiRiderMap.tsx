import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Order, Rider } from "../types";

interface Props {
  orders: Order[];
  riders: Rider[];
}

export default function MultiRiderMap({ orders, riders }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Load css
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

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleSpec as any,
      center: [77.2183, 28.6299], // Default New Delhi center
      zoom: 11.5,
      attributionControl: false,
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Render Rider and Destination markers
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    // Remove older pins
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add Kitchen Center CP
    const elCP = document.createElement("div");
    elCP.className = "flex items-center justify-center relative";
    elCP.innerHTML = `
      <div class="absolute w-8 h-8 rounded-full bg-orange-500/20 animate-ping"></div>
      <div class="w-7 h-7 rounded-full bg-slate-900 border border-orange-500 flex items-center justify-center text-xs shadow-xl font-bold cursor-pointer">
        🏪
      </div>
    `;
    const cpMarker = new maplibregl.Marker({ element: elCP })
      .setLngLat([77.2183, 28.6299])
      .addTo(m);
    markersRef.current.push(cpMarker);

    // Filter ongoing orders
    const ongoing = orders.filter((o) => o.stage >= 4 && o.stage < 6);

    ongoing.forEach((order) => {
      // Destination marker
      if (order.targetLon && order.targetLat) {
        const elDest = document.createElement("div");
        elDest.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-red-650 bg-red-605 bg-red-600 border border-white flex items-center justify-center text-xs shadow-md animate-pulse">
            📍
          </div>
        `;
        const destMarker = new maplibregl.Marker({ element: elDest })
          .setLngLat([order.targetLon, order.targetLat])
          .addTo(m);
        
        markersRef.current.push(destMarker);
      }
    });

    // Populate active riders
    riders.forEach((rider) => {
      const lat = rider.currentLat || 28.6300;
      const lon = rider.currentLon || 77.2185;

      const elRider = document.createElement("div");
      const isDelivering = rider.status === "delivering";
      
      elRider.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full ${isDelivering ? "bg-emerald-500/30 animate-pulse" : "bg-slate-500/10"}"></div>
          <div class="relative px-1.5 py-1 rounded-lg ${isDelivering ? "bg-emerald-600 animate-bounce" : "bg-slate-705 bg-slate-800"} border border-white flex flex-col items-center justify-center text-[11px] shadow-lg text-white font-mono font-bold">
            🛵 <span class="text-[7.5px] tracking-tight block max-w-[50px] overflow-hidden truncate leading-none mt-0.5">${rider.name.split(" ")[1] || "Fleet"}</span>
          </div>
        </div>
      `;

      const riderMarker = new maplibregl.Marker({ element: elRider })
        .setLngLat([lon, lat])
        .addTo(m);

      markersRef.current.push(riderMarker);
    });

  }, [orders, riders]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-slate-800">
      <div ref={mapContainer} className="w-full h-full min-h-[300px]" />
      <div className="absolute top-2.5 right-2.5 text-[8.5px] font-mono tracking-widest bg-slate-950/80 backdrop-blur border border-slate-800 text-slate-400 px-2 py-0.5 rounded shadow">
        ACTIVE COMMUNICATING CHIPS NODES
      </div>
    </div>
  );
}

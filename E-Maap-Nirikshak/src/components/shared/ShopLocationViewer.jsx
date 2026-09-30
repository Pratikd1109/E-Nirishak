import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, CheckCircle2, ShieldAlert, ShieldCheck, Compass } from 'lucide-react';

// Haversine formula to compute distance in meters between two lat/lng pairs
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function ShopLocationViewer({
  shopLocation,
  shopAddress,
  onVerificationChange,
  isLmo = false,
  readOnly = false,
}) {
  const shopLat = shopLocation?.lat || 28.6562;
  const shopLng = shopLocation?.lng || 77.2310;
  const address = shopAddress || shopLocation?.address || '14, Nehru Market, Chandni Chowk, Delhi';

  const mapsUrl = shopLocation?.mapsUrl || `https://www.google.com/maps?q=${shopLat},${shopLng}`;
  const directionsUrl =
    shopLocation?.directionsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}`;

  const [officerGps, setOfficerGps] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locating, setLocating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const officerMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [shopLat, shopLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Shop Pin
      const shopIcon = L.divIcon({
        className: 'shop-marker',
        html: `
          <div style="transform:translate(-50%, -100%);">
            <div style="background:#1E3A8A; color:white; padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.3); border:2px solid #fff; display:flex; align-items:center; gap:4px;">
              <span>🏪</span><span>Shop Location</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([shopLat, shopLng], { icon: shopIcon })
        .addTo(map)
        .bindPopup(`<b>Shop Location</b><br/>${address}`)
        .openPopup();

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [shopLat, shopLng, address]);

  // Check Officer On-Site Presence (Anti-Corruption Verification)
  const verifyPresence = (lat, lng, acc = 10) => {
    const distMeters = calculateDistanceMeters(shopLat, shopLng, lat, lng);
    const verified = distMeters <= 200; // within 200m tolerance

    setOfficerGps({ lat, lng, accuracy: acc });
    setDistance(distMeters);
    setIsVerified(verified);

    // Update or add officer pin on map
    if (mapInstanceRef.current) {
      const officerIcon = L.divIcon({
        className: 'officer-marker',
        html: `
          <div style="transform:translate(-50%, -100%);">
            <div style="background:${verified ? '#059669' : '#DC2626'}; color:white; padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.3); border:2px solid #fff; display:flex; align-items:center; gap:4px;">
              <span>👮</span><span>Officer GPS</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (officerMarkerRef.current) {
        officerMarkerRef.current.setLatLng([lat, lng]);
      } else {
        officerMarkerRef.current = L.marker([lat, lng], { icon: officerIcon }).addTo(mapInstanceRef.current);
      }

      // Draw bounding box to fit both pins
      const bounds = L.latLngBounds([[shopLat, shopLng], [lat, lng]]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }

    if (onVerificationChange) {
      onVerificationChange({
        verified,
        distanceMeters: distMeters,
        officerLat: lat,
        officerLng: lng,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Trigger Real Device GPS
  const handleCheckRealGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        verifyPresence(pos.coords.latitude, pos.coords.longitude, Math.round(pos.coords.accuracy) || 8);
      },
      (err) => {
        setLocating(false);
        alert('Could not access device GPS. You can use the "Simulate On-Site" button for demonstration.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Demo: Simulate Arriving at the Shop (distance ~ 35m)
  const handleSimulateOnSite = () => {
    const jitterLat = shopLat + (Math.random() - 0.5) * 0.0003;
    const jitterLng = shopLng + (Math.random() - 0.5) * 0.0003;
    verifyPresence(jitterLat, jitterLng, 5);
  };

  // Demo: Simulate Far Away (distance ~ 4.2 km)
  const handleSimulateMismatch = () => {
    const farLat = shopLat + 0.038;
    const farLng = shopLng + 0.032;
    verifyPresence(farLat, farLng, 15);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-blue-400" />
          <div>
            <h3 className="text-sm font-bold leading-tight">Shop Inspection Location &amp; Directions</h3>
            <p className="text-[11px] text-slate-300 leading-none mt-0.5">
              Pinned by Consumer • Verified under Legal Metrology Act, 2009
            </p>
          </div>
        </div>

        {/* 1-Click Google Maps Navigation button */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          title="Open in Google Maps for driving directions"
        >
          <Compass size={14} />
          <span>Google Maps Directions</span>
          <ExternalLink size={12} className="opacity-80" />
        </a>
      </div>

      {/* Map view */}
      <div className="relative h-64 w-full bg-slate-100">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Coords Overlay */}
        <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-mono shadow">
          📍 Shop: {shopLat.toFixed(6)}, {shopLng.toFixed(6)}
        </div>

        {distance !== null && (
          <div
            className={`absolute top-2 right-2 z-[400] backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 text-xs font-bold ${
              isVerified
                ? 'bg-emerald-50/95 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50/95 text-rose-800 border border-rose-300'
            }`}
          >
            {isVerified ? <ShieldCheck size={16} className="text-emerald-600" /> : <ShieldAlert size={16} className="text-rose-600" />}
            <span>{isVerified ? `On-Site Verified (${distance}m away)` : `Location Mismatch (${distance}m away)`}</span>
          </div>
        )}
      </div>

      {/* Address & Anti-Corruption Panel */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Shop Address</span>
            <p className="font-semibold text-gray-800 text-sm mt-0.5">{address}</p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium"
          >
            View Pin on Maps <ExternalLink size={11} />
          </a>
        </div>

        {/* LMO Anti-Corruption Geo-Verification Trigger */}
        {isLmo && !readOnly && (
          <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-indigo-600" />
                <span className="text-xs font-bold text-gray-800">Anti-Corruption Geo-Verification Check</span>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold border border-indigo-200">
                Rule 15 Verification
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Legal Metrology regulations require verification to take place at the actual shop premises. Verify your physical presence on-site before submitting the inspection.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCheckRealGPS}
                disabled={locating}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <Navigation size={13} />
                <span>{locating ? 'Reading GPS...' : 'Verify Live Device GPS'}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateOnSite}
                className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-emerald-300"
              >
                <span>✓ Demo: Arrived On-Site</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateMismatch}
                className="flex items-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-rose-300"
              >
                <span>⚠️ Demo: Remote Alert</span>
              </button>
            </div>

            {/* Verification Result Banner */}
            {distance !== null && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 mt-2 ${
                  isVerified
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {isVerified
                      ? '✓ On-Site Presence Confirmed'
                      : '⚠️ Inspection Blocked — Location Mismatch'}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-normal opacity-90">
                    {isVerified
                      ? `Officer GPS coordinates match shop location (Distance: ${distance} meters). Verified for stamping & certification.`
                      : `Officer GPS is ${distance >= 1000 ? (distance / 1000).toFixed(2) + ' km' : distance + ' meters'} away from the registered shop. Physical presence is mandatory to prevent false claims and corruption.`}
                  </p>
                  <p className="text-[10px] font-mono mt-1 opacity-70">
                    Officer GPS: {officerGps?.lat.toFixed(6)}, {officerGps?.lng.toFixed(6)} • Timestamp: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

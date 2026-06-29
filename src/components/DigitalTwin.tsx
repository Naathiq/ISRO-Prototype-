import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { 
  Settings, Satellite, Database, Layers, Navigation, Info, Activity, 
  CloudRain, Thermometer, Wind, Play, Pause, Radio, Cpu, 
  Flame, HelpCircle, ArrowRight, RefreshCw, AlertTriangle, Disc, Sun, Map
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090e]/95 backdrop-blur-xl border border-zinc-700/60 p-3.5 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col gap-2.5 min-w-[160px]">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-zinc-800 pb-1.5">{label} 2026 Projection</span>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center gap-4 text-[11px] font-mono">
            <span style={{ color: entry.color }} className="flex items-center gap-2 opacity-90 drop-shadow-md">
               <span className="w-1.5 h-1.5 rounded-full shadow-lg" style={{ backgroundColor: entry.color }} />
               {entry.name}
            </span>
            <span className="text-white font-semibold tabular-nums">{Number(entry.value).toFixed(2)}°C</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface Facility {
  id: string;
  lat: number;
  lng: number;
  text: string;
  city: string;
  details: string;
  status: string;
  uplink: string;
  antenna: string;
}

const createCityIcon = (name: string) => L.divIcon({
  html: `<div style="color: #f59e0b; font-weight: 800; font-family: sans-serif; font-size: 10px; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black; white-space: nowrap; transform: translate(-50%, -50%);">${name}</div>`,
  className: 'custom-city-icon bg-transparent border-none',
  iconSize: [0, 0],
});

const indiaCities = [
  { name: 'DELHI', lat: 28.7041, lng: 77.1025, temp: 45, rain: 0, cloud: 10, windSpeed: 15, windDir: 45 },
  { name: 'MUMBAI', lat: 19.0760, lng: 72.8777, temp: 33, rain: 80, cloud: 90, windSpeed: 30, windDir: 120 },
  { name: 'KOLKATA', lat: 22.5726, lng: 88.3639, temp: 38, rain: 40, cloud: 60, windSpeed: 20, windDir: 90 },
  { name: 'CHENNAI', lat: 13.0827, lng: 80.2707, temp: 36, rain: 20, cloud: 40, windSpeed: 25, windDir: 160 },
  { name: 'BANGALORE', lat: 12.9716, lng: 77.5946, temp: 28, rain: 60, cloud: 80, windSpeed: 18, windDir: 180 },
  { name: 'HYDERABAD', lat: 17.3850, lng: 78.4867, temp: 40, rain: 10, cloud: 20, windSpeed: 12, windDir: 80 },
  { name: 'AHMEDABAD', lat: 23.0225, lng: 72.5714, temp: 44, rain: 0, cloud: 0, windSpeed: 10, windDir: 30 },
  { name: 'JAIPUR', lat: 26.9124, lng: 75.7873, temp: 46, rain: 0, cloud: 0, windSpeed: 20, windDir: 60 },
  { name: 'LUCKNOW', lat: 26.8467, lng: 80.9462, temp: 42, rain: 5, cloud: 15, windSpeed: 10, windDir: 45 },
  { name: 'PATNA', lat: 25.5941, lng: 85.1376, temp: 41, rain: 10, cloud: 30, windSpeed: 15, windDir: 70 },
  { name: 'BHOPAL', lat: 23.2599, lng: 77.4126, temp: 43, rain: 5, cloud: 10, windSpeed: 12, windDir: 50 },
  { name: 'GOA', lat: 15.2993, lng: 74.1240, temp: 32, rain: 90, cloud: 100, windSpeed: 35, windDir: 140 },
  { name: 'THIRUVANANTHAPURAM', lat: 8.5241, lng: 76.9366, temp: 31, rain: 100, cloud: 100, windSpeed: 40, windDir: 200 },
  { name: 'VISAKHAPATNAM', lat: 17.6868, lng: 83.2185, temp: 35, rain: 50, cloud: 70, windSpeed: 28, windDir: 150 },
  { name: 'BHUBANESWAR', lat: 20.2961, lng: 85.8245, temp: 39, rain: 30, cloud: 50, windSpeed: 22, windDir: 130 },
  { name: 'AGARTALA', lat: 23.8315, lng: 91.2868, temp: 34, rain: 70, cloud: 80, windSpeed: 15, windDir: 90 },
  { name: 'GUWAHATI', lat: 26.1445, lng: 91.7362, temp: 32, rain: 80, cloud: 90, windSpeed: 18, windDir: 110 },
  { name: 'PORT BLAIR', lat: 11.6234, lng: 92.7265, temp: 30, rain: 90, cloud: 90, windSpeed: 30, windDir: 220 },
  { name: 'KABUL', lat: 34.5553, lng: 69.2075, temp: 35, rain: 0, cloud: 10, windSpeed: 10, windDir: 40 },
  { name: 'ISLAMABAD', lat: 33.6844, lng: 73.0479, temp: 40, rain: 0, cloud: 20, windSpeed: 15, windDir: 60 },
  { name: 'KARACHI', lat: 24.8607, lng: 67.0011, temp: 36, rain: 0, cloud: 5, windSpeed: 25, windDir: 120 },
  { name: 'COLOMBO', lat: 6.9271, lng: 79.8612, temp: 31, rain: 80, cloud: 90, windSpeed: 25, windDir: 200 },
  { name: 'MALE', lat: 4.1755, lng: 73.5093, temp: 30, rain: 60, cloud: 80, windSpeed: 20, windDir: 210 },
  { name: 'YANGON', lat: 16.8409, lng: 96.1454, temp: 33, rain: 70, cloud: 80, windSpeed: 15, windDir: 160 },
  { name: 'BANGKOK', lat: 13.7563, lng: 100.5018, temp: 35, rain: 40, cloud: 60, windSpeed: 10, windDir: 140 },
  { name: 'DUBAI', lat: 25.2048, lng: 55.2708, temp: 45, rain: 0, cloud: 0, windSpeed: 20, windDir: 30 },
  { name: 'MUSCAT', lat: 23.5880, lng: 58.3829, temp: 42, rain: 0, cloud: 0, windSpeed: 15, windDir: 40 },
  { name: 'KUWAIT', lat: 29.3759, lng: 47.9774, temp: 48, rain: 0, cloud: 0, windSpeed: 25, windDir: 50 },
];

const DigitalTwin = () => {
  const globeRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [cloudsMode, setCloudsMode] = useState(true);
  const [dayNightMode, setDayNightMode] = useState(false);
  const [indiaMode, setIndiaMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Layer
  const [currentLayer, setCurrentLayer] = useState<'satellites' | 'climate' | 'ocean' | 'india_weather' | 'india_wind' | 'india_heat' | 'india_visual'>('satellites');
  
  const [timeStep, setTimeStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedSat, setSelectedSat] = useState<any>(null);
  const [globeReady, setGlobeReady] = useState(false);

  // Time-driven animated state values
  const currentMonthIdx = Math.min(11, Math.floor(timeStep / (100 / 12)));
  const currentMonthContinuous = timeStep / (100 / 12);
  const currentMonthName = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentMonthIdx], [currentMonthIdx]);
  
  const currentTempAnomaly = useMemo(() => {
    const base = 1.12 + (currentMonthContinuous * 0.024);
    const pulse = Math.sin(timeStep * 0.15) * 0.05;
    return (base + pulse).toFixed(2);
  }, [currentMonthContinuous, timeStep]);

  const windSpeedMultiplier = useMemo(() => {
    return (130 + Math.sin(timeStep * 0.2) * 20).toFixed(0);
  }, [timeStep]);

  const precipAnomaly = useMemo(() => {
    return (-4.2 + Math.cos(timeStep * 0.1) * 1.5).toFixed(1);
  }, [timeStep]);

  // Handle playing simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeStep((prev) => (prev >= 100 ? 0 : prev + 0.3)); // 33 FPS tick rate
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Three.js Clouds layer
  useEffect(() => {
    if (!globeRef.current) return;
    
    // Check india mode focus
    if (indiaMode) {
      globeRef.current.pointOfView({ lat: 22, lng: 79, altitude: 0.6 }, 2000);
    } else {
      globeRef.current.pointOfView({ lat: 20, lng: 80, altitude: 2.2 }, 2000);
    }
    
    const globe = globeRef.current;
    const scene = globe.scene();

    if (cloudsMode) {
      const CLOUDS_ALT = 0.005;
      const CLOUDS_ROTATION_SPEED = -0.005; // deg/frame
      
      const cloudsGeo = new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75);
      
      new THREE.TextureLoader().load('//unpkg.com/three-globe/example/img/earth-clouds.png', (cloudsTexture) => {
        const cloudsMat = new THREE.MeshPhongMaterial({
          map: cloudsTexture,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
        cloudsMesh.name = 'clouds';
        
        const existingClouds = scene.getObjectByName('clouds');
        if (existingClouds) scene.remove(existingClouds);
        
        scene.add(cloudsMesh);

        (function rotateClouds() {
          cloudsMesh.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
          requestAnimationFrame(rotateClouds);
        })();
      });
    } else {
       const existingClouds = scene.getObjectByName('clouds');
       if (existingClouds) scene.remove(existingClouds);
    }
  }, [cloudsMode, globeRef.current]);

  // Real-world sun simulation and Graphics Enhancement
  useEffect(() => {
    if (!globeRef.current || !globeReady) return;
    
    const globe = globeRef.current;
    const scene = globe.scene();
    const camera = globe.camera();
    const renderer = globe.renderer();

    // Enhance Graphics renderer settings
    if (renderer) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (window.devicePixelRatio) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
      }
    }

    // The default directional light in react-globe.gl is attached to the camera.
    // We remove it to prevent the "headlamp" effect and use a realistic sun position.
    const removeDefaultLights = () => {
      if (camera && camera.children) {
        const dLight = camera.children.find((c: any) => c.type === 'DirectionalLight');
        if (dLight) {
          camera.remove(dLight);
        }
      }
    };

    removeDefaultLights();

    let sunLight = scene.getObjectByName('sunLight') as THREE.DirectionalLight;
    if (!sunLight) {
      sunLight = new THREE.DirectionalLight(0xffffff, 4.0); // High intensity for realistic contrast
      sunLight.name = 'sunLight';
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.bias = -0.0001;
      scene.add(sunLight);
    }

    let ambientLight = scene.getObjectByName('ambientLight') as THREE.AmbientLight;
    if (!ambientLight) {
      // Need a bit of ambient light so the dark side isn't pitch black
      ambientLight = new THREE.AmbientLight(0x404050, 0.8); // Slightly blueish ambient for space
      ambientLight.name = 'ambientLight';
      scene.add(ambientLight);
    }

    const updateSunPosition = () => {
      const date = new Date();
      
      // Calculate declination (latitude of sun)
      const startOfYear = new Date(date.getFullYear(), 0, 0).getTime();
      const diff = date.getTime() - startOfYear;
      const dayOfYear = Math.floor(diff / 86400000);
      const declination = -23.44 * Math.cos((360 / 365.24) * (dayOfYear + 10) * (Math.PI / 180));
      
      // Calculate longitude (sun moves west 15 degrees per hour)
      const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
      let sunLng = 180 - (utcHours * 15);
      if (sunLng < -180) sunLng += 360;
      
      // Convert lat/lng to 3D Cartesian coordinates
      // Globe radius is 100 in three-globe standard. We put sun far away.
      const phi = (90 - declination) * (Math.PI / 180);
      const theta = (90 - sunLng) * (Math.PI / 180); // Corrected for right-handed +Z at lng=0
      
      const distance = 400;
      sunLight.position.set(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.cos(phi),
        distance * Math.sin(phi) * Math.sin(theta)
      );
    };

    updateSunPosition();
    
    // Update sun position every 30 seconds
    const interval = setInterval(updateSunPosition, 30000);
    
    return () => clearInterval(interval);
  }, [globeRef.current, globeReady, currentLayer, dayNightMode]);

  // Orbit controls settings
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = !selectedFacility && !selectedSat;
      controls.autoRotateSpeed = 0.4;
    }
  }, [selectedFacility, selectedSat]);

  // Bengaluru coord reference
  const BENGALURU = { lat: 12.9716, lng: 77.5946 };

  // ISRO Facilities data
  const facilities = useMemo<Facility[]>(() => [
    {
      id: 'isro_hq',
      lat: 12.9716,
      lng: 77.5946,
      text: 'ISRO HQ',
      city: 'Bengaluru',
      details: 'Universal tracking core & satellite command nexus. Resolves high priority telemetry payloads & provides active constellation analysis.',
      status: 'OPERATIONAL',
      uplink: 'S-Band 2.21 GHz',
      antenna: 'ISTRAC Direct Array 32M',
    },
    {
      id: 'sdsc_shar',
      lat: 13.7198,
      lng: 80.2300,
      text: 'SDSC SHAR',
      city: 'Sriharikota',
      details: 'India\'s state-of-the-art spaceport. Supports advanced countdown infrastructure, dual launchpads, and high-frequency real-time radar mapping.',
      status: 'ACTIVE LAUNCHPAD',
      uplink: 'X-Band 8.45 GHz',
      antenna: 'Precision Doppler Radar Nest',
    },
    {
      id: 'terls',
      lat: 8.5310,
      lng: 76.8682,
      text: 'TERLS Thumba',
      city: 'Thumba',
      details: 'Equatorial launcher designed for rocket instrumentation, thermosphere wind measurement, and magnetic equator study.',
      status: 'MEASURING WINDS',
      uplink: 'L-Band 1.15 GHz',
      antenna: 'Automated Sounding Heli-Array',
    },
    {
      id: 'sac_ahmedabad',
      lat: 23.0225,
      lng: 72.5714,
      text: 'SAC Ahmedabad',
      city: 'Ahmedabad',
      details: 'Design core for optoelectronic modules and electro-optical meteorological sensors. Drives satellite data correction algorithms.',
      status: 'CALIBRATING',
      uplink: 'Ku-Band 14.1 GHz',
      antenna: 'High-Throughput Mobile Uplink',
    }
  ], []);

  // Graticule (Grid Lines)
  const graticulePaths = useMemo(() => {
    const paths = [];
    // Meridians
    for (let lng = -180; lng <= 180; lng += 15) {
      const path = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        path.push([lat, lng]);
      }
      paths.push({ path, type: 'graticule' });
    }
    // Parallels
    for (let lat = -80; lat <= 80; lat += 15) {
      const path = [];
      for (let lng = -180; lng <= 180; lng += 5) {
        path.push([lat, lng]);
      }
      paths.push({ path, type: 'graticule' });
    }
    return paths;
  }, []);

  // Stable Satellite Constellation
  const satEntities = useMemo(() => {
    const names = [
      'Cartosat-3', 'RISAT-1A', 'Oceansat-3', 'INSAT-3DR', 'GSAT-31', 
      'EOS-04', 'AstroSat', 'Ananth', 'AzadiSAT', 'Megha-Tropiques',
      'Aditya-L1 Proxy', 'Gaganyaan-Orbiter', 'Chandrayaan-Orbit Tracer', 'GISAT-1'
    ];
    
    return Array.from({ length: 30 }).map((_, i) => {
      const name = names[i % names.length] + ` [ID:IS-${200 + i}]`;
      const isGeo = i % 4 === 0;
      const isPolar = i % 4 === 1;
      const battery = Math.min(100, Math.max(76, 100 - (i * 0.7)));
      
      return {
        id: i,
        name,
        inclination: isPolar ? 98 : isGeo ? 0 : 35 + (i % 20),
        ascendingNode: (i * 37) % 360,
        alt: isGeo ? 0.8 : 0.15 + ((i % 5) * 0.05),
        speed: isGeo ? 0.2 : 1.5 + ((i % 5) * 0.2),
        radius: 3.5 + (i * 0.15),
        color: isGeo ? '#f59e0b' : isPolar ? '#06b6d4' : '#10b981',
        payload: isGeo ? 'INSAT Radiometer core' : isPolar ? 'High Res Panchromatic' : 'C/Ku Ground Relay',
        velocity: (27400 + (i * 65)).toLocaleString() + ' km/h',
        battery,
        isBackup: i % 10 === 9,
      };
    });
  }, []);

  const satData = useMemo(() => {
    return satEntities.map(sat => {
       const phase = (sat.ascendingNode + timeStep * sat.speed) * (Math.PI / 180);
       const inc = sat.inclination * (Math.PI / 180);
       
       const lat = Math.asin(Math.sin(inc) * Math.sin(phase)) * (180 / Math.PI);
       const lngRad = Math.atan2(Math.cos(inc) * Math.sin(phase), Math.cos(phase));
       const lng = (lngRad * (180 / Math.PI)) + sat.ascendingNode;
       
       return {
           ...sat,
           lat,
           lng: ((lng + 180) % 360 + 360) % 360 - 180,
       };
    });
  }, [satEntities, timeStep]);

  const satOrbits = useMemo(() => {
    if (currentLayer !== 'satellites') return [];
    return satEntities.map(sat => {
       const path = [];
       const inc = sat.inclination * (Math.PI / 180);
       for(let i=0; i<=360; i+=10) {
           const phase = i * (Math.PI / 180);
           const lat = Math.asin(Math.sin(inc) * Math.sin(phase)) * (180 / Math.PI);
           const lng = (Math.atan2(Math.cos(inc) * Math.sin(phase), Math.cos(phase)) * (180 / Math.PI)) + sat.ascendingNode;
           path.push([lat, ((lng + 180) % 360 + 360) % 360 - 180]);
       }
       return {
           path,
           color: sat.color,
           alt: sat.alt
       }
    });
  }, [satEntities, currentLayer]);

  // Temperature anomaly graph
  const tempTrendData = useMemo(() => [
    { month: 'Jan', temp: 1.12, baseline: 0.85 }, { month: 'Feb', temp: 1.15, baseline: 0.88 },
    { month: 'Mar', temp: 1.18, baseline: 0.90 }, { month: 'Apr', temp: 1.25, baseline: 0.95 },
    { month: 'May', temp: 1.30, baseline: 1.05 }, { month: 'Jun', temp: 1.38, baseline: 1.12 },
    { month: 'Jul', temp: 1.45, baseline: 1.15 }, { month: 'Aug', temp: 1.42, baseline: 1.10 },
    { month: 'Sep', temp: 1.36, baseline: 1.00 }, { month: 'Oct', temp: 1.28, baseline: 0.92 },
    { month: 'Nov', temp: 1.22, baseline: 0.87 }, { month: 'Dec', temp: 1.25, baseline: 0.85 },
  ], []);

  // Climate HexBin Points - traveling wavy temperature anomaly maps
  const baseClimatePoints = useMemo(() => {
    return Array.from({ length: 700 }).map((_, i) => {
      const lat = (Math.random() - 0.5) * 155;
      const lng = (Math.random() - 0.5) * 360;
      return { lat, lng, id: i };
    });
  }, []);

  const dynamicClimatePoints = useMemo(() => {
    if (currentLayer !== 'climate' && currentLayer !== 'india_weather' && currentLayer !== 'india_heat') return [];
    
    return baseClimatePoints.map(p => {
      const wave1 = Math.sin((p.lat * 0.05 + p.lng * 0.02) + (timeStep * 0.1)) * 15;
      const wave2 = Math.cos((p.lat * 0.02 - p.lng * 0.05) - (timeStep * 0.05)) * 10;
      let baseTemp = 100 - Math.abs(p.lat) * 1.45;
      if (currentLayer === 'india_heat' && p.lat > 8 && p.lat < 37 && p.lng > 68 && p.lng < 97) {
        baseTemp += 25; // boost heat over india
      }
      const weight = Math.max(5, Math.min(100, baseTemp + wave1 + wave2));
      return {
        lat: p.lat,
        lng: p.lng,
        weight
      };
    });
  }, [baseClimatePoints, currentLayer, timeStep]);

  // Active Storm Anomalies
  const weatherAnomalies = useMemo(() => {
    return [
      { id: 'remal', name: 'Cyclone Remal (Active)', lat: 21.2, lng: 89.1, maxR: 12, propagationSpeed: 0.9, repeatPeriod: 600, color: '#f97316' },
      { id: 'gaemi', name: 'Typhoon Gaemi (Severe)', lat: 22.8, lng: 122.4, maxR: 15, propagationSpeed: 1.1, repeatPeriod: 750, color: '#ef4444' },
      { id: 'monsoon', name: 'Monsoon Depression Wave', lat: 7.2, lng: 74.5, maxR: 10, propagationSpeed: 0.7, repeatPeriod: 500, color: '#38bdf8' },
    ];
  }, []);

  // Wind Vector Map (Fast westerlies and trade currents)
  const baseWindData = useMemo(() => {
    const paths = [];
    for (let i = 0; i < 1800; i++) {
        const lat = (Math.random() - 0.5) * 155;
        const lng = (Math.random() - 0.5) * 360;
        const isWesterlies = Math.abs(lat) > 30 && Math.abs(lat) < 65;
        const speedFactor = isWesterlies ? 1.4 : 0.8;
        
        const path = [];
        let curLat = lat;
        let curLng = lng;
        
        for (let j = 0; j < 12; j++) {
            path.push([curLat, curLng]);
            const lngDelta = (isWesterlies ? 2.0 : -1.8) * speedFactor * 0.5;
            const latDelta = (Math.sin(curLng * 0.1) * 0.5 + (Math.random() - 0.5) * 0.4) * speedFactor * 0.5;
            curLat += latDelta;
            curLng += lngDelta;
        }

        paths.push({
            path,
            latCenter: lat,
            color: Math.abs(lat) < 25 
              ? 'rgba(251, 146, 60, 0.45)' // Orange warm currents
              : Math.abs(lat) < 55 
                ? 'rgba(56, 189, 248, 0.55)' // Blue temperate currents
                : 'rgba(255, 255, 255, 0.65)' // White polar flow
        });
    }
    return paths;
  }, []);

  const arcsData = useMemo(() => {
    if (currentLayer !== 'satellites') return [];
    
    const baseArcs = [];
    satData.forEach(sat => {
      // Distance calculation in degrees (approximate)
      const dist = Math.sqrt(Math.pow(sat.lat - BENGALURU.lat, 2) + Math.pow(sat.lng - BENGALURU.lng, 2));
      if (dist < 40 && sat.alt < 0.5) { // Line of sight for LEO
        baseArcs.push({
          startLat: BENGALURU.lat,
          startLng: BENGALURU.lng,
          endLat: sat.lat,
          endLng: sat.lng,
          color: ['rgba(6, 182, 212, 0.4)', 'rgba(6, 182, 212, 0.05)'],
          altitude: sat.alt * 0.5,
        });
      }
      if (sat.inclination === 0 && Math.abs(sat.lng - BENGALURU.lng) < 60) { // GEO
        baseArcs.push({
          startLat: BENGALURU.lat,
          startLng: BENGALURU.lng,
          endLat: sat.lat,
          endLng: sat.lng,
          color: ['rgba(245, 158, 11, 0.3)', 'rgba(245, 158, 11, 0.02)'],
          altitude: sat.alt * 0.2,
        });
      }
    });

    // Selected satellite is drawn with a glowing, high-contrast S-band uplink arc
    if (selectedSat) {
      baseArcs.push({
        startLat: selectedSat.lat,
        startLng: selectedSat.lng,
        endLat: BENGALURU.lat,
        endLng: BENGALURU.lng,
        color: ['#00e5ff', 'rgba(14, 165, 233, 0.45)'],
        altitude: selectedSat.alt,
      });
    }

    return baseArcs;
  }, [currentLayer, satData, selectedSat]);

  // Pulsing beacon visual rings on base structures
  const ringsData = useMemo(() => {
    if (currentLayer === 'climate' || currentLayer === 'ocean' || currentLayer === 'india_weather' || currentLayer === 'india_wind' || currentLayer === 'india_heat') {
       return weatherAnomalies;
    }
    
    // Default satellite beacons at active facilities
    return facilities.map(f => ({
       lat: f.lat,
       lng: f.lng,
       maxR: selectedFacility?.id === f.id ? 24 : 12,
       propagationSpeed: selectedFacility?.id === f.id ? 2.5 : 1.2,
       repeatPeriod: 1100,
       color: selectedFacility?.id === f.id ? '#00e5ff' : '#03a9f4'
    }));
  }, [currentLayer, facilities, selectedFacility, weatherAnomalies]);

  // Custom Interactive Labels on the 3D globe surface
  const dynamicLabels = useMemo(() => {
    const list = facilities.map(f => ({
      lat: f.lat,
      lng: f.lng,
      text: f.text,
      city: f.city,
      isFacility: true,
      original: f
    }));

    if (currentLayer === 'climate' || currentLayer === 'ocean' || currentLayer === 'india_weather' || currentLayer === 'india_wind' || currentLayer === 'india_heat') {
      const weatherLabels = weatherAnomalies.map(a => ({
        lat: a.lat,
        lng: a.lng,
        text: `⚠️ ${a.name}`,
        city: 'Severe Storm',
        isFacility: false,
        original: a
      }));
      return [...list, ...weatherLabels];
    }

    return list;
  }, [facilities, currentLayer, weatherAnomalies]);

  // Click & Fly controller
  const handleSelectFacility = (fac: Facility) => {
    setSelectedFacility(fac);
    setSelectedSat(null);
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: fac.lat,
        lng: fac.lng,
        altitude: 1.45
      }, 1600);
    }
  };

  const handleSelectSatellite = (sat: any) => {
    setSelectedSat(sat);
    setSelectedFacility(null);
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: sat.lat,
        lng: sat.lng,
        altitude: 1.7
      }, 1600);
    }
  };

  // Determine actual base globe material
  const isDarkLayer = ['climate', 'ocean', 'india_weather', 'india_wind', 'india_heat'].includes(currentLayer);
  const imageUrl = isDarkLayer || dayNightMode
    ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
    : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

  return (
    <div className="relative w-full h-screen bg-[#07070a] overflow-hidden font-sans text-gray-200">
      
      {/* MAP / GLOBE RENDER */}
      <div className="absolute inset-0 z-0">
        {indiaMode ? (
          <MapContainer 
            center={[22.5, 79]} 
            zoom={5} 
            zoomControl={false}
            style={{ width: '100%', height: '100%', background: '#000' }}
          >
            <TileLayer
              url={
                currentLayer === 'india_visual' 
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
                  : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              }
              attribution=""
            />
            {indiaCities.map((city, i) => (
              <Marker 
                key={`marker-${i}`} 
                position={[city.lat, city.lng]}
                icon={createCityIcon(city.name)}
              />
            ))}

            {currentLayer === 'india_heat' && indiaCities.map((city, i) => {
              const color = city.temp >= 45 ? '#ef4444' : city.temp >= 40 ? '#f97316' : city.temp >= 35 ? '#eab308' : city.temp >= 30 ? '#22c55e' : '#3b82f6';
              return (
                <React.Fragment key={`heat-${i}`}>
                  <Circle center={[city.lat, city.lng]} radius={100000} pathOptions={{ color, fillColor: color, fillOpacity: 0.5, stroke: false }} />
                  <Circle center={[city.lat, city.lng]} radius={200000} pathOptions={{ color, fillColor: color, fillOpacity: 0.3, stroke: false }} />
                  <Circle center={[city.lat, city.lng]} radius={350000} pathOptions={{ color, fillColor: color, fillOpacity: 0.1, stroke: false }} />
                </React.Fragment>
              );
            })}

            {currentLayer === 'india_weather' && indiaCities.map((city, i) => (
              <React.Fragment key={`weather-${i}`}>
                {city.cloud > 20 && (
                  <>
                    <Circle center={[city.lat, city.lng]} radius={city.cloud * 3000} pathOptions={{ color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.3, stroke: false }} />
                    <Circle center={[city.lat, city.lng]} radius={city.cloud * 6000} pathOptions={{ color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.1, stroke: false }} />
                  </>
                )}
                {city.rain > 20 && (
                  <>
                    <Circle center={[city.lat, city.lng]} radius={city.rain * 1500} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.5, stroke: false }} />
                    <Circle center={[city.lat, city.lng]} radius={city.rain * 3000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, stroke: false }} />
                  </>
                )}
              </React.Fragment>
            ))}

            {currentLayer === 'india_wind' && indiaCities.map((city, i) => {
               const windRad = (city.windDir - 90) * (Math.PI / 180); 
               const len = city.windSpeed * 0.05; 
               const endLat = city.lat + Math.sin(windRad) * len;
               const endLng = city.lng + Math.cos(windRad) * len;
               return (
                 <React.Fragment key={`wind-${i}`}>
                   <Polyline 
                     positions={[[city.lat, city.lng], [endLat, endLng]]}
                     pathOptions={{ color: '#00e5ff', weight: 3, opacity: 0.8 }}
                   />
                   <Circle center={[city.lat, city.lng]} radius={10000} pathOptions={{ color: '#00e5ff', fillColor: '#00e5ff', fillOpacity: 1, stroke: false }} />
                 </React.Fragment>
               );
            })}
          </MapContainer>
        ) : (
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl={imageUrl}
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            specularImageUrl="//unpkg.com/three-globe/example/img/earth-water.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            
            onGlobeReady={() => {
              if (globeRef.current) {
                globeRef.current.pointOfView({
                   lat: 20.5937,
                   lng: 78.9629,
                   altitude: 1.95
                }, 4000);
                setGlobeReady(true);
              }
            }}

            // Wind Currents, Graticule, and Satellite Orbits
            pathsData={
              [
                ...graticulePaths,
                ...((currentLayer === 'ocean' || currentLayer === 'india_wind') ? baseWindData : []),
                ...(currentLayer === 'satellites' ? satOrbits : [])
              ]
            }
            pathPoints="path"
            pathPointLat={(p: any) => p[0]}
            pathPointLng={(p: any) => p[1]}
            pathColor={(d: any) => d.type === 'graticule' ? 'rgba(255,255,255,0.03)' : (currentLayer === 'satellites' ? (d.color + '40') : d.color)}
            pathDashLength={(d: any) => d.type === 'graticule' ? 1 : ((currentLayer === 'ocean' || currentLayer === 'india_wind') ? 0.03 : 1)}
            pathDashGap={(d: any) => d.type === 'graticule' ? 0 : ((currentLayer === 'ocean' || currentLayer === 'india_wind') ? 0.015 : 0)}
            pathDashAnimateTime={(d: any) => d.type === 'graticule' ? 0 : ((currentLayer === 'ocean' || currentLayer === 'india_wind') ? 1200 : 0)}
            pathAltitude={(d: any) => d.alt || 0.002}
            pathStroke={(d: any) => d.type === 'graticule' ? 0.5 : 1}

            // Satellites
            objectsData={currentLayer === 'satellites' ? satData : []}
            objectLabel="name"
            objectLat="lat"
            objectLng="lng"
            objectAltitude="alt"
            objectFacesSurface={false}
            onObjectClick={(obj: any) => handleSelectSatellite(obj)}
            objectThreeObject={(d: any) => {
               const group = new THREE.Group();
               
               // Core geometry
               const geometry = new THREE.OctahedronGeometry(d.radius * 0.8, 0);
               const material = new THREE.MeshLambertMaterial({ 
                  color: d.color, 
                  emissive: d.color,
                  emissiveIntensity: 0.4,
                  transparent: true, 
                  opacity: selectedSat?.id === d.id ? 1.0 : 0.8 
               });
               const mesh = new THREE.Mesh(geometry, material);
               
               // Solar panels
               const panelGeo = new THREE.BoxGeometry(d.radius * 3.5, d.radius * 0.2, d.radius * 0.8);
               const panelMat = new THREE.MeshBasicMaterial({ color: '#1e3a8a', transparent: true, opacity: 0.9 });
               const panels = new THREE.Mesh(panelGeo, panelMat);
               
               group.add(mesh);
               group.add(panels);
               
               // Add neat glowing halo for chosen sat
               if (selectedSat?.id === d.id) {
                  const glowGeo = new THREE.IcosahedronGeometry(d.radius * 2.5, 1);
                  const glowMat = new THREE.MeshBasicMaterial({ 
                     color: '#00ffff', 
                     wireframe: true, 
                     transparent: true, 
                     opacity: 0.5 
                  });
                  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
                  
                  // Animate wireframe slightly
                  glowMesh.rotation.y = timeStep * 0.1;
                  glowMesh.rotation.x = timeStep * 0.05;
                  group.add(glowMesh);
               }
               
               // Align panels to orbit direction roughly
               group.rotation.y = timeStep * 0.02 + d.id;
               group.rotation.x = timeStep * 0.01;
               
               return group;
            }}

            // Telemetry scanning arcs
            arcsData={arcsData}
            arcColor="color"
            arcDashLength={0.35}
            arcDashGap={0.15}
            arcDashAnimateTime={2200}
            arcAltitude="altitude"

            // Beacon / Weather danger pulses
            ringsData={ringsData}
            ringColor="color"
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
            
            // Temperature Anomaly Heat Layer
            hexBinPointsData={dynamicClimatePoints}
            hexBinPointWeight="weight"
            hexHexagonResolution={4}
            hexMargin={0.08}
            hexAltitude={(d: any) => {
              const temp = d.sumWeight / d.points.length;
              return 0.005 + (Math.max(0, temp - 15) / 100) * 0.08;
            }}
            hexTopColor={(d: any) => {
              const temp = d.sumWeight / d.points.length;
              if (temp > 85) return 'rgba(225, 29, 72, 0.85)'; // Rose/Magenta
              if (temp > 70) return 'rgba(239, 68, 68, 0.75)'; // Red
              if (temp > 50) return 'rgba(249, 115, 22, 0.65)'; // Orange
              if (temp > 30) return 'rgba(234, 179, 8, 0.55)';  // Yellow
              if (temp > 15) return 'rgba(56, 189, 248, 0.3)';  // Light Blue
              return 'rgba(30, 58, 138, 0.15)';                 // Dark Blue
            }}
            hexSideColor={(d: any) => {
              const temp = d.sumWeight / d.points.length;
              if (temp > 70) return 'rgba(225, 29, 72, 0.2)';
              if (temp > 50) return 'rgba(249, 115, 22, 0.15)';
              return 'rgba(0,0,0,0.05)';
            }}
            hexTransitionDuration={300}
            hexBinMerge={true}
            
            // Labels
            labelsData={dynamicLabels}
            labelLat="lat"
            labelLng="lng"
            labelDotRadius={0.5}
            labelDotOrientation="bottom"
            labelColor={(d: any) => d.isFacility ? 'rgba(0, 229, 255, 0.85)' : 'rgba(239, 68, 68, 0.95)'}
            labelText="text"
            labelSize={1.4}
            labelResolution={2}
            onLabelClick={(marker: any) => {
               if (marker.isFacility) {
                  handleSelectFacility(marker.original);
               }
            }}
            
            atmosphereColor="#3a90ff"
            atmosphereAltitude={0.15}
            showAtmosphere={true}
          />
        )}
      </div>

      {/* OVERLAY CONSOLE ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
        
        {/* TOP BAR BRANDING */}
        <motion.header 
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="p-6 flex justify-between items-start z-20 pointer-events-auto h-24"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-light tracking-[0.15em] text-white flex items-center gap-2">
              <span className="text-cyan-400 font-extrabold tracking-[0.25em]">ISRO</span>
              <span className="opacity-40 text-sm font-semibold">|</span>
              <span className="opacity-95 font-medium text-lg tracking-[0.1em]">BHOOMIKA digital twin</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
              LIVE TELEMETRY COM LINK ESTABLISHED
            </p>
          </div>

          {/* MAIN LAYER SELECTORS */}
          <div className="flex gap-4 items-center">
            <div className="bg-zinc-950/75 backdrop-blur-xl border border-zinc-800/80 rounded-xl p-1 flex gap-1 shadow-2xl shadow-blue-500/5">
              {!indiaMode ? (
                <>
                  <button 
                    onClick={() => {
                      setCurrentLayer('satellites');
                      setSelectedFacility(null);
                      setSelectedSat(null);
                    }}
                    className={`px-4 py-2 text-[10px] font-mono tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${currentLayer === 'satellites' ? 'bg-cyan-500 text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Satellite className="w-3.5 h-3.5" />
                    SATELLITE RADAR
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentLayer('climate');
                      setSelectedFacility(null);
                      setSelectedSat(null);
                    }}
                    className={`px-4 py-2 text-[10px] font-mono tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${currentLayer === 'climate' ? 'bg-orange-500 text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    INSAT CLIMATE
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentLayer('ocean');
                      setSelectedFacility(null);
                      setSelectedSat(null);
                    }}
                    className={`px-4 py-2 text-[10px] font-mono tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${currentLayer === 'ocean' ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Wind className="w-3.5 h-3.5" />
                    JET CURRENTS
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setCurrentLayer('india_weather')}
                    className={`px-4 py-2 text-[10px] font-mono tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${currentLayer === 'india_weather' ? 'bg-indigo-500 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    INDIA WEATHER
                  </button>
                  <button 
                    onClick={() => setCurrentLayer('india_wind')}
                    className={`px-4 py-2 text-[10px] font-mono tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${currentLayer === 'india_wind' ? 'bg-indigo-500 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Wind className="w-3.5 h-3.5" />
                    INDIA WIND
                  </button>
                  <button 
                    onClick={() => setCurrentLayer('india_heat')}
                    className={`px-4 py-2 text-[10px] font-mono tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${currentLayer === 'india_heat' ? 'bg-indigo-500 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Thermometer className="w-3.5 h-3.5" />
                    INDIA HEAT
                  </button>
                  <button 
                    onClick={() => setCurrentLayer('india_visual')}
                    className={`px-4 py-2 text-[10px] font-mono tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${currentLayer === 'india_visual' ? 'bg-indigo-500 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    INDIA VISUAL
                  </button>
                </>
              )}
            </div>

            <div className="bg-zinc-950/75 backdrop-blur-xl border border-zinc-800/80 p-1 flex gap-1 rounded-xl shadow-2xl">
              <button 
                onClick={() => {
                  setIndiaMode(!indiaMode);
                  if (!indiaMode) {
                    setCurrentLayer('india_weather');
                  } else {
                    setCurrentLayer('satellites');
                  }
                }}
                className={`px-4 py-2 text-[10px] font-mono tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${indiaMode ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Navigation className="w-3.5 h-3.5" />
                INDIA REGION
              </button>
              <div className="w-[1px] h-8 bg-zinc-800 mx-1 self-center" />
              <button 
                onClick={() => setDayNightMode(!dayNightMode)}
                className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${dayNightMode ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title="Night Mode Overlay"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCloudsMode(!cloudsMode)}
                className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${cloudsMode ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title="Toggle Real-time Clouds"
              >
                <RefreshCw className={`w-4 h-4 ${cloudsMode ? 'animate-spin-slow' : ''}`} />
              </button>
              <div className="w-[1px] h-8 bg-zinc-800 mx-1 self-center" />
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-lg transition-all flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* SIDE PANELS AND POPUPS CONTAINER */}
        <div className="flex-1 flex justify-between px-6 py-4 overflow-hidden h-[calc(100vh-172px)]">
          
          {/* LEFT COLUMN: CONTROL & GROUND HUB LIST */}
          <div className="w-80 flex flex-col gap-4 pointer-events-auto overflow-y-auto">
            
            {/* ISRO GROUND NETWORKS */}
            <motion.div 
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-[#000_0_20px_40px]"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-white">ISRO Mission Nodes</h3>
                </div>
                <span className="text-[10px] bg-cyan-400/10 text-cyan-400 font-mono px-1.5 py-0.5 rounded-md">Live</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {facilities.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => handleSelectFacility(fac)}
                    className={`text-left p-3 rounded-xl border transition-all flex justify-between items-center group font-mono ${selectedFacility?.id === fac.id ? 'bg-cyan-500/10 border-cyan-400 text-white' : 'bg-zinc-900/30 border-zinc-800/40 text-gray-400 hover:border-zinc-700/60 hover:text-white'}`}
                  >
                    <div>
                      <h4 className="text-xs font-semibold tracking-wide text-gray-200 group-hover:text-cyan-400 transition-colors">{fac.text}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{fac.city}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-[10px] tracking-wider text-green-400 font-medium">98%</span>
                      <ArrowRight className="w-3 h-3 text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* QUICK STATS BASED ON MODE */}
            <motion.div 
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl"
            >
              <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                Active Node Context
              </h3>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 flex flex-col">
                  <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">Earth Orbit</span>
                  <span className="text-lg font-light text-cyan-400">1.09x <span className="text-[11px] text-gray-500">z</span></span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 flex flex-col">
                  <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">Grid Satellites</span>
                  <span className="text-lg font-light text-cyan-400">142 online</span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 flex flex-col">
                  <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">Uplink Freq</span>
                  <span className="text-lg font-light text-cyan-400">S-Band</span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 flex flex-col">
                  <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">Link integrity</span>
                  <span className="text-lg font-light text-green-400">99.8%</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* CENTRE PORTION: INTERACTIVE DIAGNOSTIC REPORT CARD */}
          <div className="flex-1 flex items-center justify-center px-6 pointer-events-none">
            <AnimatePresence mode="wait">
              {/* Ground facility detailed diagnostic */}
              {selectedFacility && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="pointer-events-auto bg-[#09090e]/95 backdrop-blur-2xl border border-cyan-500/30 w-[420px] rounded-2xl p-6 flex flex-col gap-4 shadow-[0_0_50px_rgba(6,182,212,0.15)] shadow-[#000_0_20px_40px]"
                >
                  <div className="flex justify-between items-start border-b border-zinc-800 pb-3.5">
                    <div>
                      <div className="text-[9px] font-mono text-cyan-400 tracking-[0.25em] h-3">NODE INSPECTOR</div>
                      <h3 className="text-lg font-semibold text-white tracking-wide">{selectedFacility.text}</h3>
                      <p className="text-xs text-gray-400 font-mono">{selectedFacility.city}, India</p>
                    </div>
                    <button 
                      onClick={() => setSelectedFacility(null)}
                      className="text-gray-500 hover:text-white hover:bg-white/5 rounded-lg p-1.5 transition-colors font-mono text-[10px]"
                    >
                      [CLOSE]
                    </button>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{selectedFacility.details}</p>

                  <div className="grid grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 font-mono text-[11px] mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider">Antenna System</span>
                      <span className="text-gray-200">{selectedFacility.antenna}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider">Downlink Freq</span>
                      <span className="text-cyan-400">{selectedFacility.uplink}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2 pt-2 border-t border-zinc-800/40 flex justify-between flex-row items-center">
                      <span className="text-[9px] text-gray-500 uppercase tracking-wider">Operational Status</span>
                      <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded text-[10px] tracking-widest">{selectedFacility.status}</span>
                    </div>
                  </div>

                  {/* Satellite beam arc link visualiser triggers when selected */}
                  <div className="p-3 bg-cyan-400/5 rounded-lg border border-cyan-400/15 flex items-center justify-between text-[11px] font-mono mt-1">
                     <span className="text-gray-400 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        Scanning for regional overhead passes...
                     </span>
                     <span className="text-cyan-400 font-semibold animate-pulse">ONLINE</span>
                  </div>
                </motion.div>
              )}

              {/* Satellite detailed diagnostic */}
              {selectedSat && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="pointer-events-auto bg-[#09090e]/95 backdrop-blur-2xl border border-cyan-500/30 w-[420px] rounded-2xl p-6 flex flex-col gap-4 shadow-[0_0_50px_rgba(6,182,212,0.15)] shadow-[#000_0_20px_40px]"
                >
                  <div className="flex justify-between items-start border-b border-zinc-800 pb-3.5">
                    <div>
                      <div className="text-[9px] font-mono text-cyan-400 tracking-[0.25em] h-3">ORBITAL CORE DIAGNOSTIC</div>
                      <h3 className="text-lg font-semibold text-white tracking-wide">{selectedSat.name}</h3>
                      <p className="text-xs text-gray-400 font-mono">INSAT / IRS System constellation</p>
                    </div>
                    <button 
                      onClick={() => setSelectedSat(null)}
                      className="text-gray-500 hover:text-white hover:bg-white/5 rounded-lg p-1.5 transition-colors font-mono text-[10px]"
                    >
                      [CLOSE]
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 font-mono text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase">Telemetry Payload</span>
                      <span className="text-gray-200 font-sans mt-0.5">{selectedSat.payload}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase">Velocity</span>
                      <span className="text-cyan-400 mt-0.5">{selectedSat.velocity}</span>
                    </div>
                    <div className="flex flex-col pt-2 border-t border-zinc-800/45">
                      <span className="text-[9px] text-gray-500 uppercase">Latitude</span>
                      <span className="text-white mt-0.5">{selectedSat.lat.toFixed(4)}°</span>
                    </div>
                    <div className="flex flex-col pt-2 border-t border-zinc-800/45">
                      <span className="text-[9px] text-gray-500 uppercase">Longitude</span>
                      <span className="text-white mt-0.5">{selectedSat.lng.toFixed(4)}°</span>
                    </div>
                    <div className="flex flex-col col-span-2 pt-2.5 border-t border-zinc-800/45 flex justify-between flex-row items-center">
                      <span className="text-[9px] text-gray-500 uppercase">Solar Battery Bank</span>
                      <span className="text-green-400 font-bold">{selectedSat.battery}% charge</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/70 flex items-center gap-3">
                     <span className="flex-1 text-[11px] text-gray-400 font-mono">Establishing secondary S-band tracking vector down to universal ground node Bengaluru (ISTRAC).</span>
                     <button 
                       onClick={() => {
                         // Spin camera to Bengaluru instantly
                         if (globeRef.current) {
                            globeRef.current.pointOfView({
                               lat: BENGALURU.lat,
                               lng: BENGALURU.lng,
                               altitude: 1.6
                            }, 1800);
                         }
                       }}
                       className="px-3 py-1.5 bg-cyan-400/10 hover:bg-cyan-500 hover:text-black border border-cyan-400/20 rounded-lg text-[10px] font-mono text-cyan-400 font-bold tracking-wider transition-all"
                     >
                       RE-INDEX GROUND LINK
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: METEOROLOGICAL ANOMALIES & HEATING */}
          <div className="w-96 flex flex-col gap-4 pointer-events-auto overflow-y-auto">
            
            <AnimatePresence mode="wait">
              {(currentLayer === 'climate' || currentLayer === 'india_weather' || currentLayer === 'india_heat') && (
                <motion.div 
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-[#000_0_20px_40px]"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h3 className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-white">
                      <Thermometer className="w-4 h-4 text-orange-400 animate-pulse" />
                      {currentLayer === 'india_heat' ? 'INDIA HEAT WAVE INDEX' : currentLayer === 'india_weather' ? 'INDIA WEATHER SYSTEMS' : 'INSAT Thermal Anomaly'}
                    </h3>
                    <span className="text-[10px] bg-orange-500/10 text-orange-400 font-mono px-2 py-0.5 rounded-md">2026 YTD</span>
                  </div>
                  
                  <div className="h-48 w-full -ml-4 mt-2 filter drop-shadow-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tempTrendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <filter id="glowOrange" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f97316" floodOpacity="0.8"/>
                          </filter>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} unit="°" domain={[0.6, 1.6]} tickFormatter={(val) => val.toFixed(1)} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        
                        <Area type="monotone" dataKey="baseline" name="Mean Baseline" stroke="#0ea5e9" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBaseline)" activeDot={{ r: 3, fill: '#0ea5e9' }} />
                        <Area type="monotone" dataKey="temp" name="2026 Anomaly" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" style={{ filter: 'url(#glowOrange)' }} activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
                        
                        {/* Interactive reference line aligned to current monthly time step */}
                        <ReferenceLine x={currentMonthName} stroke="#f97316" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: `T-${currentMonthName}`, fill: '#f97316', fontSize: 10, position: 'top', fontWeight: 600 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-3 flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <CloudRain className="w-3.5 h-3.5 text-blue-400" /> Precipitation
                      </span>
                      <span className="text-base font-semibold text-white mt-1">{precipAnomaly}<span className="text-[10px] text-gray-500 ml-1">% dev</span></span>
                    </div>
                    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-3 flex flex-col">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-orange-400" /> Temperature
                      </span>
                      <span className="text-base font-semibold text-white mt-1">+{currentTempAnomaly}°C</span>
                    </div>
                  </div>

                  {/* Thermal Index Legend */}
                  <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2 mt-1">
                     <span className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center justify-between">
                       <span>Thermal Index</span>
                       <span>°C Anomaly</span>
                     </span>
                     <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-blue-900 via-sky-400,yellow-400,orange-500,red-500 to-rose-600 opacity-90" />
                     <div className="flex justify-between text-[9px] font-mono text-gray-500">
                       <span>Cool (-10)</span>
                       <span>Avg</span>
                       <span>Warm</span>
                       <span>Hot (+20)</span>
                     </div>
                  </div>

                  {/* Active Cyclone Monitoring Warnings */}
                  <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 flex flex-col gap-1.5">
                     <span className="text-[10px] uppercase font-semibold text-red-400 tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        Met Hazard Advisories (INSAT)
                     </span>
                     <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                        Typhoon Gaemi is exhibiting severe shear with surface wind speeds near 140kt. Tracking vector: West-Northwest.
                     </p>
                  </div>
                </motion.div>
              )}

              {(currentLayer === 'ocean' || currentLayer === 'india_wind') && (
                <motion.div 
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-[#000_0_20px_40px]"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h3 className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-white">
                      <Wind className="w-4 h-4 text-emerald-400" />
                      {currentLayer === 'india_wind' ? 'INDIA WIND VECTOR CURRENTS' : 'Dynamic Vector Currents'}
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded-md">Continuous Flow</span>
                  </div>

                  {/* Current flow tracking */}
                  <div className="flex flex-col gap-3 font-mono text-[11px] bg-zinc-900/20 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex justify-between">
                       <span className="text-gray-400">Atmospheric Jet stream</span>
                       <span className="text-white font-semibold">{windSpeedMultiplier} kt</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400">Easterly Wave speed</span>
                       <span className="text-white font-semibold">22 m/s</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400">Bay of Bengal vector surge</span>
                       <span className="text-[#38bdf8] font-semibold">Elevated (Warm)</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400">Rossby Wave resonance</span>
                       <span className="text-white font-semibold">3.82 rad/s</span>
                    </div>
                  </div>

                  {/* Visual Wind Key */}
                  <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2.5">
                     <span className="text-[10px] text-gray-400 uppercase tracking-wider">Stream Color index</span>
                     <div className="flex flex-col gap-2 text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                           <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                           <span className="text-gray-300">Equatorial Trade Winds & currents (Warm)</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                           <span className="text-gray-300">Mid-latitude Westerly Streamflows (Temperate)</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-2.5 h-2.5 rounded-full bg-white" />
                           <span className="text-gray-300">Polar Vortex circulation vectors (Frigid)</span>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {currentLayer === 'india_visual' && (
                <motion.div 
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-[#000_0_20px_40px]"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h3 className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-white">
                      <Map className="w-4 h-4 text-indigo-400" />
                      Visual Topography (India)
                    </h3>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded-md">High-Res Map</span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                     High-resolution optical satellite imagery of the Indian subcontinent showing natural terrain, vegetation, and topological formations.
                  </p>

                  <div className="flex flex-col gap-3 font-mono text-[11px] bg-zinc-900/20 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex justify-between">
                       <span className="text-gray-400">Image Source</span>
                       <span className="text-white font-semibold">Cartosat-3 Optical</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400">Resolution</span>
                       <span className="text-white font-semibold">0.25 meters / px</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400">Cloud Cover Filter</span>
                       <span className="text-indigo-400 font-semibold">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-400">Last Refresh</span>
                       <span className="text-white font-semibold">Real-time (Daylight)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentLayer === 'satellites' && (
                <motion.div 
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 shadow-[#000_0_20px_40px]"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h3 className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-white">
                      <Satellite className="w-4 h-4 text-cyan-400" />
                      Active Launcher Constellation
                    </h3>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-mono px-2 py-0.5 rounded-md">Live feed</span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                     Click any satellite sphere orbiting the globe surface to lock high frequency diagnostic sensors and route ground telecom arrays.
                  </p>

                  <div className="flex flex-col gap-2 mt-1">
                     <div className="flex justify-between items-center bg-zinc-900/30 outline outline-1 outline-zinc-800 p-2.5 rounded-lg text-[11px] font-mono">
                        <span className="text-gray-400">Cartosat High Res Image Payload</span>
                        <span className="text-green-400 font-bold">ONLINE</span>
                     </div>
                     <div className="flex justify-between items-center bg-zinc-900/30 outline outline-1 outline-zinc-800 p-2.5 rounded-lg text-[11px] font-mono">
                        <span className="text-gray-400">Resourcesat Multichannel Sensor</span>
                        <span className="text-cyan-400 font-bold">STANDBY</span>
                     </div>
                     <div className="flex justify-between items-center bg-zinc-900/30 outline outline-1 outline-zinc-800 p-2.5 rounded-lg text-[11px] font-mono">
                        <span className="text-gray-400">Gaganyaan communications relay</span>
                        <span className="text-green-400 font-bold">STREAMING</span>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* TIME BAR: TIMELINE INDEX SCRUBBER */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-30 w-[640px]">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
            className="bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl px-6 py-4 flex items-center gap-5 shadow-[#000_0_20px_50px] w-full"
          >
            {/* Play Button */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-black hover:scale-105 transition-all p-2.5 bg-cyan-400 hover:bg-cyan-300 rounded-xl"
              title={isPlaying ? "Pause Simulation" : "Start Timeline Simulation"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Time Slider */}
            <div className="flex-1 flex flex-col gap-1.5 select-none relative">
               <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.15em]">
                  <span className="text-gray-500">History (-48h)</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
                     <span className={`w-1.5 h-1.5 bg-cyan-400 rounded-full ${isPlaying ? 'animate-ping' : ''}`} />
                     {Math.abs(timeStep - 50) < 0.5 ? 'LIVE' : `${currentMonthName} 2026 : T${timeStep > 50 ? '+' : '-'}${(Math.abs(timeStep - 50) * 0.96).toFixed(1)}h`}
                  </span>
                  <span className="text-gray-500">Projection (+48h)</span>
               </div>
               
               <div className="relative flex items-center mt-2 h-4">
                 {/* Timeline markers */}
                 <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                    {[0, 25, 50, 75, 100].map(mark => (
                       <div key={mark} className="flex flex-col items-center">
                          <div className={`w-[1px] h-2 ${mark === 50 ? 'bg-cyan-500' : 'bg-zinc-600'}`} />
                          <span className={`text-[8px] font-mono mt-1 ${mark === 50 ? 'text-cyan-500 font-bold' : 'text-zinc-600'}`}>
                             {mark === 50 ? 'LIVE' : ''}
                          </span>
                       </div>
                    ))}
                 </div>
                 
                 <input 
                    type="range"
                    min="0" max="100" step="0.1"
                    value={timeStep}
                    onChange={(e) => setTimeStep(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800/80 rounded-full appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_12px_#00e5ff] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 z-10 relative bg-transparent"
                 />
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-900 to-cyan-400 rounded-l-full pointer-events-none" style={{ width: `${Math.min(100, Math.max(0, timeStep))}%` }} />
               </div>
            </div>

            {/* Reset Button */}
            <button 
              onClick={() => {
                setTimeStep(50);
                setIsPlaying(false);
              }}
              className="p-2.5 hover:bg-white/5 border border-zinc-800/80 rounded-xl hover:text-white text-gray-400 transition-colors"
              title="Reset to center time"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

      </div>

      {/* SETTINGS SLIDE PANEL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-80 bg-zinc-950 border-l border-zinc-800 z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-white font-mono tracking-widest flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  SYSTEM SETTINGS
                </h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Graphics & Rendering</h3>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">Day / Night Cycle</div>
                        <div className="text-[10px] text-gray-500">Enable realistic solar illumination</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDayNightMode(!dayNightMode)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${dayNightMode ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${dayNightMode ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                        <CloudRain className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">Real-time Clouds</div>
                        <div className="text-[10px] text-gray-500">Live atmospheric cloud layer</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCloudsMode(!cloudsMode)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cloudsMode ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${cloudsMode ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Region Focus</h3>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">India Regional Mode</div>
                        <div className="text-[10px] text-gray-500">Lock focus to Indian subcontinent</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIndiaMode(!indiaMode);
                        if (!indiaMode) {
                          setCurrentLayer('india_weather');
                        } else {
                          setCurrentLayer('satellites');
                        }
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${indiaMode ? 'bg-orange-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${indiaMode ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-red-400 mb-1">SYSTEM WARNING</div>
                      <div className="text-[10px] text-red-400/80 leading-relaxed">
                        Modifying rendering settings may impact performance. Ensure adequate GPU resources are available before enabling complex atmospheric simulations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DigitalTwin;

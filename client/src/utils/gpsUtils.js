import { SCHOOL_LOCATIONS } from './gpsData';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const getCoordinatesFromAddress = async (address, number, neighborhood, city = "Imbé", state = "RS") => {
  if (!GOOGLE_API_KEY) {
    console.error("ERRO CRÍTICO: Chave da API do Google não encontrada no .env!");
    return null;
  }

  try {
    const query = `${address}, ${number} - ${neighborhood}, ${city} - ${state}, Brazil`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      console.log("📍 Google Maps encontrou:", location.lat, location.lng);
      return { lat: location.lat, lon: location.lng };
    } else {
      console.error("Erro Google Maps:", data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error("Erro na requisição de Geocoding:", error);
    return null;
  }
};

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export const findNearestRoute = (studentCoords, allRoutes, schoolName, maxDistanceMeters = 600) => {
  let bestRoute = null;
  let shortestDistanceToHome = Infinity;

  const schoolCoords = SCHOOL_LOCATIONS[schoolName];

  if (!schoolCoords) {
    return {
      found: false,
      text: `Localização da escola "${schoolName}" não cadastrada no sistema.`,
      errorType: 'SCHOOL_NOT_FOUND'
    };
  }

  allRoutes.forEach(route => {
    let bestHomeStopIndex = -1;
    let distToHome = Infinity;

    route.stops.forEach((stop, index) => {
      const d = getDistanceFromLatLonInMeters(studentCoords.lat, studentCoords.lon, stop.lat, stop.lon);
      if (d < distToHome) {
        distToHome = d;
        bestHomeStopIndex = index;
      }
    });

    let bestSchoolStopIndex = -1;
    let distToSchool = Infinity;

    route.stops.forEach((stop, index) => {
      const d = getDistanceFromLatLonInMeters(schoolCoords.lat, schoolCoords.lon, stop.lat, stop.lon);
      if (d < distToSchool) {
        distToSchool = d;
        bestSchoolStopIndex = index;
      }
    });

    const isHomeNear = distToHome <= maxDistanceMeters;
    const isSchoolNear = distToSchool <= 800;
    
    const isDirectionCorrect = bestHomeStopIndex < bestSchoolStopIndex;

    if (isHomeNear && isSchoolNear && isDirectionCorrect) {
      if (distToHome < shortestDistanceToHome) {
        shortestDistanceToHome = distToHome;
        bestRoute = route;
      }
    }
  });

  if (bestRoute) {
    return {
      found: true,
      name: bestRoute.name,
      reason: `Embarque a ${Math.round(shortestDistanceToHome)}m de casa. Sentido correto até ${schoolName}.`
    };
  }

  return { found: false, text: "Nenhuma rota encontrada que passe na casa ANTES da escola." };
};
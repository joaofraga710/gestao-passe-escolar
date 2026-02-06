// src/utils/gpsUtils.js

// 1. Função para converter Endereço -> Coordenadas
// O ERRO ESTAVA AQUI: Precisa ter "export" na frente
export const getCoordinatesFromAddress = async (address, number, neighborhood, city = "Imbé", state = "RS") => {
  try {
    // Monta a busca: "Rua X, 123, Bairro Y, Cidade, Estado"
    const query = `${address}, ${number}, ${neighborhood}, ${city}, ${state}, Brazil`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    // O cabeçalho User-Agent é boa prática
    const response = await fetch(url, { headers: { 'User-Agent': 'SchoolPassSystem/1.0' } });
    const data = await response.json();

    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    console.error("Erro no Geocoding:", error);
    return null;
  }
};

// 2. Matemática para calcular distância (Interna, não precisa de export)
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Raio da terra em metros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// 3. Função principal que acha a melhor rota
// ESSA TAMBÉM PRECISA DO "export"
export const findNearestRoute = (studentCoords, allRoutes, maxDistanceMeters = 600) => {
  let bestRoute = null;
  let shortestDistance = Infinity;

  allRoutes.forEach(route => {
    route.stops.forEach(stop => {
      const distance = getDistanceFromLatLonInMeters(
        studentCoords.lat, 
        studentCoords.lon, 
        stop.lat, 
        stop.lon
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        bestRoute = route;
      }
    });
  });

  if (shortestDistance <= maxDistanceMeters && bestRoute) {
    return {
      found: true,
      name: bestRoute.name,
      reason: `Detectado a ${Math.round(shortestDistance)} metros do trajeto.`
    };
  }

  return { found: false, text: `Nenhuma rota próxima (Mínimo: ${Math.round(shortestDistance)}m).` };
};
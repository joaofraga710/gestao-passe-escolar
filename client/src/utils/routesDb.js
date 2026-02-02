export const normalizeText = (text) => {
  if (!text) return "";
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

export const BUS_ROUTES_DB = [
  {
    name: "Rota 12",
    itinerary: [
      "João Clemente",
      "Santa Catarina",
      "Palmarito Saraiva",
      "21 de abril",
      "Courhasa",
      "Presidente",
      "EMEF Prof. Clelia de Moraes",
      "Riviera", 
      "Ipiranga", 
      "Nordeste",
      "Nova Nordeste",
      "EMEI Vó Rosa",
      "EMEF Norberto Martinho Cardoso",
      "EMEI Prof Iara Martins",
      "EMEF Rui Barbosa",
      "Mariluz",
      "Capeb I"
    ]
    },
    {
    name: "Rota 13",
    itinerary: [
      "Ipiranga",
      "Riviera",
      "Nova Nordeste",
      "EMEI Vó Rosa",
      "EMEF Norberto Martinho Cardoso",
      "EMEF Prof. Clelia de Moraes",
      "Presidente",
      "Courhasa",
      "EMEI Prof Pedrinha",
      "EMEF Manoel Mendes",
      "21 de abril",
      "EMEF Tiradentes", 
      "Palmarito Saraiva",
      "Santa Catarina",
      "EMEF Estado de Santa Catarina",
      "EMEI Chapeuzinho Vermelho",
    ]
    },
    {
    name: "Rota 14",
    itinerary: [
      "Nordeste",
      "Mariluz",
      "Mariluz Plano B",
      "Mariluz Plano C",
      "Harmonia",
      "Mariluz Norte",
      "Albatroz",
      "Santa Terezinha",
      "Marisul",
      "EEEM Reinaldo Vacari",
      "Albatroz",
      "EMEF Olavo Bilac",
      "EMEI Tia Marica",
      "Palmarito Saraiva",
    ]
    },
    {
    name: "Rota 15",
    itinerary: [
      "Santa Terezinha",
      "Marisul",
      "Albatroz",
      "Mariluz Norte",
      "Harmonia Ext. B",
      "Mariluz Plano D",
      "Mariluz",
      "EMEF Rui Barbosa",
      "EMEI Prof Iara Martins",
      "Nova Nordeste",
      "EMEI Vó Rosa",
      "EMEF Norberto Martinho Cardoso",
      "EMEF Prof. Clelia de Moraes",
    ]
    },
    {
    name: "Rota 16",
    itinerary: [
      "Mariluz",
      "Mariluz Plano B",
      "Mariluz Plano C",
      "Mariluz Plano D",
      "EMEI Peixinho Dourado",
      "Capeb II",
      "Harmonia Ext. B",
      "Harmonia",
      "EEEM Reinaldo Vacari",
      "Mariluz Norte",
      "Albatroz",
      "Marisul",
      "Santa Terezinha",
      "Santa Terezinha Norte",
      "Imara",
      "Santa Terezinha",
      "Marisul",
      "Albatroz",
      "EMEF Olavo Bilac",
      "EMEI Tia Marica",
      "Mariluz Norte",
      "Capeb II",
      "EMEI Peixinho Dourado",
    ]
    },
    {
    name: "Rota 17",
    itinerary: [
      "Nova Santa Terezinha Norte",
      "Imara",
      "Santa Terezinha Norte",
      "Santa Terezinha",
      "Marisul",
      "Albatroz",
      "Mariluz Norte",
      "Harmonia",
      "Mariluz Plano C",
      "Mariluz Plano B",
      "Mariluz",
      "EMEF Rui Barbosa",
      "EMEI Prof Iara Martins",
      "Santa Terezinha Norte",
      "Nordeste",
      "Nova Nordeste",
      "EMEI Vó Rosa",
      "EMEF Norberto Martinho Cardoso",
      "Ipiranga",
      "EMEF Prof. Clelia de Moraes",
    ]
    },
    {
    name: "Rota 18",
    itinerary: [
      "21 de abril",
      "Palmarito Saraiva",
      "Santa Catarina",
      "João Clemente",
      "Centro",
      "Barra Norte",
      "Centro",
      "EMEF Manoel Mendes",
      "Courhasa",
      "EMEI Prof Pedrinha",
      "EMEF Tiradentes",
      "EMEF Estado de Santa Catarina",
      "EMEI Chapeuzinho Vermelho",
    ]
    },
    {
    name: "Rota 22",
    itinerary: [
      "Presidente",
      "Escandelar",
      "EMEI Prof Pedrinha",
      "Courhasa",
      "Centro",
      "EMEF Manoel Mendes",
      "21 de abril",
      "EMEF Tiradentes",
      "Palmarito Saraiva",
      "Santa Catarina",
      "EMEF Estado de Santa Catarina",
      "EMEI Chapeuzinho Vermelho",
    ]
    },
];

export const calculateBestRoute = (street, neighborhood, school) => {
  const cleanNeighborhood = normalizeText(neighborhood);
  const cleanSchool = normalizeText(school);

  if (!cleanNeighborhood || !cleanSchool) return null;

  for (const route of BUS_ROUTES_DB) {
    const pickupIndex = route.itinerary.findIndex(point => 
      normalizeText(point).includes(cleanNeighborhood)
    );

    const dropoffIndex = route.itinerary.findIndex(point => 
      normalizeText(point).includes(cleanSchool)
    );

    if (pickupIndex !== -1 && dropoffIndex !== -1) {
      if (pickupIndex < dropoffIndex) {
        return { 
          name: route.name, 
          type: 'exact',
          reason: `Passa em ${route.itinerary[pickupIndex]} antes de chegar em ${route.itinerary[dropoffIndex]}`
        };
      } else {
        continue; 
      }
    }
  }
  return null;
};
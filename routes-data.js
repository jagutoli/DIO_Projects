/**
 * RoutesDB - Database of Brazilian Routes
 * 
 * Global object containing popular Brazilian routes and methods to query them.
 * Each route includes origin city, destination city, and distance in kilometers.
 * 
 * Structure:
 * - routes: Array of route objects {origin, destination, distanceKm}
 * - getAllCities(): Returns unique sorted array of all cities
 * - findDistance(origin, destination): Returns distance between two cities
 */

const RoutesDB = {
    /**
     * Array of popular Brazilian routes
     * Each route object contains:
     * - origin: string (city name with state abbreviation, e.g., "São Paulo, SP")
     * - destination: string (city name with state abbreviation)
     * - distanceKm: number (distance in kilometers)
     */
    routes: [
        // Southeast - Capital Routes
        { origin: "São Paulo, SP", destination: "Rio de Janeiro, RJ", distanceKm: 430 },
        { origin: "São Paulo, SP", destination: "Brasília, DF", distanceKm: 1015 },
        { origin: "Rio de Janeiro, RJ", destination: "Brasília, DF", distanceKm: 1148 },
        { origin: "Belo Horizonte, MG", destination: "Rio de Janeiro, RJ", distanceKm: 440 },
        { origin: "São Paulo, SP", destination: "Belo Horizonte, MG", distanceKm: 586 },

        // Southeast - Regional Routes
        { origin: "São Paulo, SP", destination: "Campinas, SP", distanceKm: 95 },
        { origin: "São Paulo, SP", destination: "Santos, SP", distanceKm: 72 },
        { origin: "Rio de Janeiro, RJ", destination: "Niterói, RJ", distanceKm: 13 },
        { origin: "Rio de Janeiro, RJ", destination: "Duque de Caxias, RJ", distanceKm: 35 },
        { origin: "Belo Horizonte, MG", destination: "Ouro Preto, MG", distanceKm: 100 },
        { origin: "São Paulo, SP", destination: "Sorocaba, SP", distanceKm: 108 },
        { origin: "São Paulo, SP", destination: "Ribeirão Preto, SP", distanceKm: 315 },

        // North Routes
        { origin: "Manaus, AM", destination: "Porto Velho, RO", distanceKm: 1254 },
        { origin: "Belém, PA", destination: "Macapá, AP", distanceKm: 458 },
        { origin: "Manaus, AM", destination: "Belém, PA", distanceKm: 1500 },
        { origin: "Belém, PA", destination: "Anápolis, GO", distanceKm: 1600 },

        // Northeast Routes
        { origin: "Salvador, BA", destination: "Recife, PE", distanceKm: 840 },
        { origin: "Recife, PE", destination: "Fortaleza, CE", distanceKm: 800 },
        { origin: "Fortaleza, CE", destination: "Natal, RN", distanceKm: 530 },
        { origin: "Salvador, BA", destination: "Maceió, AL", distanceKm: 290 },
        { origin: "Maceió, AL", destination: "Recife, PE", distanceKm: 260 },
        { origin: "Brasília, DF", destination: "Salvador, BA", distanceKm: 1790 },
        { origin: "Rio de Janeiro, RJ", destination: "Salvador, BA", distanceKm: 1580 },

        // South Routes
        { origin: "São Paulo, SP", destination: "Curitiba, PR", distanceKm: 408 },
        { origin: "Curitiba, PR", destination: "Porto Alegre, RS", distanceKm: 710 },
        { origin: "São Paulo, SP", destination: "Porto Alegre, RS", distanceKm: 1110 },
        { origin: "Curitiba, PR", destination: "Florianópolis, SC", distanceKm: 345 },
        { origin: "Brasília, DF", destination: "Curitiba, PR", distanceKm: 1165 },
        { origin: "Porto Alegre, RS", destination: "Santa Maria, RS", distanceKm: 290 },

        // Central-West Routes
        { origin: "Brasília, DF", destination: "Goiânia, GO", distanceKm: 209 },
        { origin: "Brasília, DF", destination: "Anápolis, GO", distanceKm: 150 },
        { origin: "Brasília, DF", destination: "Cuiabá, MT", distanceKm: 925 },
        { origin: "Goiânia, GO", destination: "Cuiabá, MT", distanceKm: 842 },
        { origin: "Campo Grande, MS", destination: "Brasília, DF", distanceKm: 1000 },

        // Additional Popular Routes
        { origin: "Campinas, SP", destination: "Rio de Janeiro, RJ", distanceKm: 510 },
        { origin: "São Paulo, SP", destination: "Londrina, PR", distanceKm: 585 },
        { origin: "Brasília, DF", destination: "Rio de Janeiro, RJ", distanceKm: 1148 },
        { origin: "Recife, PE", destination: "João Pessoa, PB", distanceKm: 120 },
        { origin: "Fortaleza, CE", destination: "Juazeiro do Norte, CE", distanceKm: 555 }
    ],

    /**
     * getAllCities()
     * 
     * Extracts all unique city names from routes and returns them sorted alphabetically.
     * 
     * Returns:
     * - Array of strings: unique city names in alphabetical order
     * 
     * Example: ["Anápolis, GO", "Belém, PA", "Belo Horizonte, MG", ...]
     */
    getAllCities: function() {
        // Create a Set to store unique cities
        const citiesSet = new Set();

        // Extract cities from both origin and destination
        this.routes.forEach(route => {
            citiesSet.add(route.origin);
            citiesSet.add(route.destination);
        });

        // Convert Set to Array and sort alphabetically
        return Array.from(citiesSet).sort();
    },

    /**
     * findDistance(origin, destination)
     * 
     * Searches for the distance between two cities.
     * The search is case-insensitive and handles whitespace.
     * Checks both directions: origin-destination and destination-origin.
     * 
     * Parameters:
     * - origin (string): Starting city name (e.g., "São Paulo, SP")
     * - destination (string): Ending city name (e.g., "Rio de Janeiro, RJ")
     * 
     * Returns:
     * - number: Distance in kilometers if found
     * - null: If no route exists between the cities
     * 
     * Example: 
     * - findDistance("São Paulo, SP", "Rio de Janeiro, RJ") returns 430
     * - findDistance("Rio de Janeiro, RJ", "São Paulo, SP") returns 430 (reverse search)
     * - findDistance("Unknown City, XX", "Another City, YY") returns null
     */
    findDistance: function(origin, destination) {
        // Normalize inputs: trim whitespace and convert to lowercase
        const normalizedOrigin = origin.trim().toLowerCase();
        const normalizedDestination = destination.trim().toLowerCase();

        // Search for route in both directions
        for (const route of this.routes) {
            const routeOrigin = route.origin.toLowerCase();
            const routeDestination = route.destination.toLowerCase();

            // Check forward direction (origin -> destination)
            if (routeOrigin === normalizedOrigin && routeDestination === normalizedDestination) {
                return route.distanceKm;
            }

            // Check reverse direction (destination -> origin)
            if (routeOrigin === normalizedDestination && routeDestination === normalizedOrigin) {
                return route.distanceKm;
            }
        }

        // Route not found
        return null;
    }
};

/**
 * CONFIG - Application Configuration
 * 
 * Global object containing all configuration settings for the EcoTrip calculator:
 * - Emission factors for different transport modes
 * - Transport mode metadata (labels, icons, colors)
 * - Carbon credit pricing and conversion
 * - Initialization methods for UI setup
 */

const CONFIG = {
    /**
     * EMISSION_FACTORS
     * CO2 emissions in kg per kilometer for each transport mode
     * Used to calculate total emissions based on distance traveled
     */
    EMISSION_FACTORS: {
        bicycle: 0,           // 0 kg CO2/km (zero emissions)
        car: 0.12,            // 0.12 kg CO2/km
        bus: 0.089,           // 0.089 kg CO2/km (shared transport)
        truck: 0.96           // 0.96 kg CO2/km (commercial vehicles)
    },

    /**
     * TRANSPORT_MODES
     * Metadata for each transport mode used in the UI
     * Each mode includes: label (Portuguese), icon (emoji), color (hex)
     */
    TRANSPORT_MODES: {
        bicycle: {
            label: "Bicicleta",
            icon: "🚲",
            color: "#3b82f6"  // Blue
        },
        car: {
            label: "Carro",
            icon: "🚗",
            color: "#ef4444"  // Red
        },
        bus: {
            label: "Ônibus",
            icon: "🚌",
            color: "#f59e0b"  // Amber
        },
        truck: {
            label: "Caminhão",
            icon: "🚛",
            color: "#8b5cf6"  // Purple
        }
    },

    /**
     * CARBON_CREDIT
     * Configuration for carbon credit conversion and pricing
     */
    CARBON_CREDIT: {
        KG_PER_CREDIT: 1000,      // 1 credit = 1000 kg CO2
        PRICE_MIN_BRL: 50,        // Minimum price per credit in BRL
        PRICE_MAX_BRL: 150        // Maximum price per credit in BRL
    },

    /**
     * populateDatalist()
     * 
     * Populates the cities datalist with all available cities from RoutesDB.
     * Creates <option> elements for each city and appends to the datalist.
     * 
     * Assumes:
     * - RoutesDB is loaded and available globally
     * - HTML has a <datalist id="cities-list"></datalist>
     * 
     * This enables autocomplete functionality in origin and destination inputs.
     */
    populateDatalist: function() {
        try {
            // Get datalist element
            const datalist = document.getElementById('cities-list');
            
            if (!datalist) {
                console.error('Datalist element with id "cities-list" not found');
                return;
            }

            // Get all unique cities from RoutesDB
            const cities = RoutesDB.getAllCities();

            // Clear existing options
            datalist.innerHTML = '';

            // Create and append option elements for each city
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                datalist.appendChild(option);
            });

            console.log(`Datalist populated with ${cities.length} cities`);
        } catch (error) {
            console.error('Error populating datalist:', error);
        }
    },

    /**
     * setupDistanceAutofill()
     * 
     * Sets up automatic distance calculation based on origin and destination inputs.
     * - Listens to changes on origin and destination inputs
     * - Automatically fills distance using RoutesDB.findDistance()
     * - Allows manual distance entry via checkbox
     * - Updates helper text based on success/failure
     * 
     * Assumes HTML structure:
     * - Input elements with ids: "origin", "destination", "distance"
     * - Checkbox with id: "manual-distance"
     * - Helper text element with id: "distance-help"
     */
    setupDistanceAutofill: function() {
        try {
            // Get form elements
            const originInput = document.getElementById('origin');
            const destinationInput = document.getElementById('destination');
            const distanceInput = document.getElementById('distance');
            const manualCheckbox = document.getElementById('manual-distance');
            const helperText = document.getElementById('distance-help');

            // Verify all elements exist
            if (!originInput || !destinationInput || !distanceInput || !manualCheckbox || !helperText) {
                console.error('One or more required form elements not found');
                return;
            }

            /**
             * Auto-fill distance based on origin and destination
             */
            const autoFillDistance = () => {
                // Get trimmed values
                const origin = originInput.value.trim();
                const destination = destinationInput.value.trim();

                // Only proceed if both fields are filled
                if (!origin || !destination) {
                    distanceInput.value = '';
                    helperText.textContent = 'A distância será preenchida automaticamente';
                    helperText.style.color = 'var(--text-light)';
                    distanceInput.readOnly = true;
                    return;
                }

                // Try to find distance
                const distance = RoutesDB.findDistance(origin, destination);

                if (distance !== null) {
                    // Distance found - fill input and make readonly
                    distanceInput.value = distance;
                    distanceInput.readOnly = true;
                    helperText.textContent = '✓ Distância encontrada automaticamente';
                    helperText.style.color = '#10b981'; // Primary green
                    console.log(`Distance found: ${distance} km`);
                } else {
                    // Distance not found - suggest manual input
                    distanceInput.value = '';
                    distanceInput.readOnly = true;
                    helperText.textContent = '⚠ Rota não encontrada. Use o checkbox para inserir manualmente';
                    helperText.style.color = '#f59e0b'; // Warning amber
                    console.log('Route not found in database');
                }
            };

            /**
             * Event listeners for origin and destination inputs
             */
            originInput.addEventListener('change', autoFillDistance);
            destinationInput.addEventListener('change', autoFillDistance);

            /**
             * Event listener for manual distance checkbox
             */
            manualCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    // Checkbox is checked - allow manual entry
                    distanceInput.readOnly = false;
                    distanceInput.focus();
                    helperText.textContent = 'Insira a distância em quilômetros';
                    helperText.style.color = 'var(--text-light)';
                    console.log('Manual distance entry enabled');
                } else {
                    // Checkbox is unchecked - try auto-fill again
                    distanceInput.readOnly = true;
                    autoFillDistance();
                    console.log('Manual distance entry disabled, attempting auto-fill');
                }
            });

            console.log('Distance autofill setup completed');
        } catch (error) {
            console.error('Error setting up distance autofill:', error);
        }
    }
};

/**
 * Initialize CONFIG on page load
 * This runs the setup functions when the DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        CONFIG.populateDatalist();
        CONFIG.setupDistanceAutofill();
    });
} else {
    // DOM is already ready
    CONFIG.populateDatalist();
    CONFIG.setupDistanceAutofill();
}

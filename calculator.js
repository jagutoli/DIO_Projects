/**
 * Global Calculator Object
 * Handles carbon emission calculations and carbon credit estimations for EcoTrip
 */
const Calculator = {
  /**
   * Calculates CO2 emissions for a given distance and transport mode
   * Formula: distance (km) * emission factor (kg CO2/km) = total emissions (kg CO2)
   * 
   * @param {number} distanceKM - Distance traveled in kilometers
   * @param {string} transportMode - Type of transport ('car', 'bus', 'train', 'bike', 'walking')
   * @returns {number} CO2 emissions rounded to 2 decimal places
   */
  calculateEmission: function(distanceKM, transportMode) {
    // Get the emission factor from CONFIG based on transport mode
    const emissionFactor = CONFIG.EMISSION_FACTORS[transportMode];
    
    // Validate that the transport mode exists
    if (emissionFactor === undefined) {
      console.error(`Unknown transport mode: ${transportMode}`);
      return 0;
    }
    
    // Calculate total emissions: distance × emission factor
    const emission = distanceKM * emissionFactor;
    
    // Return result rounded to 2 decimal places
    return Math.round(emission * 100) / 100;
  },

  /**
   * Calculates emissions for all transport modes and compares them to car baseline
   * Shows each mode's emissions and percentage difference vs driving a car
   * Results are sorted by emission level (most eco-friendly first)
   * 
   * @param {number} distanceKM - Distance traveled in kilometers
   * @returns {Array<Object>} Array of objects with {mode, emission, percentageVsCar}
   */
  calculateAllModes: function(distanceKM) {
    // Create array to store results for each transport mode
    const results = [];
    
    // Calculate car emission as baseline for comparison
    const carEmission = this.calculateEmission(distanceKM, 'car');
    
    // Iterate through each transport mode in CONFIG.EMISSION_FACTORS
    for (const mode in CONFIG.EMISSION_FACTORS) {
      if (CONFIG.EMISSION_FACTORS.hasOwnProperty(mode)) {
        // Calculate emission for current transport mode
        const emission = this.calculateEmission(distanceKM, mode);
        
        // Calculate percentage vs car: (mode emission / car emission) * 100
        // This shows how much better (or worse) this mode is compared to driving
        const percentageVsCar = (emission / carEmission) * 100;
        
        // Push result object to array
        results.push({
          mode: mode,
          emission: emission,
          percentageVsCar: Math.round(percentageVsCar * 100) / 100
        });
      }
    }
    
    // Sort array by emission (lowest/best first)
    results.sort((a, b) => a.emission - b.emission);
    
    // Return sorted array
    return results;
  },

  /**
   * Calculates CO2 savings achieved by switching from baseline to alternative transport
   * Shows absolute savings in kg and percentage reduction
   * 
   * @param {number} emission - Emissions from chosen transport mode (kg CO2)
   * @param {number} baselineEmission - Emissions from baseline transport (typically car) (kg CO2)
   * @returns {Object} {savedKG: number, percentage: number}
   */
  calculateSavings: function(emission, baselineEmission) {
    // Calculate saved kg: how many kilograms of CO2 were avoided
    const savedKG = baselineEmission - emission;
    
    // Calculate percentage: (saved / baseline) * 100
    // Shows what percentage reduction this represents from the original
    const percentage = (savedKG / baselineEmission) * 100;
    
    // Return object with savings rounded to 2 decimal places
    return {
      savedKG: Math.round(savedKG * 100) / 100,
      percentage: Math.round(percentage * 100) / 100
    };
  },

  /**
   * Converts CO2 emissions to carbon credits
   * Based on CONFIG.CARBON_CREDIT.KG_PER_CREDIT exchange rate
   * 1 carbon credit typically = 1 ton (1000 kg) of CO2 offset
   * 
   * @param {number} emissionKg - CO2 emissions in kilograms
   * @returns {number} Carbon credits rounded to 4 decimal places
   */
  calculateCarbonCredits: function(emissionKg) {
    // Divide emission by kg per credit to get number of credits
    // Example: 500 kg ÷ 1000 kg per credit = 0.5 credits
    const credits = emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT;
    
    // Return credits rounded to 4 decimal places
    return Math.round(credits * 10000) / 10000;
  },

  /**
   * Estimates the monetary value of carbon credits
   * Calculates min, max, and average price based on current market rates
   * Uses BRL (Brazilian Real) currency
   * 
   * @param {number} credits - Number of carbon credits
   * @returns {Object} {min: number, max: number, average: number}
   */
  estimateCreditPrice: function(credits) {
    // Calculate minimum price: credits × minimum price per credit
    // Shows lowest market value scenario
    const min = credits * CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
    
    // Calculate maximum price: credits × maximum price per credit
    // Shows highest market value scenario
    const max = credits * CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;
    
    // Calculate average price: (min + max) / 2
    // Shows middle estimate of credit value
    const average = (min + max) / 2;
    
    // Return object with all values rounded to 2 decimal places
    return {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      average: Math.round(average * 100) / 100
    };
  }
};

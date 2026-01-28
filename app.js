/**
 * EcoTrip Application - Main App Logic
 * Handles form initialization, input validation, and calculation workflow
 */

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // =====================
  // INITIALIZATION
  // =====================

  // Populate city autocomplete datalist with available cities
  CONFIG.populateDatalist();

  // Setup automatic distance autofill based on origin/destination
  CONFIG.setupDistanceAutofill();

  // Get the calculator form element by ID
  const calculatorForm = document.getElementById('calculator-form');

  // Validate that form element exists
  if (!calculatorForm) {
    console.error('Calculator form element not found');
    return;
  }

  // Add submit event listener to form
  calculatorForm.addEventListener('submit', handleFormSubmit);

  // Log initialization completion
  console.log('Calculadora inicializada');
});

/**
 * Handles form submission and triggers calculation workflow
 * Validates user input, shows loading state, and renders results
 * 
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
  // =====================
  // PREVENT DEFAULT & GET FORM VALUES
  // =====================

  // Prevent default form submission behavior
  event.preventDefault();

  // Get origin city and trim whitespace
  const originValue = document.getElementById('origin').value.trim();

  // Get destination city and trim whitespace
  const destinationValue = document.getElementById('destination').value.trim();

  // Get distance value and parse as float for calculations
  const distanceValue = parseFloat(document.getElementById('distance').value);

  // Get selected transport mode from checked radio button
  const transportModeElement = document.querySelector('input[name="transport"]:checked');
  const transportMode = transportModeElement ? transportModeElement.value : null;

  // =====================
  // INPUT VALIDATION
  // =====================

  // Validate that origin is not empty
  if (!originValue) {
    alert('Por favor, preencha a cidade de origem');
    return;
  }

  // Validate that destination is not empty
  if (!destinationValue) {
    alert('Por favor, preencha a cidade de destino');
    return;
  }

  // Validate that distance is filled and greater than 0
  if (!distanceValue || distanceValue <= 0) {
    alert('Por favor, preencha uma distância válida (maior que 0)');
    return;
  }

  // Validate that a transport mode is selected
  if (!transportMode) {
    alert('Por favor, selecione um modo de transporte');
    return;
  }

  // =====================
  // SHOW LOADING STATE
  // =====================

  // Get submit button element
  const submitButton = event.target.querySelector('button[type="submit"]');

  // Show loading state on button (spinner + text)
  UI.showLoading(submitButton);

  // =====================
  // HIDE PREVIOUS RESULTS
  // =====================

  // Hide previous results sections
  const resultsSection = document.getElementById('results');
  const comparisonSection = document.getElementById('comparison');
  const creditsSection = document.getElementById('carbon-credits');

  if (resultsSection) resultsSection.classList.add('hidden');
  if (comparisonSection) comparisonSection.classList.add('hidden');
  if (creditsSection) creditsSection.classList.add('hidden');

  // =====================
  // SIMULATE PROCESSING WITH DELAY
  // =====================

  // Use setTimeout to simulate API call/processing (1500ms delay)
  setTimeout(function() {
    try {
      // =====================
      // CALCULATE EMISSIONS
      // =====================

      // Calculate emission for selected transport mode
      const selectedEmission = Calculator.calculateEmission(distanceValue, transportMode);

      // Calculate car emission as baseline for comparison
      const carEmission = Calculator.calculateEmission(distanceValue, 'car');

      // Calculate savings compared to car baseline
      const savingsData = Calculator.calculateSavings(selectedEmission, carEmission);

      // Calculate all modes for comparison modal
      const allModesComparison = Calculator.calculateAllModes(distanceValue);

      // Calculate carbon credits earned from this trip
      const credits = Calculator.calculateCarbonCredits(selectedEmission);

      // Calculate estimated price for carbon credits
      const creditsPriceData = Calculator.estimateCreditPrice(credits);

      // =====================
      // BUILD DATA OBJECTS FOR RENDERING
      // =====================

      // Build results data object
      const resultsData = {
        origin: originValue,
        destination: destinationValue,
        distance: distanceValue,
        emission: selectedEmission,
        mode: transportMode,
        savings: savingsData
      };

      // Build carbon credits data object
      const creditsData = {
        credits: credits,
        price: creditsPriceData
      };

      // =====================
      // RENDER AND DISPLAY RESULTS
      // =====================

      // Render results section (route, distance, emissions, savings)
      const resultsHTML = UI.renderResults(resultsData);
      const resultsContent = document.getElementById('results-content');
      if (resultsContent) {
        resultsContent.innerHTML = resultsHTML;
      }

      // Render comparison modal (all transport modes with stats)
      const comparisonHTML = UI.renderComparison(allModesComparison, transportMode);
      const comparisonContent = document.getElementById('comparison-content');
      if (comparisonContent) {
        comparisonContent.innerHTML = comparisonHTML;
      }

      // Render carbon credits section
      const creditsHTML = UI.renderCarbonCredits(creditsData);
      const creditsContent = document.getElementById('carbon-credits-content');
      if (creditsContent) {
        creditsContent.innerHTML = creditsHTML;
      }

      // =====================
      // SHOW RESULTS SECTIONS
      // =====================

      // Show results section
      if (resultsSection) {
        resultsSection.classList.remove('hidden');
      }

      // Show comparison section
      if (comparisonSection) {
        comparisonSection.classList.remove('hidden');
      }

      // Show carbon credits section
      if (creditsSection) {
        creditsSection.classList.remove('hidden');
      }

      // Scroll to results section to show user the calculated data
      UI.showElement('results');

      // =====================
      // HIDE LOADING STATE
      // =====================

      // Restore button to original state
      UI.hideLoading(submitButton);

    } catch (error) {
      // =====================
      // ERROR HANDLING
      // =====================

      // Log detailed error to console for debugging
      console.error('Erro ao calcular emissões:', error);

      // Show user-friendly error message
      alert('Ocorreu um erro ao processar o cálculo. Por favor, tente novamente.');

      // Restore button to original state
      UI.hideLoading(submitButton);
    }

  }, 1500); // 1500ms delay to simulate processing
}

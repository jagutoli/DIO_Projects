/**
 * Global UI Object
 * Handles all UI rendering, formatting, and DOM manipulation for EcoTrip
 */
const UI = {
  // =====================
  // UTILITY METHODS
  // =====================

  /**
   * Formats a number with specified decimal places and thousand separators
   * Uses Brazilian locale for proper formatting
   * 
   * @param {number} number - The number to format
   * @param {number} decimals - Number of decimal places (default: 2)
   * @returns {string} Formatted number string (e.g., "1.234,56")
   */
  formatNumber: function(number, decimals = 2) {
    // Use toFixed() to ensure correct number of decimal places
    const fixed = parseFloat(number).toFixed(decimals);
    
    // Use toLocaleString with pt-BR locale for thousand separators
    // This automatically adds dots for thousands and comma for decimals
    return parseFloat(fixed).toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Formats a value as Brazilian currency (BRL)
   * Returns format: R$ 1.234,56
   * 
   * @param {number} value - The value to format
   * @returns {string} Currency formatted string
   */
  formatCurrency: function(value) {
    // Use toLocaleString with pt-BR locale and currency option
    // Automatically adds 'R$' prefix and proper thousand/decimal separators
    return parseFloat(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  },

  /**
   * Shows an element and scrolls it into view smoothly
   * Useful for focusing user attention on specific sections
   * 
   * @param {string} elementId - The ID of the element to show
   */
  showElement: function(elementId) {
    // Get element by ID
    const element = document.getElementById(elementId);
    
    // Validate element exists
    if (!element) {
      console.error(`Element with ID '${elementId}' not found`);
      return;
    }
    
    // Remove hidden class if present (in case it was hidden)
    element.classList.remove('hidden');
    
    // Scroll element into view with smooth behavior
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  },

  // =====================
  // RENDERING METHODS
  // =====================

  /**
   * Renders the main results section after route calculation
   * Displays origin, destination, distance, emissions, and savings info
   * 
   * @param {Object} data - Results data object
   * @param {string} data.origin - Starting point
   * @param {string} data.destination - End point
   * @param {number} data.distance - Distance in kilometers
   * @param {number} data.emission - CO2 emission in kg
   * @param {string} data.mode - Selected transport mode
   * @param {Object} data.savings - Savings object {savedKG, percentage}
   * @returns {string} HTML string
   */
  renderResults: function(data) {
    // Get transport mode metadata from CONFIG
    const modeConfig = CONFIG.TRANSPORT_MODES[data.mode];
    
    // Validate mode exists in config
    if (!modeConfig) {
      console.error(`Transport mode '${data.mode}' not found in CONFIG`);
      return '';
    }

    // Build HTML string using template literals
    let html = `
      <div class="results-container">
        <!-- Route Card: Shows origin and destination -->
        <div class="results-card">
          <div class="results-card__header">
            <h3 class="results-card__title">Rota</h3>
          </div>
          <div class="results-card__content">
            <div class="results-card__route">
              <span class="results-card__location">${data.origin}</span>
              <span class="results-card__arrow">→</span>
              <span class="results-card__location">${data.destination}</span>
            </div>
          </div>
        </div>

        <!-- Distance Card: Shows total distance in km -->
        <div class="results-card">
          <div class="results-card__header">
            <h3 class="results-card__title">Distância</h3>
          </div>
          <div class="results-card__content">
            <div class="results-card__value">${this.formatNumber(data.distance, 2)}</div>
            <div class="results-card__unit">km</div>
          </div>
        </div>

        <!-- Emission Card: Shows CO2 emissions with icon -->
        <div class="results-card">
          <div class="results-card__header">
            <h3 class="results-card__title">Emissão de CO₂</h3>
          </div>
          <div class="results-card__content">
            <div class="results-card__icon">🍃</div>
            <div class="results-card__value">${this.formatNumber(data.emission, 2)}</div>
            <div class="results-card__unit">kg CO₂</div>
          </div>
        </div>

        <!-- Transport Mode Card: Shows selected transport with icon and label -->
        <div class="results-card">
          <div class="results-card__header">
            <h3 class="results-card__title">Transporte</h3>
          </div>
          <div class="results-card__content">
            <div class="results-card__mode-icon">${modeConfig.icon}</div>
            <div class="results-card__mode-label">${modeConfig.label}</div>
          </div>
        </div>
    `;

    // Only show savings card if selected mode is not 'car' (baseline)
    if (data.mode !== 'car' && data.savings) {
      html += `
        <!-- Savings Card: Shows CO2 saved vs car baseline -->
        <div class="results-card results-card--savings">
          <div class="results-card__header">
            <h3 class="results-card__title">Economia</h3>
          </div>
          <div class="results-card__content">
            <div class="results-card__savings-value">${this.formatNumber(data.savings.savedKG, 2)}</div>
            <div class="results-card__savings-unit">kg CO₂ economizados</div>
            <div class="results-card__savings-percent">(${this.formatNumber(data.savings.percentage, 1)}%)</div>
          </div>
        </div>
      `;
    }

    html += `</div>`;

    return html;
  },

  /**
   * Renders comparison modal with all transport modes
   * Shows emissions, percentages vs car, and visual progress bars
   * 
   * @param {Array<Object>} modesArray - Array of mode objects from calculateAllModes()
   * @param {string} selectedMode - Currently selected transport mode
   * @returns {string} HTML string
   */
  renderComparison: function(modesArray, selectedMode) {
    // Find maximum emission value for progress bar scaling
    const maxEmission = Math.max(...modesArray.map(m => m.emission));

    let html = `<div class="comparison-container">`;

    // Iterate through each transport mode
    modesArray.forEach(modeData => {
      const modeConfig = CONFIG.TRANSPORT_MODES[modeData.mode];
      
      if (!modeConfig) return;

      // Determine if this mode is currently selected
      const isSelected = modeData.mode === selectedMode;
      const selectedClass = isSelected ? 'comparison-item--selected' : '';

      // Calculate progress bar width (percentage of max emission)
      const progressWidth = (modeData.emission / maxEmission) * 100;

      // Determine progress bar color based on percentage vs car
      let barColor = 'green';
      if (modeData.percentageVsCar > 100) {
        barColor = 'red';
      } else if (modeData.percentageVsCar > 75) {
        barColor = 'orange';
      } else if (modeData.percentageVsCar > 25) {
        barColor = 'yellow';
      }

      html += `
        <!-- Comparison Item: One transport mode option -->
        <div class="comparison-item ${selectedClass}" data-mode="${modeData.mode}">
          <!-- Header with mode icon, label, and selected badge -->
          <div class="comparison-item__header">
            <div class="comparison-item__mode">
              <span class="comparison-item__icon">${modeConfig.icon}</span>
              <span class="comparison-item__label">${modeConfig.label}</span>
            </div>
            ${isSelected ? '<span class="comparison-item__badge">Selecionado</span>' : ''}
          </div>

          <!-- Stats section: Emission value and percentage vs car -->
          <div class="comparison-item__stats">
            <div class="comparison-item__emission">
              <span class="comparison-item__stat-value">${this.formatNumber(modeData.emission, 2)}</span>
              <span class="comparison-item__stat-unit">kg CO₂</span>
            </div>
            <div class="comparison-item__percentage">
              <span class="comparison-item__stat-value">${this.formatNumber(modeData.percentageVsCar, 1)}</span>
              <span class="comparison-item__stat-unit">vs Carro</span>
            </div>
          </div>

          <!-- Progress bar: Width represents emission level -->
          <!-- Color-coded: Green (0-25%), Yellow (26-75%), Orange (75-100%), Red (>100%) -->
          <div class="comparison-item__progress">
            <div class="comparison-item__progress-bar comparison-item__progress-bar--${barColor}" 
                 style="width: ${progressWidth}%">
            </div>
          </div>
        </div>
      `;
    });

    // Add helpful tip box at the end
    html += `
      <div class="comparison-tip">
        <span class="comparison-tip__icon">💡</span>
        <span class="comparison-tip__text">Quanto menor a barra, mais ecológico é o transporte!</span>
      </div>
    </div>`;

    return html;
  },

  /**
   * Renders carbon credits compensation section
   * Shows credits earned and estimated monetary value
   * 
   * @param {Object} creditsData - Credits data object
   * @param {number} creditsData.credits - Number of carbon credits earned
   * @param {Object} creditsData.price - Price data {min, max, average}
   * @returns {string} HTML string
   */
  renderCarbonCredits: function(creditsData) {
    // Destructure data for easier access
    const { credits, price } = creditsData;

    let html = `
      <div class="credits-container">
        <!-- Credits Grid: Two-column layout -->
        <div class="credits-grid">
          <!-- Card 1: Credits Earned -->
          <div class="credits-card">
            <div class="credits-card__title">Créditos Carbônicos Ganhos</div>
            <div class="credits-card__value">${this.formatNumber(credits, 4)}</div>
            <div class="credits-card__helper">1 crédito = 1.000 kg CO₂ offset</div>
          </div>

          <!-- Card 2: Estimated Price Range -->
          <div class="credits-card">
            <div class="credits-card__title">Valor Estimado (R$)</div>
            <div class="credits-card__value">${this.formatCurrency(price.average)}</div>
            <div class="credits-card__range">
              ${this.formatCurrency(price.min)} - ${this.formatCurrency(price.max)}
            </div>
          </div>
        </div>

        <!-- Info Box: Explanation of carbon credits -->
        <div class="credits-info">
          <div class="credits-info__icon">ℹ️</div>
          <div class="credits-info__text">
            <strong>O que são Créditos Carbônicos?</strong><br>
            Créditos carbônicos são certificados que representam a redução ou remoção de uma tonelada 
            métrica de dióxido de carbono (CO₂) da atmosfera. Você pode usá-los para compensar 
            emissões inevitáveis ou até mesmo comercializá-los.
          </div>
        </div>

        <!-- Action Button: Non-functional for demo -->
        <button class="btn btn--primary btn--compensate">
          Compensar Emissões
        </button>
      </div>
    `;

    return html;
  },

  // =====================
  // LOADING STATE METHODS
  // =====================

  /**
   * Shows loading state on a button
   * Disables button and displays spinner with loading text
   * Saves original text for later restoration
   * 
   * @param {HTMLElement} buttonElement - The button element to show loading state
   */
  showLoading: function(buttonElement) {
    // Validate element
    if (!buttonElement) {
      console.error('Button element not provided');
      return;
    }

    // Save original text in data attribute for later restoration
    buttonElement.dataset.originalText = buttonElement.innerHTML;

    // Disable button to prevent multiple clicks
    buttonElement.disabled = true;

    // Change innerHTML to show spinner and loading text
    // Spinner is a simple inline HTML element with loading animation
    buttonElement.innerHTML = '<span class="spinner"></span> Calculando...';

    // Add loading class for additional styling if needed
    buttonElement.classList.add('btn--loading');
  },

  /**
   * Hides loading state on a button
   * Enables button and restores original text
   * 
   * @param {HTMLElement} buttonElement - The button element to hide loading state
   */
  hideLoading: function(buttonElement) {
    // Validate element
    if (!buttonElement) {
      console.error('Button element not provided');
      return;
    }

    // Enable button for user interaction
    buttonElement.disabled = false;

    // Restore original text from data attribute
    if (buttonElement.dataset.originalText) {
      buttonElement.innerHTML = buttonElement.dataset.originalText;
    }

    // Remove loading class
    buttonElement.classList.remove('btn--loading');
  }
};

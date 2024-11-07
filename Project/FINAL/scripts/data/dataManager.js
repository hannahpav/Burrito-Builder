import { CONFIG, updateCountryNames } from '../config.js';

class DataManager {
    constructor() {
        this.data = null;
        this.isLoaded = false;
        this.loadingError = null;
        this.eventTarget = new EventTarget();
    }

    async loadData() {
        try {
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }

            const response = await fetch("data/final_burrito_data.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.data = await response.json();

            // Update country names in CONFIG
            updateCountryNames(this.data);

            this.isLoaded = true;
            this.loadingError = null;

            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }

            this.eventTarget.dispatchEvent(new Event('dataLoaded'));
            console.log("Ingredient data loaded:", this.data);
            return true;
        } catch (error) {
            this.loadingError = error;
            console.error("Error loading ingredient data:", error);

            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.innerHTML = 'Error loading data. Please refresh the page.';
                loadingIndicator.style.color = 'red';
            }

            this.eventTarget.dispatchEvent(new Event('dataLoadError'));
            return false;
        }
    }

    // Check if data is ready
    isDataReady() {
        return this.isLoaded && this.data !== null;
    }

    // Get all unique countries
    getAllCountries() {
        if (!this.isDataReady()) {
            console.warn('Attempted to get countries before data was loaded');
            return [];
        }

        const countries = new Set();

        try {
            // Add all exporting countries
            for (const country of Object.keys(this.data)) {
                countries.add(country);

                // Add importing countries
                for (const ingredient of Object.values(this.data[country])) {
                    for (const importingCountry of Object.keys(ingredient)) {
                        countries.add(importingCountry);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing country data:', error);
            return [];
        }

        return Array.from(countries).sort();
    }

    // Validate that an ingredient is available for a country
    validateIngredientAvailability(ingredient, importingCountry) {
        if (!this.isLoaded) return false;

        for (const [exportingCountry, countryData] of Object.entries(this.data)) {
            if (countryData[CONFIG.INGREDIENTS[ingredient]] &&
                countryData[CONFIG.INGREDIENTS[ingredient]][importingCountry] &&
                typeof countryData[CONFIG.INGREDIENTS[ingredient]][importingCountry].costPerKg === 'number' &&
                typeof countryData[CONFIG.INGREDIENTS[ingredient]][importingCountry].Production_Env_Impact === 'number') {
                return true;
            }
        }
        return false;
    }

    // Get valid exporters for an ingredient to a country
    getValidExporters(ingredient, importingCountry) {
        if (!this.isLoaded) return [];

        const validExporters = [];
        const properName = CONFIG.INGREDIENTS[ingredient];

        for (const [exportingCountry, countryData] of Object.entries(this.data)) {
            if (countryData[properName] &&
                countryData[properName][importingCountry] &&
                typeof countryData[properName][importingCountry].costPerKg === 'number' &&
                typeof countryData[properName][importingCountry].Production_Env_Impact === 'number') {
                validExporters.push(exportingCountry);
            }
        }

        return validExporters;
    }

    // Get cost and impact data for a specific trade route
    getTradeData(ingredient, exportingCountry, importingCountry) {
        if (!this.isLoaded) return null;

        const properName = CONFIG.INGREDIENTS[ingredient];
        try {
            const data = this.data[exportingCountry][properName][importingCountry];
            return {
                cost: data.costPerKg,
                impact: data.Production_Env_Impact,
                distance: data.distance,
                coordinates: [data.Longitude, data.Latitude]
            };
        } catch (error) {
            console.error(`Invalid trade route: ${ingredient} from ${exportingCountry} to ${importingCountry}`);
            return null;
        }
    }

    // Add event listener for data loading
    addEventListener(type, callback) {
        this.eventTarget.addEventListener(type, callback);
    }

    // Remove event listener
    removeEventListener(type, callback) {
        this.eventTarget.removeEventListener(type, callback);
    }
}

// Create singleton instance
const dataManager = new DataManager();

// Export the singleton instance as default
export default dataManager;
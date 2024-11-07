// Import required modules
import dataManager from './data/dataManager.js';
import CONFIG from './config.js';

class BurritoOptimizer {
    constructor() {
        this.initialized = false;
        this.modules = {};
    }

    async loadModules() {
        try {
            // Load modules dynamically
            const modulePromises = [
                import('./visualization/utils.js'),
                // Add other module imports here
            ];

            const loadedModules = await Promise.all(modulePromises);

            // Assign loaded modules
            [this.modules.utils] = loadedModules;

            return true;
        } catch (error) {
            console.error('Failed to load modules:', error);
            return false;
        }
    }

    // Add a method to update the Pareto front visualization
    updateParetoFront(solutions, optimalSolution) {
        if (solutions && solutions.length > 0) {
            paretoChart.draw(solutions, optimalSolution);
        }
    }

    async initialize() {
        try {
            // First load all required modules
            const modulesLoaded = await this.loadModules();
            if (!modulesLoaded) {
                throw new Error('Failed to load required modules');
            }

            // Then load data
            await dataManager.loadData();

            // Initialize UI components
            this.initializeUI();

            // Mark as initialized
            this.initialized = true;

            console.log('Burrito Optimizer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Burrito Optimizer:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    initializeUI() {
        try {
            // Update country dropdown
            const countries = dataManager.getAllCountries();
            const dropdown = document.getElementById('importing-country');

            if (!dropdown) {
                throw new Error('Country dropdown element not found');
            }

            dropdown.innerHTML = countries
                .map(country => `<option value="${country}">${country}</option>`)
                .join('');

            // Initialize ingredient checkboxes
            this.initializeIngredients();

            // Set up event handlers
            this.setupEventHandlers();
        } catch (error) {
            console.error('Error initializing UI:', error);
            this.showError('Failed to initialize UI components');
        }
    }

    initializeIngredients() {
        const container = document.getElementById('ingredients-container');
        if (!container) {
            throw new Error('Ingredients container not found');
        }

        container.innerHTML = Object.entries(CONFIG.INGREDIENTS)
            .map(([value, label]) => `
                <div class="ingredient-option">
                    <input type="checkbox" 
                           id="${value}" 
                           name="${value}" 
                           value="${value}">
                    <label for="${value}">${label}</label>
                </div>
            `)
            .join('');
    }

    setupEventHandlers() {
        // Add your event handlers here
        const ingredientCheckboxes = document.querySelectorAll('.ingredient-option input[type="checkbox"]');
        ingredientCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.handleIngredientChange.bind(this));
        });
    }

    handleIngredientChange(event) {
        // Handle ingredient selection changes
        console.log('Ingredient changed:', event.target.value, event.target.checked);
    }

    showError(message) {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.innerHTML = message;
            loadingIndicator.style.color = 'red';
            loadingIndicator.style.display = 'block';
        }
        console.error(message);
    }
}

// Create and export single instance
const app = new BurritoOptimizer();

// Export both the class and the instance
export { BurritoOptimizer, app };
export default app;
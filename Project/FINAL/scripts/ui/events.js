class EventHandler {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Weight slider events
        this.setupWeightSlider();

        // Checkbox and select events
        this.setupInputEvents();

        // Data loading events
        this.setupDataEvents();

        // Budget input events
        this.setupBudgetEvents();
    }

    setupWeightSlider() {
        const slider = document.getElementById('weight-slider');
        const costDisplay = document.getElementById('cost-weight-display');
        const impactDisplay = document.getElementById('impact-weight-display');

        slider.addEventListener('input', () => {
            const costWeight = +slider.value;
            const impactWeight = 100 - costWeight;

            costDisplay.textContent = `${costWeight}%`;
            impactDisplay.textContent = `${impactWeight}%`;

            if (dataManager.isLoaded) {
                uiUpdater.updateOptimization();
            }
        });
    }

    setupInputEvents() {
        // Ingredient checkboxes
        document.querySelectorAll('input[type="checkbox"]')
            .forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    if (dataManager.isLoaded) {
                        uiUpdater.updateOptimization();
                    }
                });
            });

        // Importing country select
        document.getElementById('importing-country')
            .addEventListener('change', () => {
                validator.updateIngredientAvailability();
                if (dataManager.isLoaded) {
                    uiUpdater.updateOptimization();
                }
            });
    }

    setupDataEvents() {
        const loadingIndicator = document.getElementById('loading-indicator');

        // Show loading indicator when starting
        loadingIndicator.style.display = 'block';

        // Hide loading indicator when data is loaded
        document.addEventListener('dataLoaded', () => {
            loadingIndicator.style.display = 'none';
            validator.updateIngredientAvailability();
            uiUpdater.updateOptimization();
        });
    }

    setupBudgetEvents() {
        const budgetInput = document.getElementById('budget-input');

        budgetInput.addEventListener('change', () => {
            if (dataManager.isLoaded) {
                uiUpdater.updateOptimization();
            }
        });
    }

    getSelectedIngredients() {
        return Array.from(
            document.querySelectorAll('input[type="checkbox"]:checked')
        ).map(el => el.value);
    }

    getImportingCountry() {
        return document.getElementById('importing-country').value;
    }

    getBudget() {
        return +document.getElementById('budget-input').value;
    }

    getWeights() {
        const costWeight = +document.getElementById('weight-slider').value / 100;
        return {
            costWeight,
            impactWeight: 1 - costWeight
        };
    }
}

// Create singleton instance
const eventHandler = new EventHandler();
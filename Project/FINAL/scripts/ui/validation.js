class Validator {
    constructor() {
        this.ingredients = new Set(Object.keys(CONFIG.INGREDIENTS));
    }

    validateInputs(selectedIngredients, importingCountry, budget) {
        // Check for empty selection
        if (!selectedIngredients.length) {
            throw new Error("Please select at least one ingredient.");
        }

        // Validate ingredients
        if (!this.validateIngredients(selectedIngredients)) {
            throw new Error("Invalid ingredient selection.");
        }

        // Validate importing country
        if (!this.validateImportingCountry(importingCountry)) {
            throw new Error("Invalid importing country.");
        }

        // Validate budget
        if (!this.validateBudget(budget)) {
            throw new Error("Invalid budget value.");
        }

        // Validate trade routes
        const invalidIngredients = this.validateTradeRoutes(
            selectedIngredients,
            importingCountry
        );

        if (invalidIngredients.length) {
            throw new Error(
                `No valid trade routes found for: ${invalidIngredients.join(', ')}`
            );
        }

        return true;
    }

    validateIngredients(ingredients) {
        return ingredients.every(ing => this.ingredients.has(ing));
    }

    validateImportingCountry(country) {
        return country && typeof country === 'string' &&
               country in CONFIG.COUNTRY_NAMES;
    }

    validateBudget(budget) {
        return !isNaN(budget) && budget > 0;
    }

    validateTradeRoutes(ingredients, importingCountry) {
        return ingredients.filter(ingredient =>
            !dataManager.validateIngredientAvailability(ingredient, importingCountry)
        );
    }

    updateIngredientAvailability() {
        const importingCountry = document.getElementById('importing-country').value;
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            const isValid = dataManager.validateIngredientAvailability(
                checkbox.value,
                importingCountry
            );

            checkbox.disabled = !isValid;
            checkbox.checked = false;

            const label = checkbox.parentElement;
            label.style.color = isValid ? '' : '#999';

            const exporters = isValid ?
                dataManager.getValidExporters(checkbox.value, importingCountry) :
                [];

            checkbox.title = isValid ?
                `Available exporters: ${exporters.join(', ')}` :
                `No valid exporters for ${checkbox.value}`;
        });
    }
}

// Create singleton instance
const validator = new Validator();
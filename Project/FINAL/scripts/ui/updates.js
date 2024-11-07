class UIUpdater {
    updateOptimization() {
        try {
            // Get current values
            const selectedIngredients = eventHandler.getSelectedIngredients();
            const importingCountry = eventHandler.getImportingCountry();
            const budget = eventHandler.getBudget();
            const weights = eventHandler.getWeights();

            // Validate inputs
            validator.validateInputs(selectedIngredients, importingCountry, budget);

            // Run optimization
            const paretoFront = optimizer.optimize(
                selectedIngredients,
                importingCountry,
                budget
            );

            if (paretoFront.length === 0) {
                this.showError("No valid solutions found within budget.");
                return;
            }

            // Select optimal solution
            const optimalSolution = optimizer.selectOptimalSolution(
                paretoFront,
                weights.costWeight,
                weights.impactWeight
            );

            // Update visualizations
            this.updateVisualizations(paretoFront, optimalSolution, importingCountry);

        } catch (error) {
            this.showError(error.message);
        }
    }

    updateVisualizations(paretoFront, optimalSolution, importingCountry) {
        // Update Pareto front visualization
        paretoChart.draw(paretoFront, optimalSolution);

        // Update map visualization
        worldMap.draw(optimalSolution, importingCountry);

        // Update solution info
        this.updateSolutionInfo(optimalSolution);
    }

    updateSolutionInfo(solution) {
        if (!solution) return;

        const solutionInfo = document.getElementById('solution-info');
        const countries = Object.values(solution.solution);
        const uniqueCountries = [...new Set(countries)];

        solutionInfo.innerHTML = `
            <p>
                Total Cost: $${solution.cost.toFixed(2)} | 
                Total Impact: ${solution.impact.toFixed(2)} | 
                Countries: ${uniqueCountries.length}
            </p>
        `;
    }

    showError(message) {
        // Clear visualizations
        paretoChart.draw([], null);
        worldMap.draw(null, null);
        document.getElementById('solution-info').innerHTML = '';

        // Show error message
        alert(message);
    }
}

// Create singleton instance
const uiUpdater = new UIUpdater();
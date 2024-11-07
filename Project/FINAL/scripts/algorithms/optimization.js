class Optimizer {
    constructor() {
        this.nsga2 = nsga2; // Using the singleton instance
    }

    // Main optimization function
    optimize(selectedIngredients, importingCountry, budget) {
        console.log("Starting optimization with budget:", budget);

        // Initialize population
        let population = this.nsga2.initializePopulation(selectedIngredients, importingCountry);

        // Run generations
        for (let gen = 0; gen < CONFIG.DEFAULT_GENERATIONS; gen++) {
            // Evaluate population
            population.forEach(individual =>
                this.nsga2.calculateFitness(individual, importingCountry)
            );

            // Filter valid solutions within budget
            let validPopulation = population.filter(individual =>
                individual.cost !== undefined &&
                individual.impact !== undefined &&
                individual.cost <= budget
            );

            if (validPopulation.length === 0) {
                console.warn(`No valid solutions within budget at generation ${gen}`);
                break;
            }

            // Create next generation
            population = this.createNextGeneration(
                validPopulation,
                importingCountry
            );
        }

        // Return final Pareto front
        return this.getFinalParetoFront(population, budget);
    }

    // Create next generation
    createNextGeneration(population, importingCountry) {
        // Non-dominated sorting
        const fronts = this.nsga2.nonDominatedSort(population);

        // Calculate crowding distance
        fronts.forEach(front =>
            this.nsga2.calculateCrowdingDistance(front)
        );

        // Selection
        const matingPool = this.nsga2.selection(
            population,
            CONFIG.DEFAULT_POPULATION_SIZE
        );

        // Create offspring
        const offspring = [];
        while (offspring.length < CONFIG.DEFAULT_POPULATION_SIZE) {
            // Select parents
            const parent1 = matingPool[
                Math.floor(Math.random() * matingPool.length)
            ];
            const parent2 = matingPool[
                Math.floor(Math.random() * matingPool.length)
            ];

            // Create child
            let child = this.nsga2.crossover(parent1, parent2);
            child = this.nsga2.mutation(child, importingCountry);

            offspring.push(child);
        }

        return offspring;
    }

    // Get final Pareto front
    getFinalParetoFront(population, budget) {
        // Filter valid solutions
        const validSolutions = population.filter(individual =>
            individual.cost !== undefined &&
            individual.impact !== undefined &&
            individual.cost <= budget
        );

        // Get non-dominated solutions
        const fronts = this.nsga2.nonDominatedSort(validSolutions);
        return fronts[0] || []; // Return first front (Pareto front)
    }

    // Select optimal solution based on weights
    selectOptimalSolution(paretoFront, costWeight, impactWeight) {
        if (!paretoFront.length) return null;

        // Calculate min/max for normalization
        const minCost = Math.min(...paretoFront.map(s => s.cost));
        const maxCost = Math.max(...paretoFront.map(s => s.cost));
        const minImpact = Math.min(...paretoFront.map(s => s.impact));
        const maxImpact = Math.max(...paretoFront.map(s => s.impact));

        // Find best solution
        let bestSolution = null;
        let bestScore = Infinity;

        paretoFront.forEach(solution => {
            // Normalize values
            const normalizedCost = (solution.cost - minCost) /
                                 (maxCost - minCost || 1);
            const normalizedImpact = (solution.impact - minImpact) /
                                   (maxImpact - minImpact || 1);

            // Calculate weighted score
            const score = (normalizedCost * costWeight) +
                         (normalizedImpact * impactWeight);

            if (score < bestScore) {
                bestScore = score;
                bestSolution = solution;
            }
        });

        return bestSolution;
    }
}

// Create singleton instance
const optimizer = new Optimizer();
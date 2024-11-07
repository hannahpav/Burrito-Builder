class NSGA2 {
    constructor(populationSize = CONFIG.DEFAULT_POPULATION_SIZE) {
        this.populationSize = populationSize;
    }

    // Initialize population
    initializePopulation(selectedIngredients, importingCountry) {
        const population = [];
        let attempts = 0;
        const maxAttempts = this.populationSize * 10;

        while (population.length < this.populationSize && attempts < maxAttempts) {
            const individual = this.createIndividual(selectedIngredients, importingCountry);
            if (individual) {
                population.push(individual);
            }
            attempts++;
        }

        return population;
    }

    // Create a single valid individual
    createIndividual(selectedIngredients, importingCountry) {
        const solution = {};

        for (const ingredient of selectedIngredients) {
            const exporters = dataManager.getValidExporters(ingredient, importingCountry);
            if (!exporters.length) return null;

            solution[CONFIG.INGREDIENTS[ingredient]] =
                exporters[Math.floor(Math.random() * exporters.length)];
        }

        const individual = { solution };
        this.calculateFitness(individual, importingCountry);

        return individual.cost !== undefined ? individual : null;
    }

    // Calculate fitness values
    calculateFitness(individual, importingCountry) {
        let totalCost = 0;
        let totalImpact = 0;

        for (const [ingredient, exportingCountry] of Object.entries(individual.solution)) {
            const tradeData = dataManager.getTradeData(
                ingredient,
                exportingCountry,
                importingCountry
            );

            if (!tradeData) {
                individual.cost = undefined;
                individual.impact = undefined;
                return;
            }

            totalCost += tradeData.cost;
            totalImpact += tradeData.impact;
        }

        individual.cost = totalCost;
        individual.impact = totalImpact;
    }

    // Non-dominated sorting
    nonDominatedSort(population) {
        const fronts = [[]];

        population.forEach(p => {
            p.dominatedCount = 0;
            p.dominatedSet = [];

            population.forEach(q => {
                if (this.dominates(q, p)) {
                    p.dominatedCount++;
                } else if (this.dominates(p, q)) {
                    p.dominatedSet.push(q);
                }
            });

            if (p.dominatedCount === 0) {
                p.rank = 0;
                fronts[0].push(p);
            }
        });

        let i = 0;
        while (fronts[i].length > 0) {
            const nextFront = [];

            fronts[i].forEach(p => {
                p.dominatedSet.forEach(q => {
                    q.dominatedCount--;
                    if (q.dominatedCount === 0) {
                        q.rank = i + 1;
                        nextFront.push(q);
                    }
                });
            });

            i++;
            fronts[i] = nextFront;
        }

        return fronts.filter(front => front.length > 0);
    }

    // Check if one solution dominates another
    dominates(a, b) {
        return (a.cost <= b.cost && a.impact <= b.impact) &&
               (a.cost < b.cost || a.impact < b.impact);
    }

    // Calculate crowding distance
    calculateCrowdingDistance(front) {
        const n = front.length;
        if (n < 2) return;

        front.forEach(ind => ind.crowdingDistance = 0);

        ['cost', 'impact'].forEach(objective => {
            front.sort((a, b) => a[objective] - b[objective]);

            front[0].crowdingDistance = Infinity;
            front[n - 1].crowdingDistance = Infinity;

            const maxObj = front[n - 1][objective];
            const minObj = front[0][objective];
            const scale = maxObj - minObj || 1;

            for (let i = 1; i < n - 1; i++) {
                front[i].crowdingDistance +=
                    (front[i + 1][objective] - front[i - 1][objective]) / scale;
            }
        });
    }

    // Selection operator
    selection(population, numToSelect) {
        return Array.from({length: numToSelect}, () => {
            const tournament = this.tournamentSelect(population, 2);
            return this.crowdedCompare(...tournament);
        });
    }

    // Tournament selection
    tournamentSelect(population, size) {
        return Array.from({length: size}, () =>
            population[Math.floor(Math.random() * population.length)]
        );
    }

    // Crowded comparison
    crowdedCompare(a, b) {
        if (a.rank < b.rank) return a;
        if (b.rank < a.rank) return b;
        return a.crowdingDistance > b.crowdingDistance ? a : b;
    }

    // Crossover operator
    crossover(parent1, parent2) {
        const child = { solution: {} };

        Object.keys(parent1.solution).forEach(ingredient => {
            child.solution[ingredient] = Math.random() < 0.5
                ? parent1.solution[ingredient]
                : parent2.solution[ingredient];
        });

        return child;
    }

    // Mutation operator
    mutation(individual, importingCountry, mutationRate = CONFIG.MUTATION_RATE) {
        Object.entries(individual.solution).forEach(([ingredient, currentExporter]) => {
            if (Math.random() < mutationRate) {
                const validExporters = dataManager.getValidExporters(ingredient, importingCountry);
                if (validExporters.length > 0) {
                    const newExporter = validExporters[
                        Math.floor(Math.random() * validExporters.length)
                    ];
                    individual.solution[ingredient] = newExporter;
                }
            }
        });
        return individual;
    }
}

// Create singleton instance
const nsga2 = new NSGA2();
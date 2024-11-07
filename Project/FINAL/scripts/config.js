export const CONFIG = {
    // Application settings
    DEFAULT_BUDGET: 25,
    DEFAULT_POPULATION_SIZE: 50,
    DEFAULT_GENERATIONS: 50,
    MUTATION_RATE: 0.1,

    // Data mappings
    INGREDIENTS: {
        'tortilla': 'Tortilla',
        'beef': 'Beef',
        'chicken': 'Chicken',
        'pork': 'Pork',
        'cheese': 'Shredded Cheese',
        'sour-cream': 'Sour Cream',
        'rice': 'Rice',
        'beans': 'Black/Pinto Beans',
        'lettuce': 'Lettuce',
        'onions': 'Onions',
        'tomatoes': 'Tomatoes',
        'avocado': 'Guacamole'
    },

    // Visualization settings
    COLORS: {
        "tortilla": "#D2B48C",
        "beef": "#8B4513",
        "chicken": "#FFA07A",
        "pork": "#FFC0CB",
        "cheese": "#FFD700",
        "sour-cream": "#FFF8DC",
        "rice": "#F5DEB3",
        "beans": "#8B0000",
        "lettuce": "#32CD32",
        "onions": "#9400D3",
        "tomatoes": "#FF6347",
        "avocado": "#228B22"
    },

    // Chart settings
    CHART: {
        MARGIN: { top: 10, right: 20, bottom: 30, left: 40 },
        POINT_RADIUS: 5,
        OPTIMAL_POINT_RADIUS: 7
    },

    // Map settings
    MAP: {
        SCALE: 130,
        LABEL_RADIUS: 120,
        ANGLE_STEP: Math.PI / 4,
        PADDING: 15
    },

    // Dynamic country names will be populated from data
    COUNTRY_NAMES: {}
};

// Function to update country names from data
export function updateCountryNames(data) {
    const countries = new Set();

    // Get all countries (both exporting and importing)
    for (const [exportingCountry, ingredients] of Object.entries(data)) {
        countries.add(exportingCountry);

        // Get importing countries for each ingredient
        for (const ingredient of Object.values(ingredients)) {
            for (const importingCountry of Object.keys(ingredient)) {
                countries.add(importingCountry);
            }
        }
    }

    // Create mapping object
    CONFIG.COUNTRY_NAMES = Array.from(countries).sort().reduce((acc, country) => {
        acc[country] = country;
        return acc;
    }, {});
}

// Export default config
export default CONFIG;
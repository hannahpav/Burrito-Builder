// Utility functions for visualization
export const utils = {
    // Format currency values
    formatCurrency: (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    },

    // Format percentage values
    formatPercentage: (value) => {
        return `${(value * 100).toFixed(1)}%`;
    },

    // Scale values for visualization
    scaleValue: (value, minValue, maxValue, targetMin, targetMax) => {
        return targetMin + (value - minValue) * (targetMax - targetMin) / (maxValue - minValue);
    },

    // Color scale generator for heatmap
    getColorScale: (value, min, max) => {
        const normalized = (value - min) / (max - min);
        // Returns a blue color scale
        return `rgb(${255 - Math.floor(normalized * 255)}, ${255 - Math.floor(normalized * 255)}, 255)`;
    },

    // Create tooltips
    createTooltip: (element, text) => {
        const tooltip = document.querySelector('.tooltip');
        element.addEventListener('mouseenter', (e) => {
            tooltip.textContent = text;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        });
        element.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    },

    // Format large numbers
    formatNumber: (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    },

    // Calculate environmental impact score
    calculateImpactScore: (values) => {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
};

export default utils;
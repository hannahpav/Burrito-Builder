import { CONFIG } from '../config.js';
import { utils } from './utils.js';

class ParetoChart {
    constructor(selector = '#pareto-chart') {
        this.svg = document.querySelector(selector);
        this.margin = CONFIG.CHART.MARGIN;
        this.width = 600; // Set default width
        this.height = 400; // Set default height
        this.initialized = false;
    }

    initialize() {
        if (!this.svg) {
            console.error('SVG element not found');
            return;
        }

        // Set SVG attributes
        this.svg.setAttribute('width', this.width + this.margin.left + this.margin.right);
        this.svg.setAttribute('height', this.height + this.margin.top + this.margin.bottom);
        this.svg.innerHTML = ''; // Clear existing content

        // Create the main group element
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${this.margin.left},${this.margin.top})`);
        this.svg.appendChild(g);

        this.initialized = true;
        return g;
    }

    draw(paretoFront, optimalSolution) {
        if (!this.initialized) {
            this.mainGroup = this.initialize();
        }

        if (!paretoFront?.length) {
            console.warn('No Pareto front data provided');
            return;
        }

        // Clear previous content
        this.svg.innerHTML = '';
        const g = this.initialize();

        // Calculate scales
        const xExtent = this.getExtent(paretoFront, 'cost');
        const yExtent = this.getExtent(paretoFront, 'impact');

        const xScale = (value) => utils.scaleValue(value, xExtent[0], xExtent[1], 0, this.width);
        const yScale = (value) => utils.scaleValue(value, yExtent[0], yExtent[1], this.height, 0);

        // Draw axes
        this.drawAxes(g, xScale, yScale, xExtent, yExtent);

        // Draw points
        this.drawPoints(g, paretoFront, xScale, yScale);

        // Draw optimal solution if exists
        if (optimalSolution) {
            this.drawOptimalSolution(g, optimalSolution, xScale, yScale);
        }
    }

    getExtent(data, key) {
        const values = data.map(d => d[key]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1;
        return [min - padding, max + padding];
    }

    drawAxes(g, xScale, yScale, xExtent, yExtent) {
        // X-axis
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        xAxis.setAttribute("transform", `translate(0,${this.height})`);

        // X-axis line
        const xAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxisLine.setAttribute("x1", "0");
        xAxisLine.setAttribute("x2", this.width);
        xAxisLine.setAttribute("stroke", "black");
        xAxis.appendChild(xAxisLine);

        // X-axis ticks and labels
        const xTicks = 5;
        for (let i = 0; i <= xTicks; i++) {
            const value = xExtent[0] + (xExtent[1] - xExtent[0]) * (i / xTicks);
            const x = xScale(value);

            // Tick line
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", x);
            tick.setAttribute("x2", x);
            tick.setAttribute("y1", 0);
            tick.setAttribute("y2", 6);
            tick.setAttribute("stroke", "black");
            xAxis.appendChild(tick);

            // Tick label
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", 20);
            label.setAttribute("text-anchor", "middle");
            label.textContent = utils.formatCurrency(value).replace('$', '');
            xAxis.appendChild(label);
        }

        // X-axis label
        const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xLabel.setAttribute("x", this.width / 2);
        xLabel.setAttribute("y", 40);
        xLabel.setAttribute("text-anchor", "middle");
        xLabel.textContent = "Cost ($)";
        xAxis.appendChild(xLabel);

        g.appendChild(xAxis);

        // Y-axis
        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Y-axis line
        const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxisLine.setAttribute("y1", "0");
        yAxisLine.setAttribute("y2", this.height);
        yAxisLine.setAttribute("stroke", "black");
        yAxis.appendChild(yAxisLine);

        // Y-axis ticks and labels
        const yTicks = 5;
        for (let i = 0; i <= yTicks; i++) {
            const value = yExtent[0] + (yExtent[1] - yExtent[0]) * (i / yTicks);
            const y = yScale(value);

            // Tick line
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", -6);
            tick.setAttribute("x2", 0);
            tick.setAttribute("y1", y);
            tick.setAttribute("y2", y);
            tick.setAttribute("stroke", "black");
            yAxis.appendChild(tick);

            // Tick label
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", -10);
            label.setAttribute("y", y);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("dominant-baseline", "middle");
            label.textContent = value.toFixed(1);
            yAxis.appendChild(label);
        }

        // Y-axis label
        const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yLabel.setAttribute("transform", `rotate(-90) translate(${-this.height/2}, -40)`);
        yLabel.setAttribute("text-anchor", "middle");
        yLabel.textContent = "Environmental Impact";
        yAxis.appendChild(yLabel);

        g.appendChild(yAxis);
    }

    drawPoints(g, paretoFront, xScale, yScale) {
        paretoFront.forEach(point => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", xScale(point.cost));
            circle.setAttribute("cy", yScale(point.impact));
            circle.setAttribute("r", CONFIG.CHART.POINT_RADIUS);
            circle.setAttribute("fill", "blue");

            // Add hover effects
            circle.addEventListener('mouseover', (e) => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.textContent = `Cost: ${utils.formatCurrency(point.cost)} Impact: ${point.impact.toFixed(2)}`;
                    tooltip.style.display = 'block';
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY + 10}px`;
                }
                circle.setAttribute("r", CONFIG.CHART.POINT_RADIUS * 1.5);
            });

            circle.addEventListener('mouseout', () => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
                circle.setAttribute("r", CONFIG.CHART.POINT_RADIUS);
            });

            g.appendChild(circle);
        });
    }

    drawOptimalSolution(g, solution, xScale, yScale) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", xScale(solution.cost));
        circle.setAttribute("cy", yScale(solution.impact));
        circle.setAttribute("r", CONFIG.CHART.OPTIMAL_POINT_RADIUS);
        circle.setAttribute("fill", "red");

        // Add hover effects
        circle.addEventListener('mouseover', (e) => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.textContent = `Optimal Solution\nCost: ${utils.formatCurrency(solution.cost)}\nImpact: ${solution.impact.toFixed(2)}`;
                tooltip.style.display = 'block';
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            }
            circle.setAttribute("r", CONFIG.CHART.OPTIMAL_POINT_RADIUS * 1.5);
        });

        circle.addEventListener('mouseout', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.display = 'none';
            }
            circle.setAttribute("r", CONFIG.CHART.OPTIMAL_POINT_RADIUS);
        });

        g.appendChild(circle);

        // Add label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", xScale(solution.cost));
        label.setAttribute("y", yScale(solution.impact) + 20);
        label.setAttribute("text-anchor", "middle");
        label.textContent = "Optimal Solution";
        g.appendChild(label);
    }
}

// Create and export singleton instance
const paretoChart = new ParetoChart();
export default paretoChart;
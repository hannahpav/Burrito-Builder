class WorldMap {
    constructor(selector = '#country-map') {
        this.svg = d3.select(selector);
        this.width = +this.svg.attr('width');
        this.height = +this.svg.attr('height');
        this.projection = d3.geoMercator()
            .scale(CONFIG.MAP.SCALE)
            .translate([this.width / 2.2, this.height / 1.5]);
        this.path = d3.geoPath().projection(this.projection);
    }

    async draw(solution, importingCountry) {
        this.svg.selectAll("*").remove();
        if (!solution) return;

        try {
            const geoData = await d3.json(
                "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
            );
            this.drawMap(geoData, solution, importingCountry);
        } catch (error) {
            console.error("Error loading map data:", error);
        }
    }

    drawMap(geoData, solution, importingCountry) {
        // Draw base map
        this.drawBaseMap(geoData);

        // Highlight importing country
        this.highlightImportingCountry(geoData, importingCountry);

        // Add trade routes and labels
        this.addTradeRoutes(solution, importingCountry);
    }

    drawBaseMap(geoData) {
        this.svg.append("g")
            .selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("class", "country")
            .attr("fill", "lightgray")
            .attr("stroke", "white");
    }

    highlightImportingCountry(geoData, importingCountry) {
        const countryName = CONFIG.COUNTRY_NAMES[importingCountry];
        if (countryName) {
            this.svg.selectAll("path")
                .filter(d => d.properties.name === countryName)
                .style("stroke", "black")
                .style("stroke-width", 2);
        }
    }

    addTradeRoutes(solution, importingCountry) {
        const countryAngles = {};

        Object.entries(solution.solution).forEach(([ingredient, exportingCountry]) => {
            const tradeData = dataManager.getTradeData(
                ingredient,
                exportingCountry,
                importingCountry
            );

            if (!tradeData) return;

            const coords = this.projection(tradeData.coordinates);

            // Initialize angle for country
            if (!countryAngles[exportingCountry]) {
                countryAngles[exportingCountry] = 0;
            }

            const angle = countryAngles[exportingCountry];
            const labelCoords = this.calculateLabelPosition(
                coords,
                angle,
                CONFIG.MAP.LABEL_RADIUS
            );

            // Update angle for next label
            countryAngles[exportingCountry] += CONFIG.MAP.ANGLE_STEP;

            this.drawTradeRoute(
                coords,
                labelCoords,
                ingredient,
                exportingCountry,
                tradeData
            );
        });

        // Prevent label overlap
        this.preventLabelOverlap();
    }

    calculateLabelPosition(coords, angle, radius) {
        return [
            coords[0] + radius * Math.cos(angle),
            coords[1] + radius * Math.sin(angle)
        ];
    }

    drawTradeRoute(coords, labelCoords, ingredient, exportingCountry, tradeData) {
        // Draw connecting line
        this.svg.append("line")
            .attr("class", "trade-route")
            .attr("x1", coords[0])
            .attr("y1", coords[1])
            .attr("x2", labelCoords[0])
            .attr("y2", labelCoords[1])
            .attr("stroke", CONFIG.COLORS[ingredient])
            .attr("stroke-width", 1.5);

        // Add label
        const label = this.svg.append("text")
            .attr("class", "trade-label")
            .attr("x", labelCoords[0])
            .attr("y", labelCoords[1])
            .style("fill", CONFIG.COLORS[ingredient]);

        // Add ingredient and country
        label.append("tspan")
            .attr("x", labelCoords[0])
            .attr("y", labelCoords[1])
            .attr("text-anchor", "middle")
            .text(`${ingredient}: ${exportingCountry}`);

        // Add cost and impact
        label.append("tspan")
            .attr("x", labelCoords[0])
            .attr("y", labelCoords[1] + 15)
            .attr("text-anchor", "middle")
            .text(`Cost: $${tradeData.cost.toFixed(2)}, Impact: ${tradeData.impact.toFixed(2)}`);
    }

    preventLabelOverlap() {
        const labels = this.svg.selectAll(".trade-label").nodes();
        const padding = CONFIG.MAP.PADDING;

        for (let i = 0; i < labels.length; i++) {
            for (let j = i + 1; j < labels.length; j++) {
                const labelA = labels[i].getBBox();
                const labelB = labels[j].getBBox();

                if (this.isOverlapping(labelA, labelB, padding)) {
                    const currentY = parseFloat(d3.select(labels[j]).attr("y"));
                    d3.select(labels[j])
                        .attr("y", currentY + padding)
                        .selectAll("tspan")
                        .attr("y", function() {
                            return parseFloat(d3.select(this).attr("y")) + padding;
                        });
                }
            }
        }
    }

    isOverlapping(bboxA, bboxB, padding) {
        return !(
            bboxA.x + bboxA.width + padding < bboxB.x ||
            bboxA.x > bboxB.x + bboxB.width + padding ||
            bboxA.y + bboxA.height + padding < bboxB.y ||
            bboxA.y > bboxB.y + bboxB.height + padding
        );
    }
}

// Create singleton instance
const worldMap = new WorldMap();
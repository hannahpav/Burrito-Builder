# Optimizing the Perfect Burrito: An algorithm for balancing cost and environmental sustainability in food sourcing

## Overview

The Burrito Builder is an interactive web application that transforms complex food supply chain decisions into accessible choices. While traditional supply chain optimization focuses on producer profits, this project empowers consumers to make informed decisions about both the economic and environmental impacts of their food choices.

[Try the Burrito Builder here](https://myperfectburrito.github.io/burrito-builder/)

[Read the full research paper](Optimizing-the-Perfect-Burrito.pdf)

## Project Background

The global food supply chain presents a fundamental challenge in balancing economic and environmental costs. Traditional optimization approaches primarily serve corporate interests, focusing on producer profits while meeting minimal sustainability requirements. The Burrito Builder addresses this gap by providing consumers with actionable information about how ingredient choices and sourcing decisions affect both sustainability and pricing.

## Problem Definition

The Burrito Builder optimizes the sourcing of twelve common ingredients (ranging from proteins to produce) based on two key metrics: total cost and environmental impact. Users can explore different combinations within their budget constraints while the algorithm finds optimal sourcing countries for each ingredient, considering both production and transportation factors.

## How It Works

1. Select your location and preferred ingredients
2. Set your maximum budget
3. Explore different cost-environmental impact trade-offs using the interactive slider
4. View ingredient sourcing on the global map
5. Get detailed cost and emissions information
6. Confirm your selection

## Features

The interactive platform allows users to:
- Select ingredients and set budget constraints
- Visualize global ingredient sourcing options
- Explore cost-environmental impact trade-offs
- View detailed sustainability metrics
- Understand transportation impacts
- Make informed purchasing decisions

## Technical Implementation

### Data Sources and Processing
- UN Comtrade Database for international trade data
- Environmental impact datasets
- MIT Climate Portal transportation emissions data
- Comprehensive ingredient cost calculations including transportation
- Environmental impact scoring combining production and transportation emissions

### Technologies and Algorithms
- D3.js for interactive visualizations
- HTML/CSS for user interface
- NSGA-II algorithm for multi-objective optimization
- Google Analytics API for user interaction tracking
- Real-time data visualization and processing

## Contact

For questions about this project, you can reach me here on GitHub: [@hannahpav](https://github.com/hannahpav)

---

*This research project demonstrates novel approaches to sustainable food supply chain optimization, data visualization, and consumer empowerment in food sourcing decisions.*

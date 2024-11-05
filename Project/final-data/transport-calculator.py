import math

def calculate_transport_metrics(
    weight_kg,
    transport_mode,
    distance_km,
    fuel_cost_per_liter=1.33
):
    """
    Calculate transportation costs and emissions between two countries.
    
    Parameters:
    - weight_kg: float, cargo weight in kilograms
    - transport_mode: str, one of ['sea', 'air', 'road', 'rail']
    - distance_km: float, optional, distance in kilometers
    - fuel_cost_per_liter: float, optional, current fuel cost
    
    Returns: dict with costs and emissions data
    """
    # Default values based on mode of transport
    emissions_factors = {
        'sea': 0.015,    # kg CO2 per tonne-km
        'air': 0.6,      # kg CO2 per tonne-km
        'road': 0.096,   # kg CO2 per tonne-km
        'rail': 0.028    # kg CO2 per tonne-km
    }
    
    base_costs_per_km = {
        'sea': 0.05,     # USD per tonne-km
        'air': 0.80,     # USD per tonne-km
        'road': 0.12,    # USD per tonne-km
        'rail': 0.06     # USD per tonne-km
    }
    
    
    # Convert weight to tonnes
    weight_tonnes = weight_kg / 1000
    
    # Calculate base transportation cost
    base_cost = weight_tonnes * distance_km * base_costs_per_km[transport_mode]
    
    # Calculate fuel surcharge (if fuel cost provided)
    fuel_surcharge = 0
    if fuel_cost_per_liter:
        fuel_surcharge = base_cost * (fuel_cost_per_liter / 1.5)  # Baseline fuel cost of 1.5 USD/L
    
    # Calculate emissions
    emissions_kg_co2 = weight_tonnes * distance_km * emissions_factors[transport_mode]
    
    # Additional fees
    customs_clearance = 200  # Base customs fee in USD
    documentation = 150      # Base documentation fee in USD
    insurance = base_cost * 0.01  # 1% of cargo value
    
    # Calculate total cost
    total_cost = (
        base_cost +
        fuel_surcharge +
        customs_clearance +
        documentation +
        insurance
    )
    
    return {
        'distance_km': distance_km,
        'base_cost_usd': round(base_cost, 2),
        'fuel_surcharge_usd': round(fuel_surcharge, 2),
        'customs_clearance_usd': customs_clearance,
        'documentation_usd': documentation,
        'insurance_usd': round(insurance, 2),
        'total_cost_usd': round(total_cost, 2),
        'emissions_kg_co2': round(emissions_kg_co2, 2),
        'transport_mode': transport_mode
    }

# Example usage
def print_transport_analysis(results):
    """Print formatted analysis of transportation metrics"""
    print(f"\nTransportation Analysis:")
    print(f"Distance: {results['distance_km']:,} km")
    print(f"Mode: {results['transport_mode']}")
    print(f"\nCosts Breakdown (USD):")
    print(f"Base Cost: ${results['base_cost_usd']:,.2f}")
    print(f"Fuel Surcharge: ${results['fuel_surcharge_usd']:,.2f}")
    print(f"Customs Clearance: ${results['customs_clearance_usd']:,.2f}")
    print(f"Documentation: ${results['documentation_usd']:,.2f}")
    print(f"Insurance: ${results['insurance_usd']:,.2f}")
    print(f"Total Cost: ${results['total_cost_usd']:,.2f}")
    print(f"\nEnvironmental Impact:")
    print(f"CO2 Emissions: {results['emissions_kg_co2']:,.2f} kg")

from typing import List
from app.schemas.profit import ProfitComparisonRequest, ProfitResponse, CropProfitResult, WeatherCondition

class ProfitabilityService:
    WEATHER_MULTIPLIERS = {
        WeatherCondition.good: 1.2,
        WeatherCondition.average: 1.0,
        WeatherCondition.poor: 0.6
    }
    
    @classmethod
    def compare_crops(cls, request: ProfitComparisonRequest) -> ProfitResponse:
        results = []
        
        for crop in request.crops:
            multiplier = cls.WEATHER_MULTIPLIERS.get(crop.weather_condition, 1.0)
            
            # Adjusted yield based on weather condition
            adjusted_yield = crop.expected_yield * multiplier
            
            # Revenue = adjusted yield * price 
            revenue = adjusted_yield * crop.market_price
            
            # Total cost is straightforward 
            total_cost = crop.cultivation_cost
            
            # Net profit
            net_profit = revenue - total_cost
            
            # ROI = (Net Profit / Total Cost) * 100
            # Guard against division by zero
            roi_percentage = (net_profit / total_cost * 100) if total_cost > 0 else 0.0
            
            results.append(CropProfitResult(
                crop_name=crop.crop_name,
                revenue=round(revenue, 2),
                total_cost=round(total_cost, 2),
                net_profit=round(net_profit, 2),
                roi_percentage=round(roi_percentage, 2),
                rank=0 # Will be populated later 
            ))
            
        # Rank the results based on net profit descending
        results.sort(key=lambda x: x.net_profit, reverse=True)
        
        # Assign ranks
        for i, result in enumerate(results):
            result.rank = i + 1
            
        return ProfitResponse(comparison_results=results)

profitability_service = ProfitabilityService()

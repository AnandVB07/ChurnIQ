from typing import Dict, Any, List

def build_retention_recommendation(
    customer: Dict[str, Any],
    churn_prob: float,
    risk_level: str,
    top_factors: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Dedicated rule-based retention recommendation service.
    Separates ML prediction probabilities from business retention logic.
    """
    contract = str(customer.get("Contract", customer.get("contract", "")))
    monthly_charges = float(customer.get("MonthlyCharges", customer.get("monthly_charges", 0.0)))
    tenure = int(customer.get("tenure", 0))
    tech_support = str(customer.get("TechSupport", customer.get("tech_support", "")))
    payment_method = str(customer.get("PaymentMethod", customer.get("payment_method", "")))
    internet_service = str(customer.get("InternetService", customer.get("internet_service", "")))

    actions = []
    priority = "LOW"
    summary = "Account is stable. Maintain standard relationship nurturing."

    if risk_level == "HIGH":
        priority = "URGENT"
        summary = "High churn risk detected. Immediate proactive intervention required."
        
        if contract == "Month-to-month":
            actions.append("Offer a 15% discount on an annual contract lock-in plan.")
        if monthly_charges > 75:
            actions.append("Review billing plan and propose a tailored bundle or loyalty rate.")
        if tenure < 12:
            actions.append("Assign a dedicated customer success specialist for an onboarding health check.")
        if tech_support == "No":
            actions.append("Provide 6 months of complimentary Premium 24/7 Tech Support.")
        if "Electronic check" in payment_method:
            actions.append("Incentivize switching to automated credit card billing with a $10 one-time credit.")
            
        if not actions:
            actions.append("Initiate direct outreach from the executive retention team.")

    elif risk_level == "MEDIUM":
        priority = "MODERATE"
        summary = "Moderate risk indicators present. Proactive retention measures advised."
        
        if contract == "Month-to-month":
            actions.append("Send an exclusive offer highlighting savings on long-term commitments.")
        if tech_support == "No":
            actions.append("Promote tech support and device protection security add-ons.")
        if monthly_charges > 85:
            actions.append("Offer a customized streaming/speed bundle to enhance perceived value.")
            
        if not actions:
            actions.append("Enroll customer in periodic loyalty check-in surveys.")

    else:
        priority = "LOW"
        summary = "Low churn probability. Focus on upselling and relationship strengthening."
        if internet_service == "DSL":
            actions.append("Present Fiber Optic upgrade opportunity when available.")
        actions.append("Keep active on quarterly satisfaction touchpoints.")

    return {
        "priority": priority,
        "summary": summary,
        "action_items": actions
    }

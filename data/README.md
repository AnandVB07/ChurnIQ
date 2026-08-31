# Dataset Documentation — Telco Customer Churn

## Overview
This directory stores raw and processed data for the **Customer Churn Intelligence Platform**. The primary dataset used is the IBM Telco Customer Churn dataset, representing 7,043 telecom customers with 21 attributes detailing services, contract parameters, billing choices, demographic variables, and binary churn outcomes.

## Directory Structure
```
data/
├── raw/
│   └── telco_churn.csv       # Ingested raw dataset (7,043 rows)
├── processed/
│   ├── train_processed.csv   # Preprocessed training splits
│   └── test_processed.csv    # Preprocessed test splits
└── README.md
```

## Schema & Feature Dictionary
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `customerID` | String | Unique customer identifier |
| `gender` | Categorical | Male or Female |
| `SeniorCitizen` | Binary | 1 if customer is senior citizen (>= 65), else 0 |
| `Partner` | Categorical | Yes / No (customer has a partner) |
| `Dependents` | Categorical | Yes / No (customer has dependents) |
| `tenure` | Integer | Number of months the customer has stayed with company |
| `PhoneService` | Categorical | Yes / No (customer has telephone service) |
| `MultipleLines` | Categorical | Yes, No, or No phone service |
| `InternetService` | Categorical | DSL, Fiber optic, or No |
| `OnlineSecurity` | Categorical | Yes, No, or No internet service |
| `OnlineBackup` | Categorical | Yes, No, or No internet service |
| `DeviceProtection` | Categorical | Yes, No, or No internet service |
| `TechSupport` | Categorical | Yes, No, or No internet service |
| `StreamingTV` | Categorical | Yes, No, or No internet service |
| `StreamingMovies` | Categorical | Yes, No, or No internet service |
| `Contract` | Categorical | Month-to-month, One year, Two year |
| `PaperlessBilling` | Categorical | Yes / No (paperless billing enrollment) |
| `PaymentMethod` | Categorical | Electronic check, Mailed check, Bank transfer, Credit card |
| `MonthlyCharges` | Numeric | Monthly subscription amount in USD ($) |
| `TotalCharges` | Numeric | Total historical amount billed in USD ($) |
| `Churn` | Binary (Target)| Yes (1) / No (0) (Customer churned within last month) |

## Data Acquisition & Automatic Loading
The repository includes an automated data loader in `src/data_loader.py`:
```bash
python -m src.data_loader
```
If offline, the system will generate a statistically aligned synthetic dataset mirroring the exact schema, class distribution (26.5% churn rate), and feature relationships.

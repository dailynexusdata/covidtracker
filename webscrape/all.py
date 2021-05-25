import pandas as pd
import numpy as np

vaccines = pd.read_csv("https://data.chhs.ca.gov/dataset/e283ee5a-cf18-4f20-a92c-ee94a2866ccd/resource/130d7ba2-b6eb-438d-a412-741bde207e1c/download/covid19vaccinesbycounty.csv")

cases = pd.read_csv("https://data.chhs.ca.gov/dataset/f333528b-4d38-4814-bebb-12db1f10f535/resource/046cdd2b-31e5-4d34-9ed3-b48cdbc4be7a/download/covid19cases_test.csv")

# print(vaccines.columns)
# print(cases.columns)

sb_vaccines = vaccines[
    vaccines["county"] == "Santa Barbara"
][["administered_date", "cumulative_at_least_one_dose"]] \
    .reset_index(drop=True) \
    .rename({ 
        "administered_date": "date", 
        "cumulative_at_least_one_dose": "total_doses" 
    }, axis=1)

sb_cases = cases[cases["area"] == "Santa Barbara"][["date", "cases"]].reset_index(drop=True)
sb_cases["total_cases"] = np.cumsum(np.flip(sb_cases["cases"]))
sb_cases["avg"] = sb_cases["cases"].rolling(window=7, center=True).mean()

combined = pd.merge(sb_cases, sb_vaccines, on="date", how="left").fillna(0).iloc[::-1]

# Array of objects which represent each row
combined.to_json("cases_vaccines.json", orient="records")

import pandas as pd
import numpy as np
import boto3
from datetime import datetime, timedelta
import json
import logging

log = logging.getLogger(__name__)


def fetch_data():
    vaccines = pd.read_csv(
        "https://data.chhs.ca.gov/dataset/e283ee5a-cf18-4f20-a92c-ee94a2866ccd/resource/130d7ba2-b6eb-438d-a412-741bde207e1c/download/covid19vaccinesbycounty.csv")
    cases = pd.read_csv(
        "https://data.chhs.ca.gov/dataset/f333528b-4d38-4814-bebb-12db1f10f535/resource/046cdd2b-31e5-4d34-9ed3-b48cdbc4be7a/download/covid19cases_test.csv")

    sb_vaccines = vaccines[
        vaccines["county"] == "Santa Barbara"
    ][["administered_date", "cumulative_at_least_one_dose", 'cumulative_fully_vaccinated']] \
        .reset_index(drop=True) \
        .rename({
            "administered_date": "date",
            "cumulative_at_least_one_dose": "total_doses",
            'cumulative_fully_vaccinated': "total_double_doses"
        }, axis=1)

    sb_cases = cases[cases["area"] == "Santa Barbara"][[
        "date", "cases", "deaths", "population"]].reset_index(drop=True)

    sb_cases["total_cases"] = np.cumsum(sb_cases["cases"])
    sb_cases["avg"] = sb_cases["cases"].rolling(window=7, center=True).mean()

    # print(np.cumsum(np.flip(sb_cases["deaths"])))
    combined = pd.merge(
        sb_cases,
        sb_vaccines,
        on="date",
        how="outer"
    ).dropna(subset=["date", "population", "total_cases"]).fillna(0)

    print(combined.head())
    print(combined.tail())

    # Array of objects which represent each row
    return combined.to_dict(orient="records")


def upload(data):
    s3 = boto3.resource('s3')
    response = s3.Object("dailynexus", "cases_vaccines.json").put(
        Body=json.dumps(data, indent=2),
        ContentType="application/json",
        ACL="public-read",
        Expires=(datetime.now() + timedelta(hours=48))
    )
    log.info(response)


def lambda_handler(event=None, context=None, dry_run=False):
    covid_data = fetch_data()
    upload(covid_data)


def main():
    lambda_handler(None, None, False)


if __name__ == "__main__":
    main()

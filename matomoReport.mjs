import fetch from "node-fetch";
import ObjectsToCsv from "objects-to-csv";

async function matomo() {
    try {

        // params for get request
        let api = {
            date: "2020-01-01,2022-02-28",
            filter_limit: -1,
            flat: 1,
            format: "JSON",
            format_metrics: 1,
            idSite: 1,
            method: "Referrers.getReferrerType",
            module: "API",
            period: "month",
            token_auth: process.env.AUTH_KEY,
        };
        
        // Matomo endpoint
        let endpoint = "https://stats.arztkonsultation.de/index.php";

        // Return request url as a string to query Matomo
        const buildUrl = (obj, endpoint) => {
            let str = [];
            let keys = Object.keys(obj);
            for (let key of keys) {
                let param = `${key}=${obj[key]}`;
                str.push(param);
            }
            return `${endpoint}?${str.join("&")}`;
        };

        // Sends GET request to Matomo and returnds answer as JSON object
        const getData = async () => {
            let url = buildUrl(api, endpoint);
            console.log(url)
            const response = await fetch(url);
            let res_json = await response.json();
            return res_json;
        };

        // Flattens returned data to prepare for CSV export
        const flattenData = async (obj) => {
            let data = [];
            for (let arr in obj) {
                for (let el of obj[arr]) {
                    let row = {
                        date: arr,
                        channel: el.label,
                        visits: el.nb_visits,
                        conversions: el.nb_conversions ? el.nb_conversions : 0,
                        bounces: el.bounce_count,
                        bounceRate: el.bounce_count / el.nb_visits,
                        conversionRate: el.nb_conversions ? el.nb_conversions / el.nb_visits : 0,
                    };

                    data.push(row);
                }
            }
            return data;
        };

        let data = await getData(api, endpoint);
        let flatData = await flattenData(data);
        // let url = buildUrl(api, endpoint)

        // make csv file
        const csv = new ObjectsToCsv(flatData);
        await csv.toDisk("./feb-2022-matomo.csv");

    } catch (error) {
        console.log(error);
    }
}

matomo();

const https = require("https");
require("dotenv").config({ path: "c:/Projetos/Site_Vivare/web/.env.local", override: true });

function fetchListings() {
    const key = process.env.STAYS_API_KEY;
    const url = process.env.STAYS_API_URL + "/external/v1/content/listings";

    https.get(url, {
        headers: { "Authorization": `Basic ${key}` }
    }, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
            const data = JSON.parse(body);
            if (data.length > 0) {
                console.log("Listing keys:", Object.keys(data[0]));
                const priceKeys = Object.keys(data[0]).filter(k => k.toLowerCase().includes("price") || k.toLowerCase().includes("rate"));
                console.log("Price specific keys:", priceKeys);
                for (const pk of priceKeys) {
                    console.log(pk, data[0][pk]);
                }
            } else {
                console.log("No listings found.");
            }
        });
    }).on("error", console.error);
}

fetchListings();

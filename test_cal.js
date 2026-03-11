async function test() {
    const authHeader = "Basic M2QxN2U0YWU6OTdhYWI4N2M=";
    const url = "https://vivare.stays.net/external/v1/content/listings";

    // get one listing id
    const res = await fetch(url + "?limit=1", {
        headers: { "Authorization": authHeader, "Accept": "application/json" }
    });
    const listings = await res.json();
    if (!listings || listings.length === 0) return console.log("No listings found");
    const id = listings[0].id;

    console.log("Testing calendar for ID:", id);

    const now = new Date();
    const from = now.toISOString().split('T')[0];
    now.setMonth(now.getMonth() + 1);
    const to = now.toISOString().split('T')[0];

    const calUrl = `https://vivare.stays.net/external/v1/calendar/listing/${id}?from=${from}&to=${to}`;

    const calRes = await fetch(calUrl, {
        headers: { "Authorization": authHeader, "Accept": "application/json" }
    });

    const calData = await calRes.json();
    console.log(JSON.stringify(calData.slice(0, 5), null, 2));
}

test();

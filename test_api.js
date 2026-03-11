const authHeader = "Basic M2QxN2U0YWU6OTdhYWI4N2M=";
const url = "https://vivare.stays.net/external/v1/content/listings";

fetch(url, {
    headers: {
        "Authorization": authHeader,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }
})
    .then(async res => {
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response Text:", text.substring(0, 500));
    })
    .catch(err => console.error("Erro:", err));

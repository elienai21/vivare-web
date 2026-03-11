const url = "https://vivare.stays.net/external/v1/docs/";

fetch(url)
    .then(async res => {
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response:", text.substring(0, 300));
    })
    .catch(err => console.error("Erro:", err));

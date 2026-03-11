const fs = require('fs');

const authHeader = "Basic M2QxN2U0YWU6OTdhYWI4N2M=";
const url = "https://vivare.stays.net/external/v1/content/listings";

fetch(url, {
    headers: {
        "Authorization": authHeader,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
})
    .then(res => res.json())
    .then(data => {
        fs.writeFileSync('C:\\Projetos\\Site_Vivare\\temp_pdf\\stays_listings_sample.json', JSON.stringify(data[0], null, 2));
        console.log("Amostra do primeiro imóvel salva em stays_listings_sample.json");
        console.log("Total de unidades ativas recebidas:", data.length);
    })
    .catch(err => console.error("Erro:", err));

const fs = require('fs');
const authHeader = "Basic M2QxN2U0YWU6OTdhYWI4N2M=";
const url = "https://vivare.stays.net/external/v1/content/listings/6464c7f796dec9d2043eef99";

fetch(url, {
    headers: {
        "Authorization": authHeader,
        "Accept": "application/json"
    }
})
    .then(res => res.json())
    .then(data => {
        fs.writeFileSync('C:\\Projetos\\Site_Vivare\\temp_pdf\\stays_single_listing.json', JSON.stringify(data, null, 2));
        console.log("Single listing salvo.");
    })
    .catch(err => console.error("Erro:", err));

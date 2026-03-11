const fs = require('fs');
const authHeader = "Basic M2QxN2U0YWU6OTdhYWI4N2M=";
const id = "6464c7f796dec9d2043eef99";

// The 'TX01H' is .id and '6464c7f796dec9d2043eef99' is ._id. Need to check which one calendar expects. Let's try ._id first.
const url = `https://vivare.stays.net/external/v1/calendar/listing/${id}`;

fetch(url, {
    headers: {
        "Authorization": authHeader,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
    }
})
    .then(res => res.json())
    .then(data => {
        fs.writeFileSync('C:\\Projetos\\Site_Vivare\\temp_pdf\\stays_calendar_sample.json', JSON.stringify(data, null, 2));
        console.log("Calendário capturado.");
    })
    .catch(err => console.error("Erro calendário:", err));

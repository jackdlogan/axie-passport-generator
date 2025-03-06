async function getAxieClass(axieId) {
    const apiUrl = 'https://api-gateway.skymavis.com/graphql/axie-marketplace';
    
    // GraphQL query
    const query = `
        query GetAxieClass {
            axie(axieId: "${axieId}") {
                class
            }
        }
    `;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 "x-api-key": "mhkLTvd8ayQ8arSANYK48sbJ6kmf95o9"
            },
            body: JSON.stringify({
                query: query
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.axie.class;

    } catch (error) {
        console.error('Error fetching Axie class:', error);
        throw error;
    }
}

// Example usage
const axieId = "123456"; // Replace with actual Axie ID
getAxieClass(axieId)
    .then(axieClass => {
        console.log(`Axie #${axieId} is a ${axieClass} class`);
    })
    .catch(error => {
        console.error('Failed to get Axie class:', error);
    });
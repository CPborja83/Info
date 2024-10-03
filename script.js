let myChart; // Variable global para almacenar la instancia de la gráfica

// Variables globales para almacenar los porcentajes
let porcentajeMaya, porcentajeGarifuna, porcentajeXinca, porcentajeAfrodescendiente, porcentajeLadino, porcentajeExtranjero;

// Función para limpiar los datos JSON y eliminar los caracteres no deseados
function cleanData(rawData) {
    return rawData
        .replace(/[{}"\\]/g, '')  // Eliminar {, }, ", y \
        .replace(/:/g, ' ')       // Reemplazar los dos puntos con un espacio
        .replace(/,/g, '\n');     // Reemplazar las comas con saltos de línea para mejor legibilidad
}

// Función para obtener los datos de la API y mostrarlos en la tabla
async function obtenerDatos() {
    const codigoMunicipio = document.getElementById("municipios").value;
    const municipioSeleccionado = document.getElementById("municipios").options[document.getElementById("municipios").selectedIndex].text;

    try {
        const response = await fetch(`https://censopoblacion.azurewebsites.net/API/indicadores/2/${codigoMunicipio}`);
        const data = await response.json();  // Parsear el JSON correctamente

        // Comprobar si no se encuentra el municipio
        if (!data || Object.keys(data).length === 0) {
            Swal.fire({
                title: 'Municipio no encontrado',
                text: 'No se encontró un municipio con ese código.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // Actualizar el título de la tabla con el nombre del municipio seleccionado
        document.getElementById("titulo-tabla").innerText = municipioSeleccionado;

        // Convertir el objeto JSON a string y limpiar el formato
        const rawData = JSON.stringify(data);
        const cleanText = cleanData(rawData);
        
        // Obtener el tbody de la tabla
        const tbody = document.getElementById('data-table').querySelector('tbody');
        tbody.innerHTML = ''; // Limpiar tabla antes de agregar nuevos datos

        // Procesar cada línea del texto limpio
        cleanText.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(' '); // Separar la clave de los valores
            const value = valueParts.join(' '); // Unir los valores restantes

            // Agregar fila a la tabla solo si hay clave y valor significativos
            if (key && value) {
                const row = `
                    <tr>
                        <td class="py-2 px-4 border">${key.trim()}</td>
                        <td class="py-2 px-4 border">${value.trim()}</td>
                    </tr>
                `;
                tbody.innerHTML += row;

                // Almacenar los porcentajes en variables globales
                switch (key.trim()) {
                    case "porc_pueblo_maya":
                        porcentajeMaya = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_garifuna":
                        porcentajeGarifuna = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_xinca":
                        porcentajeXinca = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_afrodescendiente":
                        porcentajeAfrodescendiente = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_ladino":
                        porcentajeLadino = parseFloat(value.trim());
                        break;
                    case "porc_pueblo_extranjero":
                        porcentajeExtranjero = parseFloat(value.trim());
                        break;
                }
            }
        });

        // Actualizar el textbox de porcentajes si existe
        const textareaPorcentajes = document.getElementById('porcentajes');
        if (textareaPorcentajes) {
            textareaPorcentajes.value = `
                Maya: ${porcentajeMaya || 0}%
                Garifuna: ${porcentajeGarifuna || 0}%
                Xinca: ${porcentajeXinca || 0}%
                Afrodescendiente: ${porcentajeAfrodescendiente || 0}%
                Ladino: ${porcentajeLadino || 0}%
                Extranjero: ${porcentajeExtranjero || 0}%
            `.trim();
        }

        // Obtener los datos para la gráfica
        const porcentajes = {
            "Maya": porcentajeMaya || 0,
            "Garifuna": porcentajeGarifuna || 0,
            "Xinca": porcentajeXinca || 0,
            "Afrodescendiente": porcentajeAfrodescendiente || 0,
            "Ladino": porcentajeLadino || 0,
            "Extranjero": porcentajeExtranjero || 0
        };

        // Llamar a la función para dibujar la gráfica
        drawChart(porcentajes);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo obtener los datos del municipio. Por favor, inténtalo más tarde.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
    }
}

// Función para dibujar la gráfica
function drawChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Si hay una gráfica existente, destruirla
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar', // Cambiado a gráfico de barras
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Porcentaje de Población',
                data: Object.values(data),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });
}

// Cargar datos del municipio con código 999 al inicio
window.onload = () => {
    obtenerDatos();
};

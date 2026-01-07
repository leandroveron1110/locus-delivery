// // --- CONFIGURACIÓN DE PARÁMETROS ---
// const CINK = 500000; // Constante para $500.000 ARS (Bloque de Venta)
// const TARIFA_BASE = 35; // Tarifa fija en USD para el primer bloque ($0 a $500k)

// // Los umbrales definen a partir de qué VENTA ACUMULADA se aplica el nuevo aumento
// const UMBRALES = [
//     { limite: 2000000, aumentoUSD: 25 }, // Aumentos de $25 USD hasta los 2M
//     { limite: 3000000, aumentoUSD: 30 }, // Aumentos de $30 USD hasta los 3M
//     { limite: Infinity, aumentoUSD: 40 } // Aumentos de $40 USD a partir de 3M
// ];

// // Función auxiliar para determinar el AUMENTO USD para un tramo dado
// function obtenerAumento(ventasAcumuladas) {
//     // Si la venta acumulada está POR DEBAJO del primer umbral de 2M, el aumento es 25
//     if (ventasAcumuladas < UMBRALES[0].limite) {
//         return UMBRALES[0].aumentoUSD; // 25 USD
//     }
//     // Si la venta acumulada está POR DEBAJO del segundo umbral de 3M, el aumento es 30
//     else if (ventasAcumuladas < UMBRALES[1].limite) {
//         return UMBRALES[1].aumentoUSD; // 30 USD
//     }
//     // Si está por encima, el aumento es 40
//     else {
//         return UMBRALES[2].aumentoUSD; // 40 USD
//     }
// }

// // Función principal para calcular el cobro total
// function cobroToBusiness(ventas) {
//     // Math.floor obtiene cuántos bloques completos de $500k se vendieron.
//     const bloquesVendidos = Math.ceil(ventas / CINK);

//     if (bloquesVendidos === 0) {
//         return cob;
//     }

//     let tarifaTotal = TARIFA_BASE; // 1. Empezamos siempre con la tarifa base ($35 USD)
    
//     // 2. Iteramos SOLAMENTE los aumentos adicionales que se deben sumar
//     // El primer bloque ya fue cubierto por la TARIFA_BASE, por eso empezamos en i = 1 (Bloque 2)
//     for (let i = 1; i < bloquesVendidos; i++) {
        
//         // La venta acumulada al inicio de este BLOQUE ADICIONAL (Ej: $500k, $1M, $1.5M, etc.)
//         let ventasAcumuladas = i * CINK;
        
//         // La tarifa de aumento se determina por el UMBRAL en el que cae la venta
//         let aumento = obtenerAumento(ventasAcumuladas);
//         cob.push(aumento)
        
//         tarifaTotal += aumento;
//     }

//     return tarifaTotal
// }


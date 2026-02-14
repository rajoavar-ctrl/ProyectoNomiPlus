
// ========================================
// CALCULADORA DE NÓMINA - JAVASCRIPT COMPLETO
// ========================================

document.addEventListener("DOMContentLoaded", function() {
    
    // ========== CONSTANTES ==========
    const PORCENTAJE_SALUD = 0.04;
    const PORCENTAJE_PENSION = 0.04;
    const VALOR_UNIDAD_RESTAURANTE = 2800;
    
    // Multiplicadores y nombres de conceptos
    const CONCEPTOS = {
        extraNocturna: {
            nombre: "Horas extras nocturnas 1.75%",
            multiplicador: 1.75
        },
        extraFestivaDiurna: {
            nombre: "Horas extras diurnas festivas 2.05%",
            multiplicador: 2.05
        },
        extraFestivaNocturna: {
            nombre: "Horas extras nocturna festivas 2.55%",
            multiplicador: 2.55
        },
        recargoNocturno: {
            nombre: "Recargo nocturno 0.35%",
            multiplicador: 0.35
        },
        ordinariaFestiva: {
            nombre: "Hora ordinaria festiva 1.80%",
            multiplicador: 1.80
        },
        recargoNocturnoFestivo: {
            nombre: "Recargo nocturno festivo 2.15",
            multiplicador: 2.15
        },
        diaFamilia: {
            nombre: "Día de la familia",
            multiplicador: 5.86
        },
        // ⬇️ NUEVO CONCEPTO
    otrosConceptos: {
        nombre: "Otros Conceptos",
        multiplicador: 0,  // No usa multiplicador
        esPersonalizado: true  // Marca especial
    }
    }
    // Array para almacenar conceptos agregados
    let conceptosAgregados = [];
    
    // ========== OBTENER ELEMENTOS DEL DOM ==========
    const salarioBase = document.getElementById("salarioBase");
    const horasMensuales = document.getElementById("horasMensuales");
    const auxilioTransporte = document.getElementById("auxilioTransporte");
    const diasTrabajados = document.getElementById("diasTrabajados");
    const valorHoraDiv = document.getElementById("valorHora");
    const valorDevengadoDiv = document.getElementById("devengado");
    
    // ========== FUNCIONES DE FORMATO ==========
    function formatearMoneda(numero) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numero);
    }
    
    function formatearInputMoneda(input) {
        let valor = input.value.replace(/\D/g, '');
        
        if (valor === '') {
            input.value = '';
            return;
        }
        
        let numero = parseInt(valor);
        let formateado = numero.toLocaleString('es-CO');
        input.value = '$ ' + formateado;
    }
    
    function obtenerNumero(input) {
        let valor = input.value.replace(/\D/g, '');
        return parseFloat(valor) || 0;
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // ========== CÁLCULOS BÁSICOS ==========
    function calcularValor_hora() {
        const salario = obtenerNumero(salarioBase);
        const horas = parseFloat(horasMensuales.value) || 1;
        const valorHora = salario / horas;
        valorHoraDiv.textContent = formatearMoneda(valorHora);
        
        // Recalcular horas extras cuando cambia el valor hora
        calcularHorasExtras();
    }
    
    function calcularDevengado() {
        const salario = obtenerNumero(salarioBase);
        const auxilio = obtenerNumero(auxilioTransporte);
        const dias = parseFloat(diasTrabajados.value) || 30;
        const devengado = (salario / 30) * dias + (auxilio / 30) * dias;
        valorDevengadoDiv.textContent = formatearMoneda(devengado);
        
        // Recalcular total devengado
        calcularTotalDevengado();
    }
    
    // ========== HORAS EXTRAS DINÁMICAS ==========
    function agregarConcepto() {
    let selector = document.getElementById("selectorConcepto");
    let tipoConcepto = selector.value;
    
    if (!tipoConcepto) {
        alert("Por favor selecciona un concepto");
        return;
    }
    
    // Si es "Otros Conceptos", pedir nombre personalizado
    if (tipoConcepto === "otrosConceptos") {
        let nombrePersonalizado = prompt("Ingresa el nombre del concepto:", "Bonificación");
        
        if (!nombrePersonalizado || nombrePersonalizado.trim() === "") {
            alert("Debes ingresar un nombre para el concepto");
            return;
        }
        
        // Crear un ID único para este concepto
        let timestamp = Date.now();
        let idUnico = "otros_" + timestamp;
        
        // Agregar al objeto CONCEPTOS dinámicamente
        CONCEPTOS[idUnico] = {
            nombre: nombrePersonalizado.trim(),
            multiplicador: 0,
            esPersonalizado: true
        };
        
        // Usar el ID único en lugar de "otrosConceptos"
        tipoConcepto = idUnico;
    } else {
        // Verificar si ya existe (solo para conceptos predefinidos)
        if (conceptosAgregados.includes(tipoConcepto)) {
            alert("Este concepto ya está agregado");
            return;
        }
    }
    
    conceptosAgregados.push(tipoConcepto);
    
    let tbody = document.getElementById("bodyHorasExtras");
    let fila = document.createElement("tr");
    fila.setAttribute("data-tipo", tipoConcepto);
    
    // Verificar si es personalizado para cambiar la estructura
    if (CONCEPTOS[tipoConcepto].esPersonalizado) {
        // Para conceptos personalizados: input de valor directo
        fila.innerHTML = `
            <td>${CONCEPTOS[tipoConcepto].nombre}</td>
            <td colspan="2">
                <input type="text" class="input-valor-personalizado" data-tipo="${tipoConcepto}" 
                       placeholder="$ 0" value="">
            </td>
            <td class="valor-total" id="total${capitalize(tipoConcepto)}">$ 0</td>
            <td>
                <button type="button" class="btn-eliminar" onclick="eliminarConcepto('${tipoConcepto}')">Eliminar</button>
            </td>
        `;
        
        // Agregar evento al input personalizado
        let inputValor = fila.querySelector(".input-valor-personalizado");
        inputValor.addEventListener("input", function() {
            formatearInputMoneda(this);
            calcularOtrosConceptos();
        });
    } else {
        // Para conceptos normales: estructura estándar con horas
        fila.innerHTML = `
            <td>${CONCEPTOS[tipoConcepto].nombre}</td>
            <td>
                <input type="number" class="input-horas" data-tipo="${tipoConcepto}" value="0" min="0">
            </td>
            <td class="valor-hora" id="valorHora${capitalize(tipoConcepto)}">$ 0</td>
            <td class="valor-total" id="total${capitalize(tipoConcepto)}">$ 0</td>
            <td>
                <button type="button" class="btn-eliminar" onclick="eliminarConcepto('${tipoConcepto}')">Eliminar</button>
            </td>
        `;
        
        let inputNuevo = fila.querySelector(".input-horas");
        inputNuevo.addEventListener("input", calcularHorasExtras);
    }
    
    tbody.appendChild(fila);
    selector.value = "";
    
    if (CONCEPTOS[tipoConcepto].esPersonalizado) {
        calcularOtrosConceptos();
    } else {
        calcularHorasExtras();
    }
}

// ========== CALCULAR OTROS CONCEPTOS PERSONALIZADOS ==========
function calcularOtrosConceptos() {
    let inputsPersonalizados = document.querySelectorAll(".input-valor-personalizado");
    
    inputsPersonalizados.forEach(function(input) {
        let valor = obtenerNumero(input);
        let tipo = input.getAttribute("data-tipo");
        
        let tipoCapitalizado = capitalize(tipo);
        let elementoTotal = document.getElementById("total" + tipoCapitalizado);
        
        if (elementoTotal) {
            elementoTotal.textContent = formatearMoneda(valor);
        }
    });
    
    calcularTotalDevengado();
}
    
    // Hacer función global para que onclick funcione
    window.eliminarConcepto = function(tipoConcepto) {
        let index = conceptosAgregados.indexOf(tipoConcepto);
        if (index > -1) {
            conceptosAgregados.splice(index, 1);
        }
        
        let fila = document.querySelector(`tr[data-tipo="${tipoConcepto}"]`);
        if (fila) {
            fila.remove();
        }
        
        calcularHorasExtras();
    };
    
    function calcularHorasExtras() {
        let valorHora = obtenerNumero(salarioBase) / (parseFloat(horasMensuales.value) || 1);
        let inputsHoras = document.querySelectorAll(".input-horas");
        
        inputsHoras.forEach(function(input) {
            let horas = parseFloat(input.value) || 0;
            let tipo = input.getAttribute("data-tipo");
            let multiplicador = CONCEPTOS[tipo].multiplicador;
            
            let valorPorHora = valorHora * multiplicador;
            let totalFila = horas * valorPorHora;
            
            let tipoCapitalizado = capitalize(tipo);
            
            let elementoValorHora = document.getElementById("valorHora" + tipoCapitalizado);
            let elementoTotal = document.getElementById("total" + tipoCapitalizado);
            
            if (elementoValorHora) {
                elementoValorHora.textContent = formatearMoneda(valorPorHora);
            }
            
            if (elementoTotal) {
                elementoTotal.textContent = formatearMoneda(totalFila);
            }
        });
        
        calcularTotalDevengado();
    }
    
    //========== TOTAL DEVENGADO (ACTUALIZADO) ==========
function calcularTotalDevengado() {
    let devengadoBasico = parseFloat(valorDevengadoDiv.textContent.replace(/[^0-9]/g, '')) || 0;
    
    // Sumar horas extras normales
    let totalExtras = 0;
    let inputsHoras = document.querySelectorAll(".input-horas");
    let valorHora = obtenerNumero(salarioBase) / (parseFloat(horasMensuales.value) || 1);
    
    inputsHoras.forEach(function(input) {
        let horas = parseFloat(input.value) || 0;
        let tipo = input.getAttribute("data-tipo");
        let multiplicador = CONCEPTOS[tipo].multiplicador;
        let totalFila = horas * valorHora * multiplicador;
        totalExtras += totalFila;
    });
    
    // Sumar otros conceptos personalizados
    let totalPersonalizados = 0;
    let inputsPersonalizados = document.querySelectorAll(".input-valor-personalizado");
    
    inputsPersonalizados.forEach(function(input) {
        let valor = obtenerNumero(input);
        totalPersonalizados += valor;
    });
    
    // Total devengado = básico + extras + personalizados
    let totalDevengado = devengadoBasico + totalExtras + totalPersonalizados;
    
    let elementoTotalDevengado = document.getElementById("totalDevengado");
    if (elementoTotalDevengado) {
        elementoTotalDevengado.textContent = formatearMoneda(totalDevengado);
    }
    
    calcularDeducciones();
}
    
    // ========== DEDUCCIONES ==========

    // ========== DEDUCCIONES (CORREGIDO - SIN TRANSPORTE) ==========
    
function calcularDeducciones() {
    // CALCULAR BASE GRAVABLE (SIN AUXILIO DE TRANSPORTE)
    
    // 1. Devengado básico (salario proporcional)
    let devengadoBasico = parseFloat(valorDevengadoDiv.textContent.replace(/[^0-9]/g, '')) || 0;
    
    // 2. Auxilio de transporte (extraer para RESTAR)
    let auxilio = obtenerNumero(auxilioTransporte);
    let dias = parseFloat(diasTrabajados.value) || 30;
    let auxilioProporcional = (auxilio / 30) * dias;
    
    // 3. Sumar horas extras
    let totalExtras = 0;
    let inputsHoras = document.querySelectorAll(".input-horas");
    let valorHora = obtenerNumero(salarioBase) / (parseFloat(horasMensuales.value) || 1);
    
    inputsHoras.forEach(function(input) {
        let horas = parseFloat(input.value) || 0;
        let tipo = input.getAttribute("data-tipo");
        let multiplicador = CONCEPTOS[tipo].multiplicador;
        let totalFila = horas * valorHora * multiplicador;
        totalExtras += totalFila;
    });
    
    // 4. Sumar otros conceptos personalizados
    let totalPersonalizados = 0;
    let inputsPersonalizados = document.querySelectorAll(".input-valor-personalizado");
    
    inputsPersonalizados.forEach(function(input) {
        let valor = obtenerNumero(input);
        totalPersonalizados += valor;
    });
    
    // 5. BASE GRAVABLE = Devengado Básico + Extras + Personalizados - Transporte
    let baseGravable = devengadoBasico + totalExtras + totalPersonalizados - auxilioProporcional;
    
    // Salud 4% sobre BASE GRAVABLE (sin transporte)
    let deduccionSalud = baseGravable * PORCENTAJE_SALUD;
    let elementoSalud = document.getElementById("deduccionSalud");
    if (elementoSalud) {
        elementoSalud.textContent = formatearMoneda(deduccionSalud);
    }
    
    // Pensión 4% sobre BASE GRAVABLE (sin transporte)
    let deduccionPension = baseGravable * PORCENTAJE_PENSION;
    let elementoPension = document.getElementById("deduccionPension");
    if (elementoPension) {
        elementoPension.textContent = formatearMoneda(deduccionPension);
    }
    
    // Restaurante
    let unidadesRestaurante = parseFloat(document.getElementById("unidadesRestaurante").value) || 0;
    let valorRestaurante = unidadesRestaurante * VALOR_UNIDAD_RESTAURANTE;
    let elementoRestaurante = document.getElementById("valorRestaurante");
    if (elementoRestaurante) {
        elementoRestaurante.textContent = formatearMoneda(valorRestaurante);
    }
    
    // Abono de Nómina
    let abonoNomina = parseFloat(document.getElementById("abonoNomina").value) || 0;
    let elementoAbonoNomina = document.getElementById("valorAbonoNomina");
    if (elementoAbonoNomina) {
        elementoAbonoNomina.textContent = formatearMoneda(abonoNomina);
    }
    
    // Total deducciones
    let totalDeducciones = deduccionSalud + deduccionPension + valorRestaurante + abonoNomina;
    let elementoTotalDeducciones = document.getElementById("totalDeducciones");
    if (elementoTotalDeducciones) {
        elementoTotalDeducciones.textContent = formatearMoneda(totalDeducciones);
    }
    
    calcularTotalPagar();
}
    
    // ========== TOTAL A PAGAR ==========
    function calcularTotalPagar() {
        let totalDevengadoTexto = document.getElementById("totalDevengado").textContent;
        let totalDeduccionesTexto = document.getElementById("totalDeducciones").textContent;
        
        let totalDevengado = parseFloat(totalDevengadoTexto.replace(/[^0-9]/g, '')) || 0;
        let totalDeducciones = parseFloat(totalDeduccionesTexto.replace(/[^0-9]/g, '')) || 0;
        
        let totalPagar = totalDevengado - totalDeducciones;
        
        let elementoTotalPagar = document.getElementById("totalPagar");
        if (elementoTotalPagar) {
            elementoTotalPagar.textContent = formatearMoneda(totalPagar);
        }
    }
    
    // ========== EVENTOS ==========
    
    // Botón agregar concepto
    document.getElementById("btnAgregar").addEventListener("click", agregarConcepto);
    
    // Enter en el selector
    document.getElementById("selectorConcepto").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            agregarConcepto();
        }
    });
    
    // Salario básico
    salarioBase.addEventListener("input", function() {
        formatearInputMoneda(this);
        calcularValor_hora();
        calcularDevengado();
    });
    
    // Horas mensuales
    horasMensuales.addEventListener("input", calcularValor_hora);
    
    // Auxilio de transporte
    auxilioTransporte.addEventListener("input", function() {
        formatearInputMoneda(this);
        calcularDevengado();
    });
    
    // Días trabajados
    diasTrabajados.addEventListener("input", calcularDevengado);
    
    // Deducciones
    document.getElementById("unidadesRestaurante").addEventListener("input", calcularDeducciones);
    document.getElementById("abonoNomina").addEventListener("input", calcularDeducciones);
    
    // ========== INICIALIZACIÓN ==========
    
    // Formatear valores iniciales
    if (salarioBase.value) formatearInputMoneda(salarioBase);
    if (auxilioTransporte.value) formatearInputMoneda(auxilioTransporte);
    
    // Calcular valores iniciales
    calcularValor_hora();
    calcularDevengado();
    
    console.log("Calculadora de Nómina cargada correctamente");
    
});

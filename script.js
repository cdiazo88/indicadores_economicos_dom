//Declaro variables
var apiUrl = "https://mindicador.cl/api";
let listadoIndicadores = [];
let chart;

let selectorIndicador = document.getElementById("selectorIndicador");
let selectorAno = document.getElementById("selectorAno");
let selectorFecha = document.getElementById("selectorFecha");
let botonBuscar = document.getElementById("botonBuscar");
//grafico
var indicadorChart = document
  .getElementById("indicador-chart")
  .getContext("2d");
//tabla
var indicadorTabla = document.getElementById("tbodyTabla");

//tituloIndicador
let tituloIndicador = document.getElementById("tituloIndicador");
let valorIndicador = document.getElementById("valorIndicador");
let fechaIndicador = document.getElementById("fechaIndicador");

//articles
let sinRegistros = document.getElementById("sinRegistros");
let spinner = document.getElementById("spinner");
let cardIndicador = document.getElementById("cardIndicador");
let contenedorGrafico = document.getElementById("contenedorGrafico");
let contenedorTabla = document.getElementById("contenedorTabla");

botonBuscar.disabled = true;

let indicadorSeleccionado;
let anoSeleccionado;
let fechaSeleccionado;

let estaSeleccionadoIndicador = false;
let estaSeleccionadoAno = false;
let estaSeleccionadoFecha = false;

//Llamada inicial
cargarSelectorIndicadores();
function cargarSelectorIndicadores() {
  axios.get(apiUrl).then(function (response) {
    var indicadores = response.data;
    //Filto solo las validas
    const entradas = Object.entries(indicadores);
    entradas.forEach((element) => {
      if (isObject(element[1])) {
        const indicador = element[1];
        const option = document.createElement("option");
        option.value = indicador.codigo;
        option.textContent = indicador.nombre;
        selectorIndicador.appendChild(option);
      }
    });
  });
}

// Metodos
function cambioIndicador(evt) {
  if (evt === "Seleccione indicador") {
    botonBuscar.disabled = true;
    ocultarCard();
    ocultarGrafico();
  } else {
    botonBuscar.disabled = false;
    indicadorSeleccionado = evt;
    estaSeleccionadoIndicador = true;
    selectorAno.value = "defecto";
    selectorAno.disabled = false;
    selectorFecha.disabled = false;
    estaSeleccionadoAno = false;
    estaSeleccionadoFecha = false;
    selectorFecha.value = "";
    sinRegistros.style.display = "none";
  }
}

function cambioAno(evt) {
  if (evt === "defecto") {
    selectorFecha.disabled = false;
    estaSeleccionadoAno = false;
  } else {
    anoSeleccionado = evt;
    estaSeleccionadoAno = true;
    selectorFecha.disabled = true;
  }
}

function cambioFecha(evt) {
  if (evt.length === 0) {
    selectorAno.disabled = false;
    estaSeleccionadoFecha = false;
  } else {
    fechaSeleccionado = evt;
    estaSeleccionadoFecha = true;
    selectorAno.disabled = true;
  }
}

function buscarDatos() {
  mostrarSpinner();
  let urlDinamica;
  if (!estaSeleccionadoAno && !estaSeleccionadoFecha) {
    urlDinamica = apiUrl + "/" + indicadorSeleccionado;
  } else {
    if (estaSeleccionadoAno) {
      urlDinamica =
        apiUrl + "/" + indicadorSeleccionado + "/" + anoSeleccionado;
    } else {
      urlDinamica =
        apiUrl + "/" + indicadorSeleccionado + "/" + fechaSeleccionado;
    }
  }
  axios.get(urlDinamica).then(function (response) {
    var dataIndicador = response.data;
    ocultarSpinner();
    let esMasDeUno;
    if (dataIndicador.serie.length > 0) {
      if (dataIndicador.serie.length > 1) {
        esMasDeUno = true;
        crearGrafico(dataIndicador);
        crearTabla(dataIndicador);
        mostrarValoresEnCard(dataIndicador, esMasDeUno);
      }
      if (dataIndicador.serie.length === 1) {
        esMasDeUno = false;
        mostrarValoresEnCard(dataIndicador, esMasDeUno);
      }
    } else {
      sinRegistros.style.display = "flex";
    }
  });
}

function mostrarValoresEnCard(data, esMasDeUno) {
  mostrarCard();
  if (esMasDeUno) {
    //mostramos el ultimo
    const largo = data.serie.length;
    tituloIndicador.innerHTML = data.nombre;
    valorIndicador.innerHTML =
      "valor actual: $" + data.serie[largo - 1].valor;
    fechaIndicador.innerHTML =
      "fecha: " +
      moment(data.serie[largo - 1].fecha).format("DD/MM/YYYY");
  } else {
    tituloIndicador.innerHTML = data.nombre;
    valorIndicador.innerHTML = "valor: $" + data.serie[0].valor;
    fechaIndicador.innerHTML =
      "fecha: " +
      moment(data.serie[0].fecha).format("DD/MM/YYYY");
  }
}

function crearGrafico(data) {
  mostrarGrafico();
  iniciarGrafico_tabla(data);
}

function crearTabla(data) {
  indicadorTabla.innerHTML = "";
  let registro = 0;
  data.serie.forEach(function (data) {
    var fecha = moment(data.fecha).format("DD/MM/YYYY");
    var valor = data.valor;
    registro++;
    var row = indicadorTabla.insertRow();
    var registroCell = row.insertCell(0);
    var fechaCell = row.insertCell(1);
    var valorCell = row.insertCell(2);
    registroCell.innerHTML = registro;
    fechaCell.innerHTML = fecha;
    valorCell.innerHTML = valor;
  });
}

function isObject(val) {
  return typeof val === "object";
}

function mostrarSpinner() {
  ocultarCard();
  ocultarGrafico();
  spinner.style.marginTop = "3em";
  spinner.style.visibility = "visible";
}

function ocultarSpinner() {
  spinner.style.marginTop = "0";
  spinner.style.visibility = "hidden";
}

function mostrarGrafico() {
  contenedorGrafico.style.visibility = "visible";
  contenedorTabla.style.visibility = "visible";
}

function ocultarGrafico() {
  contenedorGrafico.style.visibility = "hidden";
  contenedorTabla.style.visibility = "hidden";
}

function mostrarCard() {
  cardIndicador.style.visibility = "visible";
}

function ocultarCard() {
  cardIndicador.style.visibility = "hidden";
}

function iniciarGrafico_tabla(datos) {
  if (chart) {
    chart.clear();
  } else {
    chart = new Chart(indicadorChart, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Valor $",
            data: [],
            backgroundColor: "blue",
            borderColor: "black",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Fecha",
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Valor",
            },
          },
        },
      },
    });
  }
  datos.serie.sort(function (a, b) {
    return moment(a.fecha).valueOf() - moment(b.fecha).valueOf();
  });

  var fechasFormateadas = datos.serie.map(function (data) {
    return moment(data.fecha).format("DD/MM/YYYY");
  });

  chart.data.labels = fechasFormateadas;
  chart.data.datasets[0].data = datos.serie.map(function (data) {
    return data.valor;
  });
  chart.update();
}

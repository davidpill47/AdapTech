/**
 * challenges.js
 * ============================================================
 * Banco de retos de programación del ITS Adaptativo.
 * Nivel: principiantes — sin funciones ni clases.
 * Todo el código trabaja con variables directas y print().
 *
 * Tipos de reto:
 *   crear    → el estudiante escribe la solución desde cero
 *   completar → hay huecos que el estudiante debe rellenar
 *   depurar  → el código tiene errores que debe corregir
 * ============================================================
 */


// ============================================================
// SECCIÓN 1: BANCO DE RETOS
// 4 retos por nivel (bajo, medio, alto), 12 en total.
// Nivel bajo:  variables, operaciones básicas, print
// Nivel medio: condicionales if/else, strings
// Nivel alto:  bucles for, acumuladores, listas básicas
// ============================================================

var CHALLENGES = {

  bajo: [
    {
      id: "b01",
      tipo: "crear",
      titulo: "Área de una habitación",
      descripcion: `Tienes una habitación de 5 metros de largo y 3 metros de ancho.
Calcula el área y muéstrala por pantalla.

El resultado esperado es:
15`,
      plantilla: `largo = 5
ancho = 3

# Calcula el área y guárdala en una variable llamada area
# Luego imprímela`,
      solucion: `largo = 5\nancho = 3\narea = largo * ancho\nprint(area)`,
      conceptos: ["variables", "multiplicación", "print"],
    },

    {
      id: "b02",
      tipo: "completar",
      titulo: "Precio con descuento",
      descripcion: `Un producto cuesta 200 y tiene un descuento de 50.
Completa el código para calcular el precio final e imprimirlo.

El resultado esperado es:
150`,
      plantilla: `precio = 200
descuento = 50

precio_final = precio ___ descuento
print(___)`,
      solucion: `precio = 200\ndescuento = 50\nprecio_final = precio - descuento\nprint(precio_final)`,
      conceptos: ["variables", "resta", "print"],
    },

    {
      id: "b03",
      tipo: "depurar",
      titulo: "Presentación personal",
      descripcion: `El siguiente código tiene 2 errores. Encuéntralos y corrígelos
para que imprima correctamente el nombre y la edad.

El resultado esperado es:
Me llamo Ana
Tengo 25 años`,
      plantilla: `nombre = "Ana"
edad = 25

print("Me llamo" nombre)
print("Tengo", edad "años")`,
      solucion: `nombre = "Ana"\nedad = 25\nprint("Me llamo", nombre)\nprint("Tengo", edad, "años")`,
      conceptos: ["variables", "strings", "print"],
    },

    {
      id: "b04",
      tipo: "crear",
      titulo: "Celsius a Fahrenheit",
      descripcion: `La temperatura en una ciudad es de 25 grados Celsius.
Conviértela a Fahrenheit usando la fórmula:
fahrenheit = (celsius * 9/5) + 32

El resultado esperado es:
77.0`,
      plantilla: `celsius = 25

# Calcula fahrenheit usando la fórmula y luego imprímelo`,
      solucion: `celsius = 25\nfahrenheit = (celsius * 9/5) + 32\nprint(fahrenheit)`,
      conceptos: ["variables", "operaciones", "print"],
    },
  ],


  medio: [
    {
      id: "m01",
      tipo: "crear",
      titulo: "¿Puede votar?",
      descripcion: `La edad mínima para votar es 18 años.
Dada la variable edad, imprime si la persona puede votar o no.

Si edad = 20, el resultado esperado es:
Puede votar

Si edad = 15, el resultado esperado es:
No puede votar`,
      plantilla: `edad = 20

# Escribe el if/else para determinar si puede votar`,
      solucion: `edad = 20\nif edad >= 18:\n    print("Puede votar")\nelse:\n    print("No puede votar")`,
      conceptos: ["condicionales", "comparadores", "print"],
    },

    {
      id: "m02",
      tipo: "completar",
      titulo: "Número par o impar",
      descripcion: `Completa el código para que diga si el número es par o impar.
Pista: un número es par si el resto de dividirlo entre 2 es 0 (usa %).

Si numero = 8, el resultado esperado es:
8 es par

Si numero = 7, el resultado esperado es:
7 es impar`,
      plantilla: `numero = 8

if numero ___ 2 == 0:
    print(numero, "es par")
___:
    print(numero, "es impar")`,
      solucion: `numero = 8\nif numero % 2 == 0:\n    print(numero, "es par")\nelse:\n    print(numero, "es impar")`,
      conceptos: ["condicionales", "módulo", "print"],
    },

    {
      id: "m03",
      tipo: "depurar",
      titulo: "El mayor de dos números",
      descripcion: `El siguiente código tiene 2 errores. Corrígelos para que
imprima cuál de los dos números es mayor.

Si a = 10 y b = 7, el resultado esperado es:
El mayor es 10`,
      plantilla: `a = 10
b = 7

if a > b
    print("El mayor es", a)
else:
    print("El mayor es" b)`,
      solucion: `a = 10\nb = 7\nif a > b:\n    print("El mayor es", a)\nelse:\n    print("El mayor es", b)`,
      conceptos: ["condicionales", "comparadores", "print"],
    },

    {
      id: "m04",
      tipo: "crear",
      titulo: "Calificación en letras",
      descripcion: `Dada una nota entre 0 y 10, imprime la calificación en letras:
- 9 o 10: Sobresaliente
- 7 u 8:  Notable
- 5 o 6:  Aprobado
- menos de 5: Suspenso

Si nota = 8, el resultado esperado es:
Notable`,
      plantilla: `nota = 8

# Escribe los condicionales para imprimir la calificación en letras`,
      solucion: `nota = 8\nif nota >= 9:\n    print("Sobresaliente")\nelif nota >= 7:\n    print("Notable")\nelif nota >= 5:\n    print("Aprobado")\nelse:\n    print("Suspenso")`,
      conceptos: ["condicionales", "elif", "comparadores"],
    },
  ],


  alto: [
    {
      id: "a01",
      tipo: "crear",
      titulo: "Tabla de multiplicar",
      descripcion: `Imprime la tabla de multiplicar del número 3, del 1 al 10.

El resultado esperado es:
3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
...
3 x 10 = 30`,
      plantilla: `numero = 3

# Usa un bucle for con range() para imprimir la tabla`,
      solucion: `numero = 3\nfor i in range(1, 11):\n    print(numero, "x", i, "=", numero * i)`,
      conceptos: ["bucles", "range", "print"],
    },

    {
      id: "a02",
      tipo: "completar",
      titulo: "Suma de números del 1 al 100",
      descripcion: `Completa el código para sumar todos los números del 1 al 100
e imprimir el resultado.

El resultado esperado es:
5050`,
      plantilla: `total = 0

for numero in range(___, ___):
    total = total + ___

print(total)`,
      solucion: `total = 0\nfor numero in range(1, 101):\n    total = total + numero\nprint(total)`,
      conceptos: ["bucles", "acumuladores", "range"],
    },

    {
      id: "a03",
      tipo: "depurar",
      titulo: "Contar números positivos",
      descripcion: `El siguiente código debería contar cuántos números positivos
hay en la lista e imprimirlo. Tiene 2 errores, corrígelos.

El resultado esperado es:
Hay 3 números positivos`,
      plantilla: `numeros = [4, -2, 7, -1, 9, -5, 3]
contador = 0

for n in numeros
    if n > 0:
        contador = contador + 1

print("Hay", contador "números positivos")`,
      solucion: `numeros = [4, -2, 7, -1, 9, -5, 3]\ncontador = 0\nfor n in numeros:\n    if n > 0:\n        contador = contador + 1\nprint("Hay", contador, "números positivos")`,
      conceptos: ["bucles", "listas", "condicionales", "acumuladores"],
    },

    {
      id: "a04",
      tipo: "crear",
      titulo: "Promedio de notas",
      descripcion: `Tienes una lista con 5 notas de un estudiante.
Calcula el promedio sumando todas las notas con un bucle
y dividiéndolas entre la cantidad total. Luego imprímelo.

El resultado esperado es:
El promedio es: 7.4`,
      plantilla: `notas = [8, 6, 9, 7, 7]

# Usa un bucle for para sumar todas las notas
# Luego calcula el promedio y muéstralo`,
      solucion: `notas = [8, 6, 9, 7, 7]\ntotal = 0\nfor nota in notas:\n    total = total + nota\npromedio = total / len(notas)\nprint("El promedio es:", promedio)`,
      conceptos: ["bucles", "listas", "acumuladores", "print"],
    },
  ],
};


// ============================================================
// SECCIÓN 2: ESTADO DEL BANCO DE RETOS
// ============================================================

var challengeState = {
  currentChallenge: null,   // Reto activo en este momento
  completedIds:     [],     // IDs de retos ya completados en la sesión
  lastChangeTime:   null,   // Timestamp del último cambio de reto
};


// ============================================================
// SECCIÓN 3: SELECCIÓN ADAPTATIVA DE RETOS
// El perfil determina el TIPO de reto.
// El nivel determina la DIFICULTAD.
// Si el perfil es "bloqueado", se baja un nivel automáticamente.
// ============================================================

function getNextChallenge(model) {
  const nivel  = model.competenceLevel;
  const perfil = model.activeProfile;

  // Tipo de reto preferido según el perfil
  const tipoPreferido = {
    bloqueado:     "completar",  // más guiado, menos intimidante
    ansioso:       "completar",
    desenganchado: "depurar",    // cambia el modo mental
    impaciente:    "depurar",    // rompe el ciclo de frustración
    explorador:    "crear",
    perfeccionista:"crear",
    fluido:        "crear",
  }[perfil] || "crear";

  // Si el estudiante está bloqueado, bajar un nivel para recuperar confianza
  let nivelReto = nivel;
  if (perfil === "bloqueado" && nivel !== "bajo") {
    nivelReto = nivel === "alto" ? "medio" : "bajo";
  }

  const pool = CHALLENGES[nivelReto] || CHALLENGES["bajo"];

  // Filtrar retos ya completados
  const disponibles = pool.filter(r => !challengeState.completedIds.includes(r.id));

  // Si todos completados, limpiar el historial y reiniciar
  if (disponibles.length === 0) {
    challengeState.completedIds = challengeState.completedIds.filter(
      id => !pool.map(r => r.id).includes(id)
    );
    return getNextChallenge(model);
  }

  // Buscar tipo preferido primero; si no hay, tomar cualquier disponible
  const porTipo    = disponibles.filter(r => r.tipo === tipoPreferido);
  const candidatos = porTipo.length > 0 ? porTipo : disponibles;

  return candidatos[Math.floor(Math.random() * candidatos.length)];
}


// ============================================================
// SECCIÓN 4: CARGA Y EVALUACIÓN DE RETOS
// ============================================================

function loadChallenge(model) {
  const reto = getNextChallenge(model);
  challengeState.currentChallenge = reto;
  challengeState.lastChangeTime   = Date.now();

  const titleEl = document.getElementById("challenge-title");
  const descEl  = document.getElementById("challenge-description");
  const tipoEl  = document.getElementById("challenge-type");

  if (titleEl) titleEl.textContent = reto.titulo;
  if (descEl)  descEl.textContent  = reto.descripcion;
  if (tipoEl)  tipoEl.textContent  = reto.tipo.toUpperCase();

  // Cargar la plantilla en el editor Monaco
  if (typeof monacoEditor !== "undefined") {
    monacoEditor.setValue(reto.plantilla);
  }

  // Actualizar tags de conceptos en el panel izquierdo
  if (typeof updateChallengeUI === "function") {
    updateChallengeUI(reto);
  }

console.log("[ITS] Reto cargado:", reto.id, "| tipo:", reto.tipo, "| nivel:", model.competenceLevel);}


/**
 * evaluateSubmission(userCode, model) → { passed, feedback }
 * Evalúa el código del estudiante con criterios semánticos:
 * 1. No puede ser solo la plantilla sin modificar
 * 2. Debe contener print() — resultado visible
 * 3. Debe usar al menos la mitad de los conceptos clave del reto
 */
function evaluateSubmission(userCode, model) {
  const reto = challengeState.currentChallenge;
  if (!reto) return { passed: false, feedback: "No hay reto activo." };

  const code = userCode.trim();

  // Criterio 1: no puede estar vacío ni ser solo la plantilla
  const sinComentarios = code.replace(/#.*/g, "").replace(/\s+/g, " ").trim();
  if (!sinComentarios || sinComentarios.length < 20) {
    return { passed: false, feedback: "Escribe tu solución antes de entregar." };
  }

  // Criterio 2: no puede tener ___ sin rellenar (huecos de completar sin resolver)
  if (code.includes("___")) {
    return { passed: false, feedback: "Todavía hay huecos por completar (___) en tu código." };
  }

  // Criterio 3: debe tener print() — la solución debe mostrar algo
  if (!code.includes("print")) {
    return { passed: false, feedback: "Tu solución necesita un print() para mostrar el resultado." };
  }

  // Criterio 4: debe usar conceptos clave del reto
  const keywordMap = {
    "variables":    ["="],
    "print":        ["print("],
    "multiplicación":["*"],
    "suma":         ["+"],
    "resta":        ["-"],
    "división":     ["/"],
    "operaciones":  ["*", "+", "-", "/"],
    "strings":      ['"', "'"],
    "condicionales":["if ", "else"],
    "comparadores": [">", "<", ">=", "<=", "=="],
    "módulo":       ["%"],
    "elif":         ["elif"],
    "bucles":       ["for "],
    "range":        ["range("],
    "acumuladores": ["+=", "= total +", "= contador +", "= suma +"],
    "listas":       ["[", "in "],
  };

  const conceptos = reto.conceptos || [];
  const cumplidos = conceptos.filter(c => {
    const kws = keywordMap[c] || [];
    return kws.some(kw => code.includes(kw));
  });

  const umbral = Math.ceil(conceptos.length / 2);
  if (cumplidos.length < umbral) {
    return {
      passed:   false,
      feedback: `Tu solución aún no usa los elementos esperados: ${conceptos.join(", ")}.`,
    };
  }

  // Aprobado
  challengeState.completedIds.push(reto.id);
  return {
    passed:   true,
    feedback: `¡Reto completado! Conceptos practicados: ${reto.conceptos.join(", ")}.`,
  };
}


/**
 * onChallengeCompleted(model)
 * Carga el siguiente reto tras completar el actual.
 */
function onChallengeCompleted(model) {
  console.log("[ITS] Reto completado. Cargando siguiente...");
  setTimeout(() => loadChallenge(model), 1500);
}
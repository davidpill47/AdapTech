/**
 * userModel.js
 * ============================================================
 * SISTEMA DE TUTORÍA INTELIGENTE ADAPTATIVO (ITS)
 * Materia: Sistemas Adaptativos y Modelado de Usuarios
 * Autor: David Pillco
 *
 * RESPONSABILIDAD DE ESTE MÓDULO:
 * Mantener el "modelo de usuario" actualizado en tiempo real.
 * Un modelo de usuario es la representación interna que el sistema
 * construye sobre el estudiante a partir de sus acciones observables,
 * sin interrumpir ni modificar su experiencia de aprendizaje
 * (principio de NO INTRUSIVIDAD).
 *
 * Este módulo NO infiere rasgos psicológicos (eso lo hace inference.js).
 * Solo captura y organiza los datos de comportamiento bruto.
 * ============================================================
 */


// ============================================================
// SECCIÓN 1: ESTADO INICIAL DEL MODELO
// ============================================================
// El modelo de usuario es un objeto JSON que actúa como "memoria"
// del sistema. Se inicializa al comenzar la sesión y se actualiza
// con cada acción del estudiante.
//
// Cada campo corresponde a una métrica de comportamiento definida
// en el diseño del sistema (ver documentación del proyecto).
// ============================================================

var userModel = {

  // ----------------------------------------------------------
  // MÉTRICAS DE SESIÓN
  // Datos generales sobre la sesión actual de trabajo.
  // ----------------------------------------------------------

  sessionStart: null,       // Timestamp (ms) del inicio de la sesión.
                            // Se usa para calcular session_time.

  sessionTime: 0,           // Duración activa de la sesión en minutos.
                            // Métrica base para normalizar Act (Actividad).

  lastActivityTime: null,   // Timestamp de la última acción registrada.
                            // Permite detectar períodos de inactividad (idle).


  // ----------------------------------------------------------
  // MÉTRICAS DE EJECUCIÓN
  // Registran el comportamiento del estudiante al ejecutar código.
  // Son las principales fuentes de inferencia para Act e ImpSS.
  // ----------------------------------------------------------

  execCount: 0,             // Nº total de ejecuciones en la sesión.
                            // Alto → estudiante activo (Act ↑).

  execHistory: [],          // Array con los timestamps de cada ejecución.
                            // Se usa para calcular la frecuencia en la
                            // ventana deslizante (últimas WINDOW_SIZE ejecuciones).

  avgThinkTime: 0,          // Tiempo promedio (segundos) entre la última
                            // edición de código y la siguiente ejecución.
                            // Bajo → ejecuta sin reflexionar (ImpSS ↑).

  lastEditTime: null,       // Timestamp de la última edición en el editor.
                            // Se compara con el momento de ejecución para
                            // calcular avgThinkTime.

  thinkTimeSamples: [],     // Historial de tiempos de reflexión individuales.
                            // Se promedia para obtener avgThinkTime.
                            // Solo se conservan las últimas WINDOW_SIZE muestras.


  // ----------------------------------------------------------
  // MÉTRICAS DE ERRORES
  // Distinguen entre tipos de error porque tienen significados
  // psicológicos diferentes en el modelo Alternative Five.
  // ----------------------------------------------------------

  syntaxErrors: 0,          // Errores de SINTAXIS acumulados en la sesión.
                            // Implica que el código no pudo ni ejecutarse.
                            // Alta ratio syntax_errors/exec → ImpSS ↑
                            // (el estudiante ejecuta sin revisar la escritura).

  runtimeErrors: 0,         // Errores en TIEMPO DE EJECUCIÓN (bugs lógicos).
                            // El código corrió pero produjo un error.
                            // Contribuye a N-Anx cuando son persistentes.

  consecutiveErrors: 0,     // Contador de errores seguidos sin éxito entre medio.
                            // Señal temprana de bloqueo. Se resetea al lograr
                            // una ejecución exitosa.


  // ----------------------------------------------------------
  // MÉTRICAS DE ESTABILIDAD EMOCIONAL
  // Señales indirectas de frustración, ansiedad o bloqueo.
  // Son la base para inferir N-Anx (Neuroticismo-Ansiedad) y Agg.
  // ----------------------------------------------------------

  idleCount: 0,             // Nº de períodos sin actividad > IDLE_THRESHOLD_MS.
                            // Un idle largo tras un error = señal de frustración
                            // o bloqueo. Contribuye a N-Anx ↑.

  hintRequests: 0,          // Nº de veces que el estudiante pidió una pista.
                            // Pedir ayuda muy pronto ante un error → N-Anx ↑.

  deleteRatio: 0,           // Ratio: líneas borradas / líneas escritas totales.
                            // Borrar grandes bloques = frustración o rechazo
                            // del propio trabajo → Agg ↑.

  totalLinesWritten: 0,     // Contador de líneas escritas (para calcular deleteRatio).

  totalLinesDeleted: 0,     // Contador de líneas borradas (para calcular deleteRatio).

  reworkRate: 0,            // Ratio de ejecuciones sin cambio lógico entre
                            // dos ejecuciones consecutivas (ejecutar lo mismo
                            // repetidamente sin modificar el código → Agg ↑).

  lastCodeSnapshot: "",     // Copia del código en la última ejecución.
                            // Se compara con el código actual para detectar
                            // si hubo cambio lógico real o solo reejecutó.


  // ----------------------------------------------------------
  // VENTANA DESLIZANTE
  // El sistema no calcula sobre toda la sesión sino sobre las
  // últimas WINDOW_SIZE (10) ejecuciones. Esto permite que el
  // perfil cambie si el estudiante mejora o empeora con el tiempo.
  // Es el mecanismo que hace que la adaptación sea continua.
  // ----------------------------------------------------------

  windowSize: 10,           // Tamaño de la ventana deslizante.
                            // Valor definido en config.js, copiado aquí
                            // para que el módulo sea autocontenido.

  windowBuffer: [],         // Array de los últimos windowSize snapshots.
                            // Cada snapshot = estado del modelo en una ejecución.
                            // inference.js lee este buffer para calcular los rasgos.


  // ----------------------------------------------------------
  // NIVEL DE COMPETENCIA INFERIDO
  // El nivel es la salida del sistema de inferencia.
  // Aquí se almacena para que otros módulos (tutor.js, challenges.js)
  // puedan leerlo sin recalcularlo.
  // ----------------------------------------------------------

  competenceLevel: "medio", // Nivel actual inferido: "bajo", "medio" o "alto".
                            // Se actualiza cada vez que inference.js recalcula.

  activeProfile: "fluido",  // Perfil psicológico activo del estudiante.
                            // Uno de los 7 arquetipos definidos en el diseño.
                            // Determina qué estrategia de adaptación se aplica.

  profileHistory: [],       // Historial de perfiles a lo largo de la sesión.
                            // Útil para el análisis post-sesión y para detectar
                            // transiciones (ej: de "explorador" a "impaciente").
};


// ============================================================
// SECCIÓN 2: FUNCIONES DE INICIALIZACIÓN
// ============================================================

/**
 * initSession()
 * Inicializa el modelo al comenzar una nueva sesión de trabajo.
 * Debe llamarse una sola vez cuando el estudiante carga la aplicación.
 *
 * Patrón de diseño: Reset + Timestamp inicial.
 * Restablecer el modelo en cada sesión garantiza que los rasgos
 * inferidos correspondan a la sesión actual, no a sesiones previas.
 */
function initSession() {
  const now = Date.now();

  userModel.sessionStart      = now;
  userModel.lastActivityTime  = now;
  userModel.sessionTime       = 0;

  // Reiniciar todas las métricas de ejecución
  userModel.execCount         = 0;
  userModel.execHistory       = [];
  userModel.avgThinkTime      = 0;
  userModel.lastEditTime      = now;
  userModel.thinkTimeSamples  = [];

  // Reiniciar métricas de error
  userModel.syntaxErrors      = 0;
  userModel.runtimeErrors     = 0;
  userModel.consecutiveErrors = 0;

  // Reiniciar métricas de estabilidad
  userModel.idleCount         = 0;
  userModel.hintRequests      = 0;
  userModel.deleteRatio       = 0;
  userModel.totalLinesWritten = 0;
  userModel.totalLinesDeleted = 0;
  userModel.reworkRate        = 0;
  userModel.lastCodeSnapshot  = "";

  // Reiniciar ventana y perfil
  userModel.windowBuffer      = [];
  userModel.competenceLevel   = "medio";
  userModel.activeProfile     = "fluido";
  userModel.profileHistory    = [];

  // Iniciar el bucle de detección de inactividad
  startIdleDetector();

  console.log("[ITS] Sesión iniciada:", new Date(now).toLocaleTimeString());
}


// ============================================================
// SECCIÓN 3: FUNCIONES DE REGISTRO DE EVENTOS
// Estas funciones son llamadas desde index.html en respuesta
// a los eventos del editor Monaco. Son el "puente" entre
// lo que el estudiante hace y lo que el sistema registra.
// ============================================================

/**
 * onCodeEdit()
 * Se dispara cada vez que el estudiante edita el código.
 * Registra el momento de la última edición (para calcular
 * avgThinkTime) y actualiza las métricas de líneas escritas/borradas.
 *
 * @param {object} event - Evento de Monaco (IModelContentChangedEvent).
 *                         Contiene información sobre qué cambió.
 */
function onCodeEdit(event) {
  userModel.lastEditTime     = Date.now();
  userModel.lastActivityTime = Date.now();

  // Monaco reporta los cambios como un array de rangos modificados.
  // Sumamos las líneas añadidas y eliminadas en cada cambio.
  event.changes.forEach(change => {
    const linesAdded   = change.text.split("\n").length - 1;
    const linesRemoved = change.rangeLength > 0
      ? change.range.endLineNumber - change.range.startLineNumber
      : 0;

    userModel.totalLinesWritten += linesAdded;
    userModel.totalLinesDeleted += linesRemoved;
  });

  // Recalcular deleteRatio en cada edición.
  // Protección contra división por cero si aún no se escribió nada.
  if (userModel.totalLinesWritten > 0) {
    userModel.deleteRatio =
      userModel.totalLinesDeleted / userModel.totalLinesWritten;
  }
}


/**
 * onCodeRun(currentCode, hasError, errorType)
 * Se dispara cuando el estudiante ejecuta el código.
 * Es el evento más importante del sistema: actualiza la mayoría
 * de las métricas y dispara la actualización del ventana deslizante.
 *
 * @param {string} currentCode - Código actual en el editor.
 * @param {boolean} hasError   - true si la ejecución produjo error.
 * @param {string} errorType   - "syntax", "runtime" o "none".
 */
function onCodeRun(currentCode, hasError, errorType) {
  const now = Date.now();
  userModel.lastActivityTime = now;

  // --- 1. Actualizar contador y historial de ejecuciones ---
  userModel.execCount++;
  userModel.execHistory.push(now);

  // --- 2. Calcular tiempo de reflexión (think time) ---
  // Es el tiempo que pasó desde la última edición hasta ejecutar.
  // Si es muy corto (< 15s), el estudiante no revisó antes de correr.
  if (userModel.lastEditTime) {
    const thinkTimeSecs = (now - userModel.lastEditTime) / 1000;
    userModel.thinkTimeSamples.push(thinkTimeSecs);

    // Mantener solo las últimas windowSize muestras
    if (userModel.thinkTimeSamples.length > userModel.windowSize) {
      userModel.thinkTimeSamples.shift(); // elimina el más antiguo
    }

    // Actualizar el promedio
    userModel.avgThinkTime =
      userModel.thinkTimeSamples.reduce((a, b) => a + b, 0) /
      userModel.thinkTimeSamples.length;
  }

  // --- 3. Registrar errores según tipo ---
  if (hasError) {
    userModel.consecutiveErrors++;
    if (errorType === "syntax")  userModel.syntaxErrors++;
    if (errorType === "runtime") userModel.runtimeErrors++;
  } else {
    // Ejecución exitosa: resetear contador de errores consecutivos
    userModel.consecutiveErrors = 0;
  }

  // --- 4. Detectar rework (ejecutar sin cambio lógico real) ---
  // Si el código actual es casi igual al snapshot anterior,
  // el estudiante "golpeó la pared" en lugar de cambiar el enfoque.
  const codeChanged = currentCode.trim() !== userModel.lastCodeSnapshot.trim();
  if (!codeChanged && userModel.execCount > 1) {
    // Penalización proporcional: el reworkRate sube gradualmente
    userModel.reworkRate = Math.min(userModel.reworkRate + 0.1, 1.0);
  } else {
    // Si sí cambió el código, el reworkRate baja (estudiante está evolucionando)
    userModel.reworkRate = Math.max(userModel.reworkRate - 0.05, 0.0);
  }
  userModel.lastCodeSnapshot = currentCode;

  // --- 5. Actualizar tiempo de sesión ---
  userModel.sessionTime =
    (now - userModel.sessionStart) / 60000; // en minutos

  // --- 6. Guardar snapshot en la ventana deslizante ---
  // Cada vez que se ejecuta, guardamos el estado actual del modelo.
  // inference.js usará este buffer para calcular los rasgos.
  saveWindowSnapshot();

  // --- 7. Disparar actualización del sistema de inferencia ---
  // La función inferTraits() vive en inference.js.
  // Actualiza activeProfile y competenceLevel en userModel.
  if (typeof inferTraits === "function") {
    inferTraits(userModel);
  }
}


/**
 * onHintRequested()
 * Se dispara cuando el estudiante hace clic en el botón de pista.
 * Incrementa el contador de ayudas solicitadas, que contribuye a N-Anx.
 */
function onHintRequested() {
  userModel.hintRequests++;
  userModel.lastActivityTime = Date.now();
  console.log("[ITS] Pista solicitada. Total:", userModel.hintRequests);
}


// ============================================================
// SECCIÓN 4: VENTANA DESLIZANTE
// ============================================================

/**
 * saveWindowSnapshot()
 * Guarda el estado actual de las métricas relevantes como un
 * "snapshot" en el buffer de la ventana deslizante.
 *
 * Por qué una ventana deslizante:
 * Si calculáramos los rasgos sobre toda la sesión, un estudiante
 * que empezó mal pero mejoró seguiría siendo clasificado como
 * "impulsivo" aunque ya no lo sea. La ventana deslizante captura
 * el comportamiento RECIENTE, permitiendo que el perfil evolucione.
 */
function saveWindowSnapshot() {
  const snapshot = {
    timestamp:          Date.now(),
    execCount:          userModel.execCount,
    sessionTime:        userModel.sessionTime,
    syntaxErrors:       userModel.syntaxErrors,
    runtimeErrors:      userModel.runtimeErrors,
    consecutiveErrors:  userModel.consecutiveErrors,
    avgThinkTime:       userModel.avgThinkTime,
    idleCount:          userModel.idleCount,
    hintRequests:       userModel.hintRequests,
    deleteRatio:        userModel.deleteRatio,
    reworkRate:         userModel.reworkRate,
  };

  userModel.windowBuffer.push(snapshot);

  // Mantener solo los últimos windowSize snapshots.
  // Al superar el límite, se elimina el más antiguo (FIFO).
  if (userModel.windowBuffer.length > userModel.windowSize) {
    userModel.windowBuffer.shift();
  }
}


// ============================================================
// SECCIÓN 5: DETECCIÓN DE INACTIVIDAD (IDLE)
// ============================================================

/**
 * startIdleDetector()
 * Inicia un intervalo que comprueba periódicamente si el estudiante
 * lleva más de IDLE_THRESHOLD_MS sin interactuar con el editor.
 *
 * La inactividad prolongada tras un error es una señal de bloqueo
 * o frustración (contribuye a N-Anx). La detección es pasiva:
 * el sistema revisa en silencio, sin preguntarle nada al estudiante.
 *
 * El intervalo se comprueba cada 10 segundos para no sobrecargar
 * el navegador, pero el umbral de detección es de 90 segundos.
 */
function startIdleDetector() {
  // Usar la constante definida en config.js si está disponible,
  // o 90.000ms (90 segundos) como valor por defecto.
  const threshold =
    (typeof CONFIG !== "undefined" && CONFIG.IDLE_THRESHOLD_MS)
      ? CONFIG.IDLE_THRESHOLD_MS
      : 90000;

  // Variable para evitar contar el mismo período de idle dos veces
  let idleAlreadyCounted = false;

  setInterval(() => {
    const timeSinceActivity = Date.now() - userModel.lastActivityTime;

    if (timeSinceActivity > threshold && !idleAlreadyCounted) {
      // El estudiante lleva más de 90s sin hacer nada
      userModel.idleCount++;
      idleAlreadyCounted = true;

      console.log("[ITS] Idle detectado. Total:", userModel.idleCount);

      // Si hay un tutor activo y el perfil lo requiere, disparar intervención
      if (typeof checkTutorIntervention === "function") {
        checkTutorIntervention(userModel);
      }

    } else if (timeSinceActivity < threshold) {
      // El estudiante volvió a estar activo: resetear bandera
      idleAlreadyCounted = false;
    }

  }, 10000); // comprobar cada 10 segundos
}


// ============================================================
// SECCIÓN 6: UTILIDADES DE LECTURA
// Funciones auxiliares para que otros módulos (inference.js,
// tutor.js) puedan leer el modelo de forma clara y segura.
// ============================================================

/**
 * getExecRate()
 * Calcula la frecuencia de ejecución actual en ejecuciones/minuto.
 * Es la métrica base para calcular el rasgo Actividad (Act).
 *
 * @returns {number} Ejecuciones por minuto en la sesión actual.
 */
function getExecRate() {
  if (userModel.sessionTime <= 0) return 0;
  return userModel.execCount / userModel.sessionTime;
}


/**
 * getSyntaxErrorRate()
 * Calcula qué proporción de las ejecuciones terminó en error de sintaxis.
 * Es la métrica base para calcular Impulsividad (ImpSS).
 *
 * @returns {number} Valor entre 0 y 1. 0 = nunca hay errores de sintaxis.
 */
function getSyntaxErrorRate() {
  if (userModel.execCount === 0) return 0;
  return userModel.syntaxErrors / userModel.execCount;
}


/**
 * getModelSnapshot()
 * Devuelve un resumen limpio del modelo de usuario.
 * Se usa para construir el prompt que se envía a Claude API.
 *
 * @returns {object} Objeto con las métricas más relevantes.
 */
function getModelSnapshot() {
  return {
    nivel:        userModel.competenceLevel,
    perfil:       userModel.activeProfile,
    sessionTime:  userModel.sessionTime.toFixed(1),
    execCount:    userModel.execCount,
    syntaxErrors: userModel.syntaxErrors,
    runtimeErrors:userModel.runtimeErrors,
    avgThinkTime: userModel.avgThinkTime.toFixed(1),
    idleCount:    userModel.idleCount,
    hintRequests: userModel.hintRequests,
    deleteRatio:  userModel.deleteRatio.toFixed(2),
    reworkRate:   userModel.reworkRate.toFixed(2),
  };
}

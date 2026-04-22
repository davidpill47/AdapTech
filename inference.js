/**
 * inference.js
 * ============================================================
 * Motor de inferencia del ITS Adaptativo.
 * Lee las métricas de userModel.js, calcula los 4 rasgos del
 * modelo Alternative Five y determina el perfil activo del estudiante.
 *
 * Flujo: métricas brutas → normalización → rasgos → perfil → acción
 * ============================================================
 */


// ============================================================
// SECCIÓN 1: UMBRALES Y CONSTANTES
// Valores de referencia para normalizar y clasificar rasgos.
// Ajustar según datos reales de prueba con usuarios.
// ============================================================

const THRESHOLDS = {
  // Actividad: ejecuciones/min consideradas alta actividad
  ACT_MAX_RATE: 4.0,

  // Impulsividad: ratio syntax_errors/exec que indica impulsividad alta
  IMP_HIGH: 0.6,
  IMP_LOW:  0.25,

  // Think time bajo = ejecutó sin reflexionar (penaliza ImpSS)
  THINK_TIME_LOW_SEC: 15,

  // Umbrales para clasificar cada rasgo en Bajo / Medio / Alto
  LEVEL_LOW:  0.3,
  LEVEL_HIGH: 0.6,
};


// ============================================================
// SECCIÓN 2: CÁLCULO DE RASGOS (Alternative Five)
// Cada función recibe el userModel y devuelve un valor [0, 1].
// 0 = rasgo ausente, 1 = rasgo muy pronunciado.
// ============================================================

/**
 * calcActividad(model) → [0,1]
 * Frecuencia de ejecución normalizada al máximo esperado.
 * Valor alto = estudiante muy activo e involucrado.
 */
function calcActividad(model) {
  if (model.sessionTime <= 0) return 0;
  const rate = model.execCount / model.sessionTime; // ejecuciones/min
  return Math.min(rate / THRESHOLDS.ACT_MAX_RATE, 1.0);
}

/**
 * calcImpulsividad(model) → [0,1]
 * Ratio de errores de sintaxis por ejecución.
 * Se amplifica si el tiempo de reflexión promedio fue bajo.
 * Valor alto = ejecuta sin revisar el código.
 */
function calcImpulsividad(model) {
  if (model.execCount === 0) return 0;

  let imp = model.syntaxErrors / model.execCount;

  // Penalización si el estudiante ejecuta muy rápido sin pensar
  if (model.avgThinkTime > 0 && model.avgThinkTime < THRESHOLDS.THINK_TIME_LOW_SEC) {
    imp = Math.min(imp * 1.2, 1.0);
  }

  return Math.min(imp, 1.0);
}

/**
 * calcNeuroticismo(model) → [0,1]
 * Combina señales de frustración (idle + hints) con la tasa de
 * errores en ejecución. Valor alto = inestabilidad ante dificultades.
 */
function calcNeuroticismo(model) {
  // Señal de frustración: normalizada a un máximo razonable (5 eventos)
  const frustration = Math.min((model.idleCount + model.hintRequests) / 5, 1.0);

  // Persistencia en errores: qué proporción de ejecuciones fallaron
  const totalExec = model.execCount + 1; // +1 evita división por cero
  const persistence = model.runtimeErrors / totalExec;

  // Ponderación: la frustración observable tiene más peso (0.6)
  return Math.min(frustration * 0.6 + persistence * 0.4, 1.0);
}


function calcAgresion(model) {
  const deleteComponent  = Math.min(model.deleteRatio, 1.0);
  const reworkComponent  = Math.min(model.reworkRate,  1.0);

  return Math.min(deleteComponent * 0.7 + reworkComponent * 0.3, 1.0);
}


// ============================================================
// SECCIÓN 3: CLASIFICACIÓN DE NIVEL POR RASGO
// Convierte el valor continuo [0,1] en una etiqueta discreta.
// ============================================================

function classifyLevel(value) {
  if (value < THRESHOLDS.LEVEL_LOW)  return "bajo";
  if (value > THRESHOLDS.LEVEL_HIGH) return "alto";
  return "medio";
}


// ============================================================
// SECCIÓN 4: LÓGICA DE PERFILES
// Determina el perfil activo aplicando las reglas de prioridad
// definidas en el diseño del sistema (ver tabla de combinaciones).
// Las reglas se evalúan en orden: la primera que se cumple gana.
// ============================================================

/**
 * determineProfile(traits) → string (nombre del perfil)
 * @param {object} traits - { act, imp, nanx, agg } valores [0,1]
 */
function determineProfile(traits) {
  const { act, imp, nanx, agg } = traits;

  // Regla 1 — PRIORIDAD MÁXIMA: frustración + destrucción simultáneas
  if (nanx > THRESHOLDS.LEVEL_HIGH && agg > 0.55)
    return "bloqueado";

  // Regla 2 — Alta actividad con frustración creciente (pre-bloqueado)
  if (act > THRESHOLDS.LEVEL_HIGH && imp > THRESHOLDS.LEVEL_HIGH && nanx > 0.45)
    return "impaciente";

  // Regla 3 — Ansioso pero no destructivo
  if (nanx > THRESHOLDS.LEVEL_HIGH && agg < THRESHOLDS.LEVEL_LOW)
    return "ansioso";

  // Regla 4 — Activo e impulsivo sin frustración (energía sin dirección)
  if (act > THRESHOLDS.LEVEL_HIGH && imp > THRESHOLDS.LEVEL_HIGH)
    return "explorador";

  // Regla 5 — Poca actividad con borrado moderado, sin ansiedad (aburrido)
  if (act < THRESHOLDS.LEVEL_LOW && agg > THRESHOLDS.LEVEL_LOW && nanx < THRESHOLDS.LEVEL_LOW)
    return "desenganchado";

  // Regla 6 — Baja actividad y baja impulsividad (paralizado por perfeccionismo)
  if (act < THRESHOLDS.LEVEL_LOW && imp < THRESHOLDS.LEVEL_LOW)
    return "perfeccionista";

  // Regla 7 — Caso por defecto: estado óptimo o intermedio
  return "fluido";
}


// ============================================================
// SECCIÓN 5: FUNCIÓN PRINCIPAL
// Punto de entrada llamado desde userModel.js tras cada ejecución.
// ============================================================

/**
 * inferTraits(model)
 * Calcula los 4 rasgos, determina el perfil y actualiza el modelo.
 * También registra el perfil en el historial de la sesión.
 *
 * @param {object} model - Referencia directa a userModel (se modifica in-place).
 */
function inferTraits(model) {

  // --- Calcular los 4 rasgos ---
  const traits = {
    act:  calcActividad(model),
    imp:  calcImpulsividad(model),
    nanx: calcNeuroticismo(model),
    agg:  calcAgresion(model),
  };

  // --- Clasificar nivel de competencia (basado en Act como proxy) ---
  // Act es el indicador más directo de engagement y progreso.
  model.competenceLevel = classifyLevel(traits.act);

  // --- Determinar perfil activo ---
  const newProfile = determineProfile(traits);

  // Registrar en historial solo si hubo cambio de perfil
  if (newProfile !== model.activeProfile) {
    model.profileHistory.push({
      timestamp: Date.now(),
      from:      model.activeProfile,
      to:        newProfile,
      traits:    { ...traits }, // copia para no mutar el historial
    });
    console.log(`[ITS] Perfil: ${model.activeProfile} → ${newProfile}`);
  }

  model.activeProfile = newProfile;

  // --- Exponer rasgos en el modelo para que tutor.js los lea ---
  model.currentTraits = traits;

  // --- Mostrar estado en consola durante desarrollo ---
  console.log("[ITS] Rasgos:", {
    Act:  traits.act.toFixed(2),
    Imp:  traits.imp.toFixed(2),
    NAnx: traits.nanx.toFixed(2),
    Agg:  traits.agg.toFixed(2),
    Perfil: newProfile,
  });
}
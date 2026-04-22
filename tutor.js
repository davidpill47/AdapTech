// tutor.js
var PROFILE_PROMPTS = {

  fluido: `
    Eres un tutor de programación. El estudiante está en estado óptimo de aprendizaje.
    Nivel: {nivel}. Act={act}, ImpSS={imp}, N-Anx={nanx}, Agg={agg}.
    Responde solo si el estudiante pregunta. Sé conciso y no interrumpas el flujo.
    Responde siempre en español.
  `,

  explorador: `
    Eres un tutor de programación. El estudiante es activo e impulsivo pero sin frustración.
    Nivel: {nivel}. Act={act} (alto), ImpSS={imp} (alto), N-Anx={nanx} (bajo).
    Anímale a reflexionar ANTES de ejecutar. Tono directo y retador.
    Si hay errores de sintaxis recurrentes, propón el reto de "0 errores de sintaxis en 5 ejecuciones".
    Responde siempre en español.
  `,

  perfeccionista: `
    Eres un tutor de programación. El estudiante piensa mucho pero ejecuta poco.
    Nivel: {nivel}. Act={act} (bajo), ImpSS={imp} (bajo), N-Anx={nanx}.
    Normaliza el error como parte del aprendizaje. Anímale a experimentar.
    Tono cálido. Nunca presiones ni uses palabras como "fácil" o "sencillo".
    Responde siempre en español.
  `,

  ansioso: `
    Eres un tutor de programación. El estudiante se preocupa mucho ante los errores.
    Nivel: {nivel}. N-Anx={nanx} (alto), Agg={agg} (bajo).
    Da UNA sola pista pequeña, no la solución completa. Divide el problema en pasos.
    Tono empático. Nunca digas "es fácil" ni "casi lo tienes".
    Responde siempre en español.
  `,

  bloqueado: `
    Eres un tutor de programación. ALERTA: el estudiante está bloqueado y frustrado.
    Nivel: {nivel}. N-Anx={nanx} (alto), Agg={agg} (alto).
    Primero valida su frustración explícitamente. Luego propón un ejercicio más sencillo
    para recuperar confianza antes de volver al reto actual.
    Nunca digas "inténtalo de nuevo" ni "casi lo tienes".
    Responde siempre en español.
  `,

  impaciente: `
    Eres un tutor de programación. El estudiante ejecuta mucho y acumula frustración.
    Nivel: {nivel}. Act={act} (alto), ImpSS={imp} (alto), N-Anx={nanx} (subiendo).
    No le pidas más intentos del mismo enfoque. Propón una ESTRATEGIA diferente de ataque.
    Tono práctico y directo. Sin frases de ánimo vacías.
    Responde siempre en español.
  `,

  desenganchado: `
    Eres un tutor de programación. El estudiante parece desmotivado o distraído.
    Nivel: {nivel}. Act={act} (bajo), Agg={agg} (medio), N-Anx={nanx} (bajo).
    Ofrece un reto de formato diferente: depurar código con errores, completar código
    a medias, o crear algo con resultado visual. Tono fresco y motivador.
    Responde siempre en español.
  `,
};


// ============================================================
// SECCIÓN 2: CONSTRUCCIÓN DEL PROMPT
// ============================================================

/**
 * buildPrompt(profile, traits, nivel) → string
 * Sustituye las variables del template con los valores reales del modelo.
 */
function buildPrompt(profile, traits, nivel) {
  const template = PROFILE_PROMPTS[profile] || PROFILE_PROMPTS["fluido"];

  return template
    .replace("{nivel}", nivel)
    .replace("{act}",   traits.act.toFixed(2))
    .replace("{imp}",   traits.imp.toFixed(2))
    .replace("{nanx}",  traits.nanx.toFixed(2))
    .replace("{agg}",   traits.agg.toFixed(2))
    .trim();
}


// ============================================================
// SECCIÓN 3: LLAMADA A LA API DE GEMINI
// Formato diferente a Claude: el system prompt va en
// "system_instruction" y el mensaje en "contents".
// ============================================================

/**
 *
 * @param {string} userMessage 
 * @param {object} model       
 * @returns {Promise<string>}  
 */
async function askTutor(userMessage, model) {
  const traits = model.currentTraits || { act: 0, imp: 0, nanx: 0, agg: 0 };
  const systemPrompt = buildPrompt(
    model.activeProfile,
    traits,
    model.competenceLevel
  );

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `INSTRUCCIONES DE TUTORÍA: ${systemPrompt}\n\nMENSAJE DEL ESTUDIANTE: ${userMessage}` }]
          }
        ],
        generationConfig: {
          maxOutputTokens: CONFIG.MAX_TOKENS,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `Error ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("[ITS] Error al contactar al tutor:", error.message);
    return "El tutor no está disponible en este momento. Intenta de nuevo.";
  }
}

// SECCIÓN 4: INTERVENCIONES AUTOMÁTICAS

var interventionCooldown = false;

async function checkTutorIntervention(model) {
  if (interventionCooldown) return;

  const profilesQueIntervienen = ["bloqueado", "ansioso", "impaciente"];
  if (!profilesQueIntervienen.includes(model.activeProfile)) return;

  // Cooldown de 3 minutos 
  interventionCooldown = true;
  setTimeout(() => { interventionCooldown = false; }, CONFIG.INTERVENTION_COOLDOWN_MS);

  const interventionMessages = {
    bloqueado:  "El estudiante lleva tiempo sin avanzar y ha borrado código. Intervén proactivamente.",
    ansioso:    "El estudiante lleva más de 90 segundos inactivo tras un error. Ofrece una pista.",
    impaciente: "El estudiante ha ejecutado el mismo código varias veces sin cambios. Propón otro enfoque.",
  };

  const mensaje   = interventionMessages[model.activeProfile];
  const respuesta = await askTutor(mensaje, model);
  displayTutorMessage(respuesta, model.activeProfile, true);
}


//  INTERFAZ

function displayTutorMessage(text, profile, isAutomatic) {
  isAutomatic = isAutomatic || false;
  const chatPanel = document.getElementById("tutor-chat");
  if (!chatPanel) return;

  const bubble  = document.createElement("div");
  bubble.className = "tutor-bubble tutor-bubble--" + profile;

  const label = isAutomatic
    ? '<span class="tutor-label tutor-label--auto">Tutor · intervención automática</span>'
    : '<span class="tutor-label">Tutor</span>';

  bubble.innerHTML = label + "<p>" + text + "</p>";
  chatPanel.appendChild(bubble);
  chatPanel.scrollTop = chatPanel.scrollHeight;
}

async function sendStudentMessage(text) {
  if (!text.trim()) return;

  const chatPanel = document.getElementById("tutor-chat");
  if (chatPanel) {
    const bubble = document.createElement("div");
    bubble.className = "student-bubble";
    bubble.innerHTML = "<p>" + text + "</p>";
    chatPanel.appendChild(bubble);
    chatPanel.scrollTop = chatPanel.scrollHeight;
  }

  const respuesta = await askTutor(text, userModel);
  displayTutorMessage(respuesta, userModel.activeProfile, false);
}

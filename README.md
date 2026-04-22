# adaptech

**Sistema de Tutoría Inteligente (ITS) Adaptativo para la enseñanza de Python**

adaptech es un sistema de tutoría inteligente que infiere rasgos psicológicos del estudiante a partir de su comportamiento en el editor de código — sin interrumpirlo con cuestionarios — y adapta dinámicamente los retos, la dificultad y el soporte pedagógico.

Desarrollado como proyecto académico para la asignatura **Sistemas Adaptativos y Modelado de Usuarios** — Universidad Autónoma de Madrid.

---

## ¿Cómo funciona?

El sistema observa en silencio cómo el estudiante escribe y ejecuta código Python. A partir de esas señales infiere 4 rasgos del modelo **Alternative Five** (Zuckerman, 1993) y clasifica al estudiante en uno de 7 perfiles. Según el perfil activo, el sistema adapta el tipo y dificultad del reto, y el tutor genera respuestas pedagógicas personalizadas mediante la API de Gemini.

```
Estudiante escribe código
        ↓
Monaco captura eventos en silencio (onCodeEdit, onCodeRun, onHintRequested)
        ↓
inference.js calcula 4 rasgos → determina perfil activo
        ↓
challenges.js selecciona el reto más apropiado
tutor.js genera respuesta pedagógica vía Gemini API
```

---

## Rasgos inferidos (Alternative Five)

| Rasgo | Código | Métrica |
|-------|--------|---------|
| Actividad | Act | Ejecuciones / tiempo de sesión |
| Impulsividad | ImpSS | Errores de sintaxis / ejecuciones |
| Neuroticismo-Ansiedad | N-Anx | Pausas largas + pistas pedidas |
| Agresión | Agg | Líneas borradas + ejecuciones sin cambio |

> La dimensión de **Sociabilidad** se excluye porque el estudiante trabaja solo — no hay interacción social que medir.

---

## Perfiles de estudiante

| Perfil | Condición | Acción del sistema |
|--------|-----------|-------------------|
| Bloqueado | N-Anx > 0.6 y Agg > 0.55 | Baja nivel + intervención inmediata |
| Impaciente | Act > 0.6, Imp > 0.6, N-Anx > 0.45 | Propone estrategia diferente |
| Ansioso | N-Anx > 0.6 y Agg < 0.3 | Pista empática ante idle > 90s |
| Explorador | Act > 0.6 y Imp > 0.6 | Sube dificultad, reta a reflexionar |
| Desenganchado | Act < 0.3, Agg > 0.3, N-Anx < 0.3 | Cambia formato del reto |
| Perfeccionista | Act < 0.3 y Imp < 0.3 | Anima a experimentar |
| Fluido | Resto de casos | Tutor en silencio |

---

## Estructura del proyecto

```
project_adaptech/
├── index.html          # Interfaz, Monaco Editor, Skulpt y orquestador
├── config.example.js   # Plantilla de configuración (sin API key)
├── userModel.js        # Captura de métricas en tiempo real
├── inference.js        # Cálculo de rasgos y determinación de perfil
├── tutor.js            # Prompts adaptativos y llamada a Gemini API
├── challenges.js       # Banco de 12 retos Python (bajo / medio / alto)
├── style.css           # Estilos de la interfaz
└── README.md
```

---

## Tecnologías

| Tecnología | Uso |
|-----------|-----|
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | Editor VS Code en el navegador — fuente de los eventos de comportamiento |
| [Skulpt 1.2.0](https://skulpt.org/) | Intérprete Python real en el navegador |
| [Gemini API](https://aistudio.google.com/) | Generación de respuestas pedagógicas adaptadas al perfil |
| JavaScript puro | Lógica adaptativa sin frameworks |

---

## Instalación y uso

El sistema no requiere servidor ni instalación de dependencias. Todo corre en el navegador.

**1. Clona el repositorio**
```bash
git clone https://github.com/davidpill47/project_adaptech.git
cd project_adaptech
```

**2. Configura la API key de Gemini**
```bash
cp config.example.js config.js
```
Abre `config.js` y reemplaza `TU_API_KEY_AQUI` con tu key de Gemini.
Puedes obtenerla gratis en [aistudio.google.com](https://aistudio.google.com) → Get API Key.

**3. Abre el sistema**

Abre `index.html` directamente en el navegador. No necesitas servidor local.

> **Nunca subas `config.js` a un repositorio público.** El archivo está en `.gitignore` por defecto.

---

## Banco de retos

12 retos de Python organizados en 3 niveles y 3 formatos. Todos pensados para principiantes — solo variables y `print()`, sin funciones ni clases.

| Nivel | Crear | Completar | Depurar |
|-------|-------|-----------|---------|
| Bajo | Área de habitación | Precio con descuento | Presentación personal |
| Medio | ¿Puede votar? | Par o impar | El mayor de dos |
| Alto | Tabla de multiplicar | Suma 1 al 100 | Contar positivos |

---

## Autor

David Andrés Pillco Yaruqui  
Máster en Sistemas Inteligentes — Universidad Autónoma de Madrid  

---

## Referencias

- Zuckerman, M. et al. (1993). A comparison of three structural models for personality: The Big Three, the Big Five, and the Alternative Five. *Journal of Personality and Social Psychology*, 65(4), 757–768.
- VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. *Educational Psychologist*, 46(4), 197–221.

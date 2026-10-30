# Pulso · Tu diario fitness

Aplicación web adaptable a escritorio y móvil para registrar alimentación, entrenamiento y peso. No necesita instalar dependencias.

[Abrir Pulso en GitHub Pages](https://moravevo.github.io/pulso-fitness/).

## Uso local

```powershell
npm start
```

Abre http://127.0.0.1:4173. Para comprobar la lógica de nutrición, volumen, fechas, tendencias e importación:

```powershell
npm test
npm run check
```

## Incluido

- 53 alimentos en español, extraídos del archivo oficial USDA SR28, con identificador NDB, nombre original y valores por 100 g.
- Registro por gramos y porciones orientativas, favoritos, recientes, alimentos propios, edición, duplicación y repetición del día anterior.
- 68 ejercicios agrupados en empuje, jale, pierna y core, con búsqueda por nombre, equipo, músculo y patrón. Los personalizados también pueden elegir su grupo.
- Ilustraciones SVG originales por movimiento, con 20 dibujos individuales de jale: figuras humanas con volumen, posturas, agarres y equipos diferenciados en el selector, las rutinas y las sesiones.
- Cuatro plantillas y rutinas propias guardadas: crear, editar, ordenar ejercicios, definir series/repeticiones/RIR y reutilizar. También se puede guardar una sesión como rutina; cada sesión nueva reinicia las casillas de series completadas.
- Series, carga, repeticiones, RIR, sensación, historial y progreso por ejercicio.
- Cardio por actividad, ritmo y minutos: caminata, caminadora, trote/carrera, bicicleta, bicicleta estática, elíptica, remo, escaladora, cuerda y otros. Registro, edición e historial desde el celular; kcal activas estimadas o introducidas desde un reloj o máquina.
- Series directas e indirectas por músculo, con desglose de los ejercicios que contribuyen. Un mismo ejercicio puede tener varios músculos directos y secundarios, editables en cada sesión.
- Análisis de series por video para sentadilla (mide la rodilla) y press de banca o inclinado (mide el codo): carga una serie grabada de lado y obtén repeticiones detectadas, ROM por repetición, tiempos de fase excéntrica y concéntrica, recorrido de la barra y velocidad aproximada de subida. Todo se procesa en el navegador; el video no se sube ni se guarda.
- Ventanas de **últimos 7 días móviles** (fecha del diario y los 6 días anteriores) y **semana calendario** (lunes hasta la fecha del diario). No se incluyen registros posteriores a la fecha elegida.
- Volumen con carga calculado como kg × repeticiones de las series completadas. Las series globales se cuentan una sola vez, aunque participen en varios músculos.
- Configuración inicial con edad, estatura, peso, sexo para la ecuación, actividad diaria y objetivo; propone calorías y macros iniciales editables.
- Registro diario de peso, media móvil de siete días, comparación entre semanas y gráficas.
- Exportación e importación JSON con validación.
- Campos de al menos 16 px en móvil para evitar el acercamiento al enfocarlos, viewport limitado a escala 1 y gestos de página sin zoom. Safari y los ajustes de accesibilidad del navegador pueden conservar el zoom manual ([WebKit](https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/)).

## Publicación en GitHub Pages

El workflow `.github/workflows/pages.yml` ejecuta las pruebas y publica únicamente `dist/` mediante GitHub Actions. El sitio funciona en la subruta del repositorio usando rutas relativas y no requiere servidor ni claves. En Settings → Pages, la fuente debe ser **GitHub Actions**.

Los registros del sitio anterior no se trasladan automáticamente: exporta la copia desde el navegador y origen anterior e impórtala en GitHub Pages.

## Criterio de conteo muscular

Cada serie completada suma 1 a cada músculo directo y 1 a cada músculo indirecto asignado, con columnas separadas. El total de participación es la suma de ambas; no equipara el estímulo de una serie directa con una indirecta. La carga no cambia el número de series: las flexiones cuentan aunque se registre 0 kg de carga añadida.

Ejemplo: 3 series de press de banca el lunes, 3 de press de pecho en máquina el miércoles y 3 de flexiones el domingo suman 9 directas de pecho, 9 indirectas de deltoides y 9 indirectas de tríceps. El lunes siguiente, el periodo móvil conserva las 6 series de miércoles y domingo, mientras la semana calendario comienza de nuevo.

Los roles iniciales son una clasificación de registro editable, no una medición individual de activación. Consulta la [biblioteca de movimientos de ACE](https://www.acefitness.org/resources/everyone/exercise-library/). Los registros antiguos conservan sus series y recuperan las asociaciones del catálogo por su ID; “Hombros” se agrupa como “Deltoides”. Los ejercicios personalizados antiguos conservan su músculo principal hasta que se editen sus secundarios.

Cada grupo se despliega para consultar sus músculos o porciones y los ejercicios que aportan series directas e indirectas a cada uno. Deltoides distingue anterior, lateral y posterior; Espalda distingue dorsales, romboides y erectores espinales; Trapecios conserva su propio grupo con porciones superior, media e inferior. Los demás grupos también incluyen detalle anatómico. Una serie puede participar en varios músculos del mismo grupo, pero cuenta una sola vez en el resumen de ese grupo. Por eso las filas del detalle no se suman para reconstruir el total. El conteo no diagnostica fatiga ni sobreentrenamiento y no pondera las indirectas como estímulo equivalente.

`dist/muscle-regions.js` contiene la clasificación orientativa por ejercicio. Se registran participaciones, sin porcentajes de activación ni reparto ficticio de series entre porciones. La referencia general es la biblioteca de ACE; para espalda, véase también su [comparación de ejercicios](https://www.acefitness.org/continuing-education/certified/april-2018/6959/ace-sponsored-research-what-is-the-best-back-exercise/), y para hombros, la [revisión de activación de las tres porciones del deltoides](https://pubmed.ncbi.nlm.nih.gov/39593452/). La activación no constituye una medición de hipertrofia ni de recuperación individual.

El botón de músculos de cada ejercicio permite ajustar el detalle en esa sesión. Las asignaciones se conservan en el campo opcional `muscleRegions`, también al guardar rutinas, repetir sesiones y exportar/importar copias. Los registros antiguos del catálogo recuperan una asignación orientativa por ID respetando los grupos editados; los personalizados y grupos sin asignación concreta aparecen como «Sin especificar». No se infiere una porción a partir del nombre libre del ejercicio.

## Análisis por video

El apartado **Entrenamiento → Análisis por video** acepta el video de una serie grabada con la cámara fija de lado, cuerpo completo en cuadro. Los grupos soportados son la sentadilla y sus variantes (la repetición se mide con el ángulo de rodilla) y el press de banca, inclinado y sus variantes en máquina o mancuernas (se mide el ángulo de codo). Cada ejercicio elegido indica su grupo. La app procesa los fotogramas en el navegador con [MediaPipe Pose Landmarker](https://developers.google.com/mediapipe) (Apache 2.0, servido desde la propia aplicación: ~20 MB de modelos la primera vez) y estima repeticiones, ROM por repetición, tiempos de bajada y subida, pausa en el fondo, recorrido de la barra y velocidad media de subida.

Durante el análisis y en los resultados puedes ver el video con el mapeo del cuerpo y el recorrido de la barra (muñecas) dibujados encima; esa vista vive en memoria durante la sesión, no se guarda con el registro.

Estas medidas son estimaciones de registro a partir de la posición detectada del cuerpo: no evalúan la técnica, no detectan la carga (regístrala tú en la serie) y no constituyen un diagnóstico ni sustituyen la guía de un profesional. El conteo puede fallar con oclusiones, ropa holgada, cambios de cámara o encuadres parciales; la visibilidad del cuerpo se muestra con cada análisis.

El video elegido nunca sale del dispositivo: se decodifica localmente y no se guarda. Solo se conservan las medidas compactas en el campo opcional `videoAnalyses`, incluido en las copias JSON con validación; las copias anteriores que no lo contienen siguen funcionando. La velocidad en cm/s usa la estatura del perfil como referencia de escala; sin estatura se muestran unidades relativas del video.

## Datos y límites

El apartado **Entrenamiento → Cardio** muestra minutos, kcal activas y registros del periodo elegido. También se puede registrar desde la tarjeta de energía en Resumen o Alimentación. Todo el cardio guardado aumenta siempre el objetivo alimentario de su propia fecha: **objetivo base + kcal activas de cardio**. La comida consumida, los objetivos de macros y las series de fuerza conservan sus valores. Editar, mover de fecha o eliminar un cardio actualiza los totales correspondientes. Los días con cardio también cuentan como días de movimiento.

Las estimaciones usan los MET del [Compendio de Actividades Físicas 2024](https://pacompendium.com/), con referencias específicas de [caminata y caminadora](https://pacompendium.com/walking/), [carrera](https://pacompendium.com/running/), [bicicleta](https://pacompendium.com/bicycling/) y [aparatos y cuerda](https://pacompendium.com/conditioning-exercise/). Como 1 MET equivale aproximadamente a 1 kcal/kg/hora, se estiman kcal **activas** mediante `(MET − 1) × peso en kg × minutos / 60`, redondeadas al entero. Se descuenta el reposo de ese tiempo; no es una medición individual. La estimación está disponible con un perfil de 19 a 59 años; otras edades, actividades o intensidades pueden usar kcal activas introducidas. No usar la estimación durante embarazo o lactancia. Confirma que tu dispositivo informa calorías activas y no gasto total.

El peso sugerido usa el último pesaje hasta la fecha del cardio, o el peso del perfil si no hay pesajes anteriores; nunca usa el peso objetivo. El peso confirmado y las kcal se conservan en el registro, de modo que nuevos pesajes no recalculan el historial. El campo opcional `cardio` se incluye en las copias JSON con validación; las copias anteriores que no lo contienen siguen funcionando. Los IDs de intensidad conservan sus MET para mantener la interpretación de los registros históricos.

El mantenimiento inicial ya utiliza un factor de actividad. Sumar cardio que ya estuviera incluido en ese factor puede contarlo dos veces, incluso al usar kcal activas. La interfaz muestra la base y el aporte de cardio por separado y permite revisar la base en Mis objetivos; no la modifica automáticamente. El déficit o superávit indicado sigue siendo el del plan base, no un balance energético medido.

El cronómetro de descanso comienza al confirmar las repeticiones de una serie nueva en una sesión en curso. Se muestra en una barra compacta, situada encima de la navegación inferior en celular, con el ejercicio y el número de serie. Tocar el nombre vuelve a esa serie; el botón de cierre detiene el cronómetro. Una nueva serie lo reinicia y finalizar la sesión lo detiene. Corregir reps, carga o RIR de una serie ya registrada no cambia su inicio. Las series antiguas y las sesiones finalizadas no reciben una hora ficticia al editarse.

La hora de registro se conserva en `recordedAt` de la serie y la referencia activa en el campo opcional `restTimer`. El tiempo se calcula desde esa hora, por lo que se recupera al cambiar de app, recargar o volver a abrir Pulso en el mismo navegador y origen, mientras se conserven sus datos. La actualización visual se suspende cuando la página está oculta. No incluye alarma ni notificación en segundo plano; depende del reloj del dispositivo. Las copias anteriores siguen siendo compatibles y las series copiadas a una rutina o sesión nueva comienzan sin hora de registro.

La aplicación inicia con los registros vacíos. La demo se puede cargar manualmente desde Mis objetivos. Si el navegador aún conserva la demo anterior, sus datos de ejemplo se eliminan y aparece la configuración inicial. Los registros propios de versiones anteriores se conservan mientras se completa esa configuración.

La primera visita solicita los datos necesarios para estimar objetivos. Los diarios de alimentos, entrenamientos y peso empiezan vacíos. Se usa Mifflin–St Jeor y un factor de actividad para proponer mantenimiento; perder o ganar peso ajusta esa referencia en 10%. Los macros se inicializan con una distribución editable de 25% proteínas, 45% carbohidratos y 30% grasas. Son puntos de partida, no una medición del gasto ni una recomendación clínica. La ecuación y el planificador de NIDDK están orientados a adultos; no uses esta estimación durante embarazo o lactancia. [Fuente de la ecuación](https://pubmed.ncbi.nlm.nih.gov/2305711/) · [NIDDK Body Weight Planner](https://www.niddk.nih.gov/bwp%20).

Los registros personales y el perfil se guardan en `localStorage` del navegador. Esta versión no incluye cuentas, sincronización entre dispositivos, base de marcas, escaneo de códigos de barras ni aplicación nativa. El JSON exportado permite mover los datos entre navegadores. Si se borran los datos del navegador, se necesita una copia para recuperarlos. Los archivos publicados no contienen registros personales. Los perfiles y registros propios creados con versiones anteriores se conservan; se pide completar el nuevo perfil inicial una sola vez.

Las medias nutricionales omiten días sin registros y pueden incluir días incompletos. Las series de ejercicios con peso corporal reflejan únicamente la carga añadida en el volumen. El déficit mostrado es el planificado a partir de las calorías y mantenimiento configurados; no es una medición del gasto energético.

## Fuente de alimentos

[USDA National Nutrient Database for Standard Reference, Release 28 (2016), archivo abreviado oficial](https://www.ars.usda.gov/ARSUserFiles/80400525/Data/SR/SR28/dnload/sr28abbr.zip).

`dist/foods.json` contiene la selección extraída, sin dependencias de servicios externos. Para regenerarla, extrae `ABBREV.txt` del archivo oficial dentro de `data/usda/` y ejecuta `node data/build-foods.mjs`. Los nombres de alimentos se han traducido; los nutrientes se conservan del registro original. Las medidas domésticas son orientativas.

## Estructura

- `dist/`: aplicación publicable, sin compilación.
- `dist/core.js`: cálculos puros y validación de copias.
- `dist/cardio.js`: catálogo con MET de referencia, kcal activas, peso por fecha y objetivo diario con cardio.
- `dist/kinematics.js`: geometría y segmentación de repeticiones sobre landmarks; funciones puras sin DOM.
- `dist/video-analyzer.js`: carga diferida de MediaPipe y recorrido de fotogramas del video en el navegador.
- `dist/vendor/mediapipe/`: paquete vendido de MediaPipe Tasks Vision y el modelo de pose (Apache 2.0).
- `prototype/`: prototipo aislado con el que se validó el pipeline; su `fixture.json` alimenta los pruebas del motor.
- `dist/app.js`: interfaz, persistencia y flujos de registro.
- `dist/exercise-visuals.js`: clasificación de patrones y dibujos SVG por movimiento.
- `dist/pull-illustrations.js`: ilustraciones vectoriales de los 20 ejercicios de jale.
- `data/build-foods.mjs`: extracción reproducible de la selección USDA.
- `tests/core.test.mjs`: verificaciones con el ejecutor nativo de Node.js.
- `.openai/hosting.json`: configuración conservada del alojamiento anterior en Sites; GitHub Pages publica `dist/` con su propio workflow.

La tipografía se sirve desde Google Fonts, con fuentes de sistema como alternativa. Los registros no se envían a Google ni al servidor de alojamiento.

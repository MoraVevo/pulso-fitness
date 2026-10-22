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
- Series directas e indirectas por músculo, con desglose de los ejercicios que contribuyen. Un mismo ejercicio puede tener varios músculos directos y secundarios, editables en cada sesión.
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

## Datos y límites

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
- `dist/app.js`: interfaz, persistencia y flujos de registro.
- `dist/exercise-visuals.js`: clasificación de patrones y dibujos SVG por movimiento.
- `dist/pull-illustrations.js`: ilustraciones vectoriales de los 20 ejercicios de jale.
- `data/build-foods.mjs`: extracción reproducible de la selección USDA.
- `tests/core.test.mjs`: verificaciones con el ejecutor nativo de Node.js.
- `.openai/hosting.json`: configuración conservada del alojamiento anterior en Sites; GitHub Pages publica `dist/` con su propio workflow.

La tipografía se sirve desde Google Fonts, con fuentes de sistema como alternativa. Los registros no se envían a Google ni al servidor de alojamiento.

# Pulso · Tu diario fitness

Aplicación web adaptable a escritorio y móvil para registrar alimentación, entrenamiento y peso. No necesita instalar dependencias.

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
- 27 ejercicios, cuatro rutinas editables, ejercicios personalizados, series, carga, repeticiones, RIR y sensación de la sesión.
- Volumen calculado como kg × repeticiones de las series completadas; series por músculo principal, historial y progreso por ejercicio.
- Objetivos de calorías, macros, mantenimiento estimado, peso y frecuencia de entrenamiento.
- Registro diario de peso, media móvil de siete días, comparación entre semanas y gráficas.
- Exportación e importación JSON con validación.

## Datos y límites

La primera visita muestra una demo claramente identificada. “Empezar mis registros” permite configurar objetivos y eliminar los datos de ejemplo. Las cifras iniciales de los objetivos son ejemplos editables.

Los registros personales se guardan en `localStorage` del navegador. Esta versión no incluye cuentas, sincronización entre dispositivos, base de marcas, escaneo de códigos de barras ni aplicación nativa. El JSON exportado permite mover los datos entre navegadores. Si se borran los datos del navegador, se necesita una copia para recuperarlos. Los archivos publicados no contienen registros personales.

Las medias nutricionales omiten días sin registros y pueden incluir días incompletos. Las series de ejercicios con peso corporal reflejan únicamente la carga añadida en el volumen. El déficit mostrado es el planificado a partir de las calorías y mantenimiento configurados; no es una medición del gasto energético.

## Fuente de alimentos

[USDA National Nutrient Database for Standard Reference, Release 28 (2016), archivo abreviado oficial](https://www.ars.usda.gov/ARSUserFiles/80400525/Data/SR/SR28/dnload/sr28abbr.zip).

`dist/foods.json` contiene la selección extraída, sin dependencias de servicios externos. Para regenerarla, extrae `ABBREV.txt` del archivo oficial dentro de `data/usda/` y ejecuta `node data/build-foods.mjs`. Los nombres de alimentos se han traducido; los nutrientes se conservan del registro original. Las medidas domésticas son orientativas.

## Estructura

- `dist/`: aplicación publicable, sin compilación.
- `dist/core.js`: cálculos puros y validación de copias.
- `dist/app.js`: interfaz, persistencia y flujos de registro.
- `data/build-foods.mjs`: extracción reproducible de la selección USDA.
- `tests/core.test.mjs`: verificaciones con el ejecutor nativo de Node.js.
- `.openai/hosting.json`: identidad y configuración privada de Sites.

La tipografía se sirve desde Google Fonts, con fuentes de sistema como alternativa. Los registros no se envían a Google ni al servidor de alojamiento.

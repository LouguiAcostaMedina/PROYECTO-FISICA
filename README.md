# FluxLab — Laboratorio interactivo de Física II

Aplicación web adaptable para explorar electricidad y magnetismo mediante cálculos y visualizaciones 2D/3D. Implementa los módulos solicitados en el documento de producto final.

## Módulos

- **Campo eléctrico:** hasta 10 cargas puntuales, líneas de campo, curvas equipotenciales y potencial/campo en un punto editable.
- **Capacitores:** placas paralelas en 3D, área, distancia, dieléctrico, voltaje, capacitancia, carga y energía.
- **Circuitos:** tres resistencias en serie, paralelo o red mixta `R1 + (R2 || R3)`; voltaje, corriente y potencia por elemento; gráfica de ley de Ohm.
- **Campo magnético:** líneas cualitativas de un imán, campo de un conductor largo y cálculo según corriente/distancia.
- **Fuerza de Lorentz:** trayectoria en campos E y B uniformes mediante integración RK4, con exportación CSV.
- **Referencia:** resistividad de metales, permitividad de dieléctricos, constantes y fórmulas.
- **Guía web:** instrucciones de uso, fundamentos, arquitectura, algoritmos y límites del modelo.

## Desarrollo

```bash
npm install
npm run dev
```

Construcción de producción: `npm run build`. El contenido estático queda en `dist/`.

## Arquitectura y unidades

React gestiona la interfaz. React Three Fiber y Three.js renderizan las escenas 3D; SVG representa las visualizaciones 2D. Los cálculos se concentran en `src/physics.js` y convierten las entradas a unidades SI. Las cargas se introducen en nC; las coordenadas espaciales, en cm; la separación del capacitor, en mm; el campo magnético de Lorentz, en mT; y el tiempo de trayectoria, en µs.

Las líneas de campo siguen la dirección local del vector eléctrico. Las curvas equipotenciales se aproximan en una malla por interpolación lineal. La trayectoria integra la ecuación de Lorentz con Runge–Kutta de cuarto orden. Los modelos son ideales: no incluyen efectos de borde, temperatura, pérdidas ni relatividad. Las líneas del imán son ilustrativas; el cálculo cuantitativo magnético corresponde al conductor largo.

## Verificación

`node tests/physics.test.js` comprueba identidades físicas representativas de los módulos numéricos.

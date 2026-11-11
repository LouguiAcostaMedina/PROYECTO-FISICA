# FluxLab — Laboratorio interactivo de Física II

Aplicación web adaptable para explorar electricidad y magnetismo mediante cálculos y visualizaciones 2D/3D. Implementa los módulos solicitados en el documento de producto final.

**Web oficial:** https://proyecto-fisica-livid.vercel.app/

## Módulos

- **Campo eléctrico:** hasta 10 cargas puntuales, líneas de campo, curvas equipotenciales 2D, superficies equipotenciales 3D y potencial/campo en un punto editable.
- **Capacitores:** placas paralelas en 3D, área, distancia, dieléctrico, voltaje, capacitancia, carga y energía.
- **Circuitos:** tres resistencias en serie, paralelo o red mixta `R1 + (R2 || R3)`; voltaje, corriente y potencia por elemento; gráfica de ley de Ohm y transitorios RC de carga/descarga.
- **Campo magnético:** líneas cualitativas de un imán, campo de un conductor largo y valor axial de un dipolo magnético ideal.
- **Fuerza de Lorentz:** trayectoria 3D en campos E y B uniformes mediante integración RK4, con exportación CSV.
- **Modelo microscópico:** movimiento animado de electrones y referencia de protones y neutrones en cada simulación.
- **Configuraciones:** guardado local, recuperación y enlace compartible de un experimento completo.
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

Las líneas de campo siguen la dirección local del vector eléctrico. Las curvas equipotenciales se aproximan en una malla por interpolación lineal. Las superficies 3D se extraen de un volumen mediante tetraedros. La trayectoria integra la ecuación de Lorentz con Runge–Kutta de cuarto orden. Los modelos son ideales: no incluyen efectos de borde, temperatura, componentes no lineales, nodos arbitrarios, saturación magnética ni relatividad. Las líneas del imán son ilustrativas; los valores cuantitativos corresponden al conductor largo o al eje del dipolo ideal.

## Verificación

`npm test` comprueba identidades físicas representativas, incluidos el punto de una constante de tiempo RC, el dipolo ideal y el movimiento rectilíneo 3D.

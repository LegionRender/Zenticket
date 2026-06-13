# ZenTicket Master Design Prompt & Guidelines (Prompt Maestro)

Este archivo sirve como regla global de sistema y memoria permanente para la inteligencia artificial. Define el sistema visual, estructural y funcional unificado de la aplicación móvil ZenTicket.

---

## 🎨 Principio de Diseño Unificado

Diseña y unifica todas las secciones de la app móvil ZenTicket bajo un único sistema visual, estructural y funcional. Todas las pantallas deben sentirse parte de la misma aplicación; no diseñar cada sección como una interfaz independiente. Mantener continuidad estricta en:
- Color, Degradados y Sombras suaves para dar profundidad.
- Tipografía y Jerarquía tipográfica.
- Encabezados consistentes.
- Navegación inferior simétrica y unificada.
- Tarjetas (radios de borde, paddings, sombras y bordes tenues).
- Espaciados (márgenes consistentes).
- Iconografía (iconos elegantes de la misma familia, importados exclusivamente de `lucide-react`).
- Estados, Badges, Botones y Gráficas unificadas.
- Arquitectura de layout de cada pantalla.

La aplicación debe verse moderna, tecnológica, clara, editorial, minimalista y premium, con estética fintech/SaaS.
**No usar morado.** No usar fondos recargados. No saturar la interfaz. No intentar mostrar toda la información en una sola vista.

---

## 🎯 Objetivo de Consistencia

Crear un sistema de diseño coherente donde:
1. Solo cambie el contenido de cada sección.
2. La estructura general permanezca estable.
3. El usuario reconozca inmediatamente que sigue dentro de ZenTicket.
4. Las acciones principales sean visibles.
5. Los datos importantes tengan prioridad.
6. La información secundaria aparezca bajo demanda.
7. Las pantallas mantengan una narrativa vertical clara.
8. La navegación tenga siempre exactamente el mismo comportamiento.

---

## 🎨 Paleta Global de Color y Estados

Usar una paleta fija y funcional. Cada color debe tener una función clara (no usar color como decoración arbitraria):

- **AZUL PROFUNDO/REAL (Ej: `#01144F` a `#0B3EE4`)**:
  - **Uso**: Encabezados con degradados fluidos (`bg-gradient-to-b from-[#0B3EE4] via-[#05229C] to-[#01144F]`), fondos principales de sección, tarjetas destacadas, secciones de alta jerarquía y pantallas de escaneo.
- **AZUL ELÉCTRICO (Ej: `#0B53F4`)**:
  - **Uso**: Botones principales, estado activo en barra de navegación inferior, enlaces, indicadores de progreso, datos destacados del dashboard e iconos seleccionados.
- **AZUL CLARO / CELESTE SUAVE (Ej: `#EBF1FF`, `#D7E4FF`)**:
  - **Uso**: Fondos auxiliares, estados informativos, contenedores secundarios, resaltados suaves e iconos descriptivos de fondo.
- **BLANCO (`#FFFFFF`)**:
  - **Uso**: Tarjetas, formularios, listas e interfaces del contenedor inferior del plano.
- **GRIS MUY CLARO (`#F4F7FC`)**:
  - **Uso**: Fondo de pantalla general de la aplicación, separación entre módulos, áreas de descanso visual.
- **GRIS AZULADO / SLATE DESATURADO (`#94A3B8`, `#64748B`, `#475569`)**:
  - **Uso**: Textos secundarios, descripciones, iconos inactivos de la barra de navegación, separadores/divisores y etiquetas neutrales.

### Estados Semánticos Estrictos
- **VERDE (Exclusivo)**: Activo, Completado, Facturado, Validado, Conectado, Variaciones positivas.
- **NARANJA (Exclusivo)**: Pendiente, En revisión, Advertencia, Proceso incompleto.
- **ROJO (Exclusivo)**: Error, Fallido, Sin factura, Acciones destructivas (Eliminar cuenta, Cerrar sesión), Variaciones negativas.

---

## 🏗️ Arquitectura Base de Todas las Pantallas

Todas las pantallas deben compartir la siguiente estructura vertical estable:
1. **StatusBar**: Margen o indicador de batería/red sutil de dispositivo.
2. **Encabezado Azul (Firma ZenTicket)**:
   - Conserva la misma altura base, márgenes de `px-5`, tratamiento de sombra y una transición elegante mediante radios de borde inferiores de `rounded-b-[40px]`.
   - Fila de Identidad Superior compacta: Avatar pequeño de usuario e Imagotipo de ZenTicket a la izquierda; campana de notificaciones translúcida y alertas en el extremo derecho.
   - Títulos de sección dominantes y descriptivos. Mismo tamaño, peso, interlineado y alineación.
   - Bloque de Métricas/Datos Superiores Destacados (Máximo dos por sección, representados en un formato grande de alta visibilidad).
3. **Contenedor Inferior de Plano**:
   - Transición visual del fondo azul del encabezado al fondo gris/blanco inferior de la sección.
   - Tarjetas principales superpuestas levemente en la costura de ambos planos para dar profundidad de capas y sensación tridimensional sutil.
   - Listas o detalles de contenido interactivos.
4. **Navegación Inferior Fija (Symmetrical Bottom Layout)**:
   - Botón circular flotante de "Escanear / Cámara" en azul eléctrico sobresaliendo e integrado simétricamente entre los accesos laterales.

---

## 💳 Sistema de Tarjetas (Cuatro Jerarquías)

Para estructurar los planos, utilizar un sistema de tarjetas consistentes con fondo blanco, padding generoso, sombra tenue, bordes sutiles y esquinas redondeadas:
1. **TARJETA HERO**: Para total de gastos, planes activos o resúmenes ejecutivos. Alta visibilidad, datos dominantes y botones de acción unificados.
2. **TARJETA SECUNDARIA**: Para gráficas de tendencia/barras, resúmenes de uso o estados de tickets globales.
3. **TARJETA COMPACTA**: Para categorías/bento grid de accesos rápidos, indicadores y métricas flotantes.
4. **FILA INTERACTIVA**: Para listados de tickets, movimientos recientes, opciones de configuración, seguridad e integraciones (con un icono a la izquierda, textos principales/secundarios apilados a la mitad, y monto, badge de estado o un sutil chevron apuntando a la derecha).

---

## 👥 Acceso de Administrador Exclusivo
- Mantener validaciones restrictivas para la consola de administración (`currentUserEmail === "legionrender@gmail.com"`).
- Para el usuario administrador, habilitar integraciones adicionales, la visualización del botón "Admin" en la barra de navegación simétrica, y los accesos rápidos a la base de datos de auditoría global.

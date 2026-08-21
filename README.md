# ⚽ Generador de Informes Arbitrales Reglamentarios

Aplicación web ligera, rápida y 100% del lado del cliente para la confección, cálculo de horarios y generación de informes oficiales de partidos de fútbol en formato imprimible o PDF.

---

## 🌟 Características Principales

- **🎨 Encabezado y Logos 100% Personalizables:**
  - Permite cargar hasta 3 logos institucionales (ej. AFA, Liga Local, Consejo Federal).
  - Título institucional editable con diseño reglamentario centrado.
  - Los logos y el título se guardan automáticamente en el navegador (`localStorage`) para no tener que cargarlos en cada informe.
- **⏱️ División y Duración Personalizables:**
  - Permite ingresar libremente cualquier categoría o división (*Primera División, Reserva, Sub-21, Sub-17, Femenino, etc.*).
  - Permite configurar los **minutos por tiempo** (ej. 45, 40, 35, 30 min) y calcula automáticamente los horarios exactos del 1er tiempo, descanso y 2do tiempo junto con los minutos adicionales.
- **📋 Gestión Disciplinaria Dinámica:**
  - Registro ágil de jugadores **expulsados** (minuto, dorsal, nombre, DNI, club, motivo y relato de la jugada).
  - Registro de jugadores **amonestados** (DNI, dorsal, nombre y club).
  - Generación automática de la narrativa reglamentaria oficial y tablas de incidencias.
- **✍️ Firma Digital y DNI del Árbitro:**
  - Registro del **DNI del árbitro** que se imprime en el pie del informe junto a la aclaración de nombre.
  - Opción de **subir una imagen de la firma** del árbitro para estamparla digitalmente sobre la línea reglamentaria.
  - Si no se carga imagen, se genera la línea con el espacio correspondiente para la firma manuscrita tradicional.
  - El nombre, DNI y firma se guardan en el navegador (`localStorage`) para futuros partidos.
- **🖨️ Formato de Impresión y PDF Oficial con Nombre Automático:**
  - Al guardar como PDF, el archivo se nombra automáticamente con el formato oficial: `[Club Local] vs [Club Visitante] - [División].pdf`.
  - Estilos CSS `@media print` diseñados específicamente para hojas de informe A4 con tipografía formal, firmas y márgenes limpios.
- **📱 100% Offline y Mobile Friendly:**
  - No requiere servidor, base de datos ni conexión a internet.
  - Funciona fluidamente en computadoras y en teléfonos móviles (Android e iOS).

---

## 📁 Estructura del Proyecto

```
pantallaInforme/
├── index.html           # Estructura semántica del formulario y visor de informe PWA
├── styles.css           # Estilos visuales, diseño responsive mobile y reglas de impresión
├── app.js               # Lógica de cálculo, persistencia en localStorage y Web Share API
├── sw.js                # Service Worker (motor de caché para funcionamiento 100% offline)
├── manifest.webmanifest # Manifiesto de instalación PWA para Android e iOS
├── favicon.svg          # Favicon e icono vectorial de la aplicación
├── icons/               # Iconos de la aplicación en alta resolución para móviles
├── app/                 # Carpeta complementaria con la versión app
└── README.md            # Documentación del proyecto
```

---

## 🚀 Cómo Usarlo

### 1. Uso Local en Computadora
Simplemente haz doble clic sobre el archivo `index.html` o ábrelo con cualquier navegador (Chrome, Firefox, Brave, Edge).

### 2. Uso en Celulares (Android / iOS)
1. Copia los archivos a tu teléfono o ábrelos a través de un enlace de **GitHub Pages**.
2. En el navegador móvil (ej. Google Chrome), pulsa el menú de opciones **(⋮)** y selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
3. Tendrás un acceso directo en tu pantalla de inicio que funcionará como una aplicación nativa.
4. Al generar el informe, pulsa **"Imprimir / Guardar PDF"** y selecciona la opción **"Guardar como PDF"**.

---

## 🌐 Despliegue Gratuito en GitHub Pages

1. Crea un repositorio en [GitHub](https://github.com) y sube los archivos `index.html`, `styles.css` y `app.js`.
2. Ve a la pestaña **Settings > Pages** de tu repositorio.
3. En **Branch**, selecciona `main` (o `master`), carpeta `/(root)` y haz clic en **Save**.
4. En pocos segundos tendrás una URL pública y segura (HTTPS) lista para compartir o usar desde cualquier dispositivo.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Marcado semántico y accesible.
- **CSS3:** Flexbox, CSS Grid y reglas de impresión optimizadas (`@media print`).
- **JavaScript Vanilla (ES6+):** Manipulación del DOM, API `FileReader` para procesamiento de imágenes y API `localStorage` para almacenamiento local.

---

## 📄 Licencia

Este proyecto es de uso libre y gratuito para árbitros, colegios arbitrales, ligas regionales y asociaciones de fútbol.


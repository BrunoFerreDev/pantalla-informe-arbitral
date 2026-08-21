# ⚽ Informe Arbitral — Aplicación Móvil PWA (100% Offline)

Versión móvil progresiva (PWA) de la aplicación para árbitros de fútbol. Diseñada para funcionar **completamente sin conexión a internet ni datos móviles** en campos deportivos o zonas sin señal, con instalación en la pantalla de inicio de teléfonos Android e iOS (iPhone/iPad).

---

## 🌟 Características de la App Móvil

- **⚡ 100% Offline (Service Worker Cache-First):**
  - Todo el código, diseño, íconos y fuentes se guardan en la memoria interna del teléfono.
  - Funciona con Modo Avión activado o en zonas rurales sin cobertura celular.
- **📱 Instalable en Teléfonos (PWA):**
  - **Android (Chrome, Samsung Internet, Edge):** Muestra el botón *"Instalar App"* y se integra como app nativa con ícono propio y pantalla completa (sin barra de navegador).
  - **iPhone / iPad (Safari):** Compatible mediante *"Agregar a pantalla de inicio"*.
- **💾 Auto-Guardado de Borradores:**
  - Guarda automáticamente los datos del partido que estás cargando en tiempo real en la memoria interna del teléfono.
  - Si la pantalla del teléfono se apaga o la app se cierra, al volver a abrirla los datos siguen ahí.
  - Botón de *"🔄 Nuevo Partido"* para iniciar un acta limpia sin borrar tus logos ni tus datos de árbitro.
- **📲 Compartir por WhatsApp y Redes (Web Share API):**
  - Botón para enviar un resumen ejecutivo reglamentario directamente por **WhatsApp**, Telegram o Correo electrónico con un solo toque.
  - Botón para copiar el resumen al portapapeles.
- **🖨️ PDF Reglamentario con Nombre Automático:**
  - Al generar el informe y pulsar *"Imprimir / Guardar PDF"*, se nombra automáticamente como `[Club Local] vs [Club Visitante] - [División].pdf`.
- **⌨️ Teclados Numéricos Automáticos en Celular:**
  - Configurado con `inputmode="numeric"` para que en minutos, dorsales, goles y DNI el teléfono abra el teclado numérico de forma ágil.

---

## 📁 Estructura de la Carpeta `app/`

```
pantallaInforme/app/
├── index.html              # Estructura semántica PWA con meta tags para móviles
├── styles.css              # Estilos responsive mobile-first y reglas de impresión
├── app.js                  # Lógica del formulario, Service Worker, Web Share y auto-guardado
├── sw.js                   # Service Worker (Cache-First offline engine)
├── manifest.webmanifest    # Manifiesto de instalación de la PWA
├── favicon.svg             # Ícono vectorial oficial
├── icons/                  # Íconos PNG para Android e iOS
│   ├── icon-192.png        # Ícono HD estándar (192x192)
│   ├── icon-512.png        # Ícono HD pantalla completa (512x512)
│   ├── icon-maskable-512.png # Ícono adaptable para Android
│   └── apple-touch-icon.png  # Ícono oficial para iOS Apple (180x180)
└── README.md               # Esta documentación
```

---

## 🚀 Cómo Usarla e Instalarla

### Opción A: Despliegue en GitHub Pages (Recomendado para tenerla en tu teléfono)

Los Service Workers requieren HTTPS (conexión segura) para instalarse en teléfonos. GitHub Pages ofrece HTTPS gratis:

1. Sube el proyecto a tu repositorio de GitHub.
2. En tu repositorio, ve a **Settings > Pages**.
3. En **Branch**, selecciona tu rama principal y en carpeta selecciona `/app` (o la raíz si mueves el contenido).
4. Guarda los cambios. En 1 minuto tendrás una dirección como `https://tuusuario.github.io/pantallaInforme/app/`.
5. Abre esa dirección en el navegador de tu celular (Google Chrome en Android o Safari en iPhone).
6. Toca **"Instalar App"** o **"Agregar a inicio"**.
7. **¡Listo!** Ya puedes apagar el WiFi y los datos móviles: la app funcionará siempre.

### Opción B: Probar localmente en tu computadora con un servidor local

Si quieres probar la PWA localmente antes de subirla:
```bash
# Con Node.js (npx)
npx serve app

# O con Python 3
python3 -m http.server 8080 --directory app
```
Luego abre `http://localhost:8080` en tu navegador.


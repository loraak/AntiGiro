
# ⚛️ AntiGiro (React Client)

**AntiGiro** es una aplicación web moderna desarrollada con **React 19**. Este proyecto integra capacidades de aprendizaje automático en el navegador y visualización de datos dinámica.

---

## 🛠 Tecnologías Utilizadas

El proyecto ha sido construido utilizando las siguientes librerías y herramientas clave:

* **Core:** [React 19](https://react.dev/) & [React Router DOM](https://reactrouter.com/).
* **Machine Learning:** [TensorFlow.js](https://www.tensorflow.org/js) (`@tensorflow/tfjs`) para procesamiento de ML en el cliente.
* **Visualización de Datos:**
    * [Chart.js](https://www.chartjs.org/) con `react-chartjs-2`.
    * [Recharts](https://recharts.org/).
* **Interfaz & UI:**
    * [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/).
    * [SweetAlert2](https://sweetalert2.github.io/) para notificaciones modales.
* **Utilidades:** [Axios](https://axios-http.com/) para peticiones HTTP y `es-toolkit`.

---

## 📋 Requisitos Previos

Para ejecutar y construir este proyecto necesitas:

1.  **Node.js** (v18 o superior recomendado) y **npm**.
2.  **XAMPP** (u otro servidor web Apache) para el despliegue local de la versión de producción.

---

## 💻 Instalación y Desarrollo (Modo Dev)

Si quieres editar el código o probarlo en el servidor de desarrollo de React:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/loraak/AntiGiro.git](https://github.com/loraak/AntiGiro.git)
    cd AntiGiro
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo:**
    ```bash
    npm start
    ```
    La aplicación se abrirá en [http://localhost:3000](http://localhost:3000).

---

## 🚀 Despliegue en Local con XAMPP

Para desplegar la aplicación final en tu servidor Apache (XAMPP), sigue estos pasos:

### 1. Generar la Build de Producción
En tu terminal, dentro de la carpeta del proyecto, ejecuta:

```bash
npm run build
````

Esto creará una carpeta llamada `build` en la raíz de tu proyecto con los archivos estáticos optimizados.

### 2\. Mover archivos a XAMPP

1.  Ve a tu carpeta de instalación de XAMPP (usualmente `C:\xampp\htdocs`).
2.  Crea una carpeta para tu proyecto, por ejemplo: `antigiro`.
3.  Copia **todo el contenido** de la carpeta `build` (que generaste en el paso 1) y pégalo dentro de `C:\xampp\htdocs\antigiro`.

### 3\. Configurar Apache (Importante para React Router)

Si la aplicación usa rutas (navegación), al recargar la página en XAMPP podrías recibir un error 404. Para solucionar esto:

1.  Crea un archivo nuevo dentro de `C:\xampp\htdocs\antigiro` llamado `.htaccess`.
2.  Pega el siguiente contenido dentro:

<!-- end list -->

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /antigiro/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /antigiro/index.html [L]
</IfModule>
```

*(Nota: Si pones los archivos directamente en la raíz de htdocs y no en una subcarpeta, cambia `/antigiro/` por `/` en las líneas de RewriteBase y RewriteRule).*

### 4\. Acceder

Abre tu navegador y visita:
[http://localhost/antigiro](https://www.google.com/search?q=http://localhost/antigiro)

-----

## 📜 Scripts Disponibles

  * `npm start`: Inicia el entorno de desarrollo.
  * `npm run build`: Compila la app para producción en la carpeta `build`.
  * `npm test`: Ejecuta los tests unitarios.

-----

## 📄 Licencia

Este proyecto es privado y propietario.

```

### Un consejo extra para React Router + XAMPP
El paso del archivo **`.htaccess`** es vital. Como React es una "Single Page Application" (SPA), Apache no sabe que la ruta `/dashboard` (por ejemplo) es manejada por React y no es una carpeta real. El código que te puse en el README redirige todo al `index.html` para que React tome el control.

**¿Te gustaría que te genere también el archivo `.htaccess` listo para descargar o copiar?**
```

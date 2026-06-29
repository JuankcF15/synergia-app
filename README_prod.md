
# Synergia - Manual de Despliegue y Operaciones en Producción

Este documento contiene las instrucciones necesarias para la administración, compilación y despliegue de la aplicación Synergia en el entorno de producción. La aplicación está estructurada para operar de manera aislada bajo la subruta `/synergia/` del dominio principal.

## Despliegue del Frontend

El frontend está desarrollado en React y se sirve como contenido estático a través del servidor web. Se ha automatizado el proceso de producción y transferencia de archivos mediante un script unificado en el archivo de configuración de dependencias.

### Ejecución del Despliegue

Para compilar la última versión del código y actualizar los archivos en el servidor web de forma automática, ejecute el siguiente comando desde el directorio raíz del frontend:

```bash
npm run deploy

```

### Detalles del Script

El comando ejecuta de forma secuencial las siguientes acciones:

1. Compilación del proyecto (`npm run build`) para generar los elementos optimizados de producción.
2. Limpieza del directorio de distribución del servidor web correspondiente a la subruta (`/var/www/html/synergia/*`).
3. Transferencia de los nuevos archivos estáticos generados al directorio de destino del servidor web.

El uso de operadores lógicos encadenados asegura que si la compilación falla debido a un error de sintaxis o empaquetado en el código, el directorio de producción no se modificará, garantizando la continuidad y disponibilidad de la versión estable anterior.

## Gestión del Backend

El backend está desarrollado en Django y es administrado en producción a través del gestor de servicios del sistema operativo.

### Reinicio del Servicio

Cada vez que se realicen modificaciones en los archivos de la API (vistas, modelos, comandos de gestión o configuraciones), es necesario reiniciar el servicio para que el servidor de aplicaciones web lea los cambios:

```bash
systemctl restart synergia-backend.service

```

### Verificación del Estado

Para comprobar que el servicio se encuentra activo y operando correctamente tras una actualización, utilice el comando de estado:

```bash
systemctl status synergia-backend.service

```

## Consideraciones de Enrutamiento y Subrutas

Debido a que la aplicación coexiste con otras plataformas en el mismo dominio bajo un subdirectorio, se deben observar las siguientes pautas de desarrollo y mantenimiento:

1. El enrutador de React tiene configurado un parámetro de base (`basename`) coincidente con la subruta. Al emplear la función de navegación interna de la librería (`navigate`), las rutas de redirección deben definirse de forma relativa a la aplicación (por ejemplo, `/` apuntará internamente a `/synergia/`).
2. Para redirecciones nativas del navegador que utilicen el objeto global `window.location.href`, se debe especificar la ruta absoluta completa del servidor para evitar desvíos fuera de la aplicación.
3. El servidor web cuenta con una regla de redirección estricta para corregir las peticiones que ingresan sin la barra diagonal de cierre, forzando la estructura correcta y evitando colisiones con la raíz del dominio principal.


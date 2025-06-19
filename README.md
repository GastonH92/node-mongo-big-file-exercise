# node-mongo-big-file-exercise

Hola! Este es un ejercicio para poner a prueba tus conocimientos de NodeJS y MongoDB. El objetivo es realizar un endpoint que reciba un archivo de ~80mb separado por comas y guarde cada uno de los registros del archivo en la base de datos.

El archivo podés descargarlo de este link:
https://drive.google.com/file/d/1tg8dWr4RD2CeKjEdlZdTT8kLDzfITv_S/view?usp=sharing
(está zippeado para que lo descargues rápido, descomprimilo manualmente)

Se evaluará teniendo en cuenta la prolijidad del código (indentación, comentarios y legibilidad), la performance (tiempo de procesado y memoria utilizada) y escalabilidad (si soporta archivos aún más grandes).

Para simplificarlo, hemos creado este repo starter que se conecta a la base de datos, crea el modelo y expone el endpoint `[POST] /upload` donde tenés que subir el archivo (podés probarlo con Postman). En el archivo `src/controller.js` tenés que ingresar tu código.

## Consideraciones

- Hace un fork de este repo para comenzar, y cuando tengas la solución compartí tu repositorio con quien te solicitó este ejercicio.
- Recordá correr `npm install` o `yarn install` para instalar las dependencias
- Podés usar hasta 1 librería de tu preferencia además de las incluídas.
- En el endpoint `[GET] /records` podés ver los 10 últimos registros que se procesaron.
- El archivo subido se guarda en el directorio `_temp`, recordá eliminarlo luego de utilizarlo.
- Modificá el archivo `.env` para cambiar el puerto y la conexión a la base de datos.

## Postman
En el directorio `postman` del repo, vas a encontrar los dos requests para que puedas importarlos en Postman.

## Resumen de la resolucion
Carga de archivo
Se usó multer para manejar el archivo recibido desde Postman.

El archivo CSV se procesa directamente desde el disco sin cargarlo completo en memoria.

 Lectura y procesamiento de CSV
Se usó csv-parser para parsear el archivo línea por línea.

Se utilizó fs.createReadStream() para leer el archivo como stream (ideal para grandes volúmenes de datos).

 Inserción en MongoDB
Se almacenaron los datos por lotes (batch) de 1000 registros usando insertMany.

Esto optimiza la cantidad de operaciones a la base y el uso de memoria.

Validación y limpieza de datos
Cada registro se validó con una función parseRecord(), que:

Verifica que el campo id sea un número válido.

Limpia espacios en blanco.

Convierte emails a minúsculas.

Descarta registros incompletos o inválidos.

 Medición de performance
Se utilizó console.time() y process.memoryUsage() para medir:

Tiempo total de procesamiento.

Uso de memoria.

## Reporte de performance 
Prueba ejecutada con un archivo de ~80MB, 500,000 registros

Tiempo total: 5042.183ms
Registros insertados: 500000
Memoria utilizada: 54.21 MB
Nota: Los resultados pueden variar según la máquina local y la conexión a la base.


const Records = require('./records.model');
const fs = require('fs');
const csv = require('csv-parser');

const upload = async (req, res) => {
    const { file } = req;

    //validamos si llego el archivo
    if (!file || !file.path) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
     


const filePath = file.path;
const BATCH_SIZE = 1000; // cantidad de registros por lote
let recordsBuffer = []; // buffer temporal para los registros a insertar
 
try{
    //creamos un stream de lectura del archivo y lo pasamos a csv-parser
    const stream = fs.createReadStream(filePath).pipe(csv());
    
    //por cada fila del CSV limpiamos y validamos antes de insertarlo
    stream.on('data', async(data) => {
        const parsed = parseRecord(data);

        //solo agregamos el registro si es valido
        if (parsed) {
            recordsBuffer.push(parsed);
        }

        //si el buffer alcanza el tamaño del lote, insertamos los registros
        if (recordsBuffer.length >= BATCH_SIZE) {
            stream.pause(); // Pausamos la lectura para no llenar la memoria

            try {
                await Records.insertMany(recordsBuffer); // Insertamos en lote
                recordsBuffer = [];                      // Limpiamos el buffer
                stream.resume();                         // Reanudamos la lectura
            } catch (err) {
                console.error('Error insertando lote:', err);
                stream.destroy(err); // Cortamos el stream si hay error
            }
        }
    });

    // Al finalizar la lectura, insertamos cualquier registro restante
    stream.on('end', async () => {
        if (recordsBuffer.length > 0) {
            try {
                await Records.insertMany(recordsBuffer);
            } catch (err) {
                console.error('Error insertando últimos registros:', err);
                return res.status(500).json({ error: 'Error en los últimos registros' });
            }
        }

        console.timeEnd('Tiempo total'); // Mostramos tiempo en consola

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`Memoria utilizada: ${used.toFixed(2)} MB`); // Mostramos memoria utilizada

         // Todo finalizó correctamente
        res.status(200).json({ message: 'File processed successfully' });
    });
     // Si hay un error durante la lectura
     stream.on('error', (err) => {
        console.error('Error leyendo el archivo:', err);
        return res.status(500).json({ error: 'Error al leer el archivo' });
    });
    } catch (error) {
        //errores generales no controlados
        console.error('Error general en upload:', error);
        return res.status(500).json({ error: 'Error al procesar el archivo' });
    };

 
// Función auxiliar para transformar y validar cada registro
function parseRecord(data) {
    try {
        const id = parseInt(data.id, 10); // Convertimos el ID a número

        // Si el ID no es válido, descartamos el registro
        if (isNaN(id)) return null;

        // Retornamos el objeto limpio y listo para guardar
        return {
            id,
            firstname: data.firstname?.trim() || '',
            lastname: data.lastname?.trim() || '',
            email: data.email?.trim().toLowerCase() || '',
            email2: data.email2?.trim().toLowerCase() || '',
            profession: data.profession?.trim() || '',
        };
    } catch (e) {
        // Si hay algún error inesperado, descartamos el registro
        return null;
    }
} 
}
const list = async (_, res) => {
    try {
        const data = await Records.find({}).limit(10).lean();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Exportamos el controlador
module.exports = {
    upload,
    list,
};
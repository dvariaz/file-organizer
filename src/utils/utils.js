const fs = require("fs");
const path = require("path");
const colors = require("colors");
const sharp = require("sharp");

const separator = "@";
const fileIndexLength = 4;

const getFileIndex = (filename) => {
  let regExp = new RegExp(`${separator}\\d{${fileIndexLength}}\.`);
  let result = regExp.exec(filename);

  if (result) {
    let trimedFilename = result[0];
    return trimedFilename.slice(1, trimedFilename.length - 1);
  } else {
    return null;
  }
};

const setFileIndex = (index) => index.toString().padStart(fileIndexLength, "0");

//Retorna un array con los indices a generar
const indexesToWrite = (actual, quantity) => {
  console.log(
    `Indices actuales: ${actual.length}\nCantidad a generar: ${quantity}`
  );
  let actualFileIndexes = actual.map((filename) =>
    parseInt(getFileIndex(filename))
  );
  console.log("Lista de indices actuales: ", actualFileIndexes);

  let toWrite = [];

  for (let i = 0; i < actual.length + quantity; i++) {
    if (actualFileIndexes.indexOf(i) < 0) {
      //Si el indice ordenado no esta en los indices actuales
      toWrite.push(i);
    }
  }
  console.log("Lista de indices a generar: ", toWrite);
  return toWrite;
};

const renameFiles = (files, ref) => {
  try {
    //Analizamos si la referencia tiene productos registrados
    let folderContent = fs.readdirSync(path.dirname(files[0]));
    // console.log("Archivos en la carpeta", folderContent);
    let filelist = folderContent.filter((file) => path.extname(file) != "");
    // console.log(folderContent);
    let filesIncludingRef = filelist.filter((file) => file.includes(ref));
    //Si tiene productos registrados, significa que hay fotos con secuencias en sus nombres
    //Ej: ASDF@0001.JPG ASDF@0002.JPG ASDF@0004.JPG
    //Esto hace que tengamos que respetar la secuencia de números

    let newIndexes = []; //Estos son los indices a generar para los nombres

    if (filesIncludingRef.length > 0) {
      console.log(
        `Hay ${filesIncludingRef.length} productos con la referencia ${ref}`
      );
      newIndexes = indexesToWrite(filesIncludingRef, files.length);
    } else {
      console.log(`Se generarán indices desde el 0 hasta el ${files.length}`);
      for (let i = 0; i < files.length; i++) {
        newIndexes.push(i);
      }
    }

    let newFileNames = files.map((pathfile, index) => {
      let ext = path.extname(pathfile);
      let dir = path.join(path.dirname(pathfile), ref); //Se renombran en una carpeta especifica
      let counter = setFileIndex(newIndexes[index]);

      let newFilename = ref + separator + counter + ext;

      return path.join(dir, newFilename);
    });

    console.log("Nuevos nombres de archivo:".blue);
    console.log(newFileNames);

    let filenamesBackup = [];

    files.map((oldFile, index) => {
      fs.rename(oldFile, newFileNames[index], (err) => {
        if (err) throw err;
        //Almacenamos una copia de los nombres, en caso de que ocurra un error y toque volver a la normalidad
        let backup = {
          oldFn: oldFile,
          newFn: newFileNames[index],
        };
        filenamesBackup.push(backup);
        console.log(
          `${path.basename(oldFile)} renombrado por ${path.basename(
            newFileNames[index]
          )}`.green
        );
      });
    });
  } catch (err) {
    console.log("Ocurrió un error renombrando los archivos: ".red, err);
    filenamesBackup.map((backup) => {
      fs.rename(backup.newFn, backup.oldFn, (err) => {
        console.log("Ocurrió un error restaurando la copia de seguridad");
      });
    });
  }
};

const writeLog = (msg) => {
  fs.writeFile("ScriptLog.txt", msg, function (err) {
    if (err) return console.log(err);
    console.log("Log generado");
  });
};

const getBasenames = (pathfiles) => {
  return pathfiles.map((pathfile) => path.basename(pathfile));
};

const makeDir = (dir, name) => {
  fs.mkdirSync(path.join(dir, name), { recursive: true }, (error) => {
    if (error) {
      console.error("Un error ocurrió: ", error);
      return false;
    } else {
      console.log(`El directorio ${name} ha sido creado`.green);
      return true;
    }
  });
};

const makeThumbnail = async (file, reference) => {
  let dirname = path.dirname(file);
  let extension = path.extname(file);

  console.log(
    `NUEVO THUMBNAIL: ${reference}${separator}THUMB${extension}`.yellow
  );

  let thumbnail = reference + separator + "THUMB" + extension;

  return sharp(file)
    .resize(256, 256)
    .toFile(path.join(dirname, reference, thumbnail));
};

module.exports = {
  renameFiles,
  writeLog,
  getBasenames,
  makeDir,
  makeThumbnail,
};

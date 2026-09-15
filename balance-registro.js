const fs = require('fs');
const ruta = process.argv[2];
const src = fs.readFileSync(ruta, 'utf8');
const lineas = src.split('\n');
const TAG = /<\/?([A-Za-z][\w.-]*)((?:\s[^<>]*?)?)\s*\/?>/g;
const pila = [];

for (let i = 0; i < lineas.length; i++) {
  let m;
  TAG.lastIndex = 0;
  while ((m = TAG.exec(lineas[i])) !== null) {
    const linea = i + 1;
    const texto = m[0];
    const etiqueta = m[1];
    // saltar comentarios jsx
    if (texto.startsWith('<!--')) continue;
    const cerrandose = texto.startsWith('</');
    const autoci = /\/>$/.test(texto);
    if (cerrandose) {
      const ultimo = pila[pila.length - 1];
      if (ultimo && ultimo.etiqueta === etiqueta) {
        pila.pop();
      } else {
        console.log(`CIERRE HUÉRFANO: </${etiqueta}> en línea ${linea} (esperaba cierre de ${ultimo ? ultimo.etiqueta : 'NADA'})`);
      }
    } else if (!autoci) {
      pila.push({ etiqueta, linea });
    }
  }
}
console.log('--- quedarían sin cerrar (de arriba hacia abajo) ---');
pila.forEach((p) => console.log(`  <${p.etiqueta}> abierto en línea ${p.linea}`));
if (!pila.length) console.log('  (ninguno → balance perfecto con este parser)');

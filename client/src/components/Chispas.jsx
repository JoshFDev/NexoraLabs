const colores = ['#ffffff', '#c4b5fd', '#ffd27a', '#a855f7'];

function Chispas({ cantidad = 26 }) {
  const particulas = Array.from({ length: cantidad }, (_, i) => {
    const angulo = (i / cantidad) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distancia = 100 + Math.random() * 130;
    return {
      id: i,
      rot: ((angulo * 180) / Math.PI).toFixed(1),
      tx: Math.round(Math.cos(angulo) * distancia),
      ty: Math.round(Math.sin(angulo) * distancia),
      retraso: (Math.random() * 0.03).toFixed(3),
      largo: Math.round(18 + Math.random() * 26),
      color: colores[i % colores.length],
    };
  });

  return (
    <div className="login-chispas" aria-hidden="true">
      <span className="login-destello"></span>
      {particulas.map((p) => (
        <span
          key={p.id}
          className="login-chispa"
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--retraso': `${p.retraso}s`,
            '--color': p.color,
            '--rot': `${p.rot}deg`,
            '--largo': `${p.largo}px`,
          }}
        />
      ))}
    </div>
  );
}

export default Chispas;
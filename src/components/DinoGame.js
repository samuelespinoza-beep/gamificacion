"use client";
import { useEffect, useRef, useState } from "react";

export default function DinoGame({ onWin }) {
  // 🧑‍💻 TÉCNICO: useRef crea una referencia mutable que persiste durante el ciclo de vida del componente para acceder al nodo DOM del canvas.
  // 🗣️ HUMANO: Guardamos un "gancho" para poder agarrar la pizarra blanca (el canvas) donde vamos a dibujar el juego.
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);

  // 🧑‍💻 TÉCNICO: useEffect ejecuta la lógica principal una vez que el componente se monta en el DOM. Esencial para interactuar con APIs del navegador como Canvas y eventos.
  // 🗣️ HUMANO: Le decimos a la página: "Apenas aparezca este recuadro en la pantalla, enciende el motor del juego y prepara todo".
  useEffect(() => {
    const canvas = canvasRef.current;
    
    // 🧑‍💻 TÉCNICO: Se instancia el contexto 2D (CanvasRenderingContext2D), que expone los métodos para dibujar formas, textos e imágenes.
    // 🗣️ HUMANO: Agarramos nuestros "pinceles" mágicos de 2D para empezar a pintar en la pizarra.
    const ctx = canvas.getContext("2d");

    // --- Configuración de Dimensiones ---
    const ancho = 700;
    const alto = 300;
    const sueloY = 240;

    // --- Carga de Imágenes Locales ---
    // 🧑‍💻 TÉCNICO: Instanciación de objetos de tipo Image para precargar los assets gráficos en memoria antes de rasterizarlos.
    // 🗣️ HUMANO: Vamos al cajón de las fotos, sacamos las imágenes del dino, el cactus y las nubes, y las dejamos sobre la mesa listas para usar.
    const imgRex = new Image();
    const imgCactus = new Image();
    const imgNube = new Image();
    const imgSuelo = new Image();
    const imgCorazon = new Image();

    imgRex.src = '/imgs/rex1.png';
    imgCactus.src = '/imgs/cactus.png';
    imgNube.src = '/imgs/nube.png';
    imgSuelo.src = '/imgs/suelo.png';
    imgCorazon.src = '/imgs/corazon.png';

    // --- Estado Inicial del Juego ---
    // 🧑‍💻 TÉCNICO: Variables de estado locales (closures). Controlan vectores de física (gravedad, velocidad vertical 'vy'), coordenadas y booleanos de estado.
    // 🗣️ HUMANO: Anotamos en una libreta las reglas del juego: dónde está parado el dino, con qué fuerza salta, a qué velocidad va el mundo y cuántas vidas tenemos.
    let trex = { y: sueloY, vy: 0, gravedad: 1.5, salto: 22, saltando: false };
    let nivel = { velocidad: 6, marcador: 0, muerto: false, vidas: 3 };
    let cactus = { x: ancho + 100, y: sueloY + 5 }; 
    let nube = { x: 500, y: 30, velocidad: 1 };
    let sueloScroll = 0;
    let invulnerable = 0; 

    const saltar = () => {
      // 🧑‍💻 TÉCNICO: Mutación condicional de la velocidad vertical (vy). Previene el doble salto validando el booleano 'saltando'.
      // 🗣️ HUMANO: Si el dino está tocando el piso y estamos vivos, le damos un fuerte empujón hacia arriba. Si estamos muertos, usamos el salto para revivir.
      if (!trex.saltando && !nivel.muerto) {
        trex.saltando = true;
        trex.vy = trex.salto;
      } else if (nivel.muerto) {
        reiniciarJuego();
      }
    };

    const reiniciarJuego = () => {
      // 🧑‍💻 TÉCNICO: Resetea las variables de estado al valor inicial tras un estado de 'Game Over'.
      // 🗣️ HUMANO: Borrón y cuenta nueva. Devolvemos los puntos a cero, curamos las vidas y alejamos al cactus para empezar de nuevo.
      nivel.muerto = false;
      nivel.marcador = 0;
      nivel.velocidad = 6;
      nivel.vidas = 3;
      cactus.x = ancho + 100;
      invulnerable = 0;
    };

    const handleKeyDown = (e) => {
      // 🧑‍💻 TÉCNICO: Intercepta el KeyboardEvent. e.preventDefault() bloquea el comportamiento nativo (evita que la página web baje al presionar espacio).
      // 🗣️ HUMANO: Le decimos al navegador: "Si tocan el espacio, haz saltar al dino, pero ¡por favor no deslices la página hacia abajo!".
      if (e.code === "Space") {
        e.preventDefault();
        saltar();
      }
    };

    // 🧑‍💻 TÉCNICO: Se añade el event listener al objeto global window.
    // 🗣️ HUMANO: Ponemos un micrófono gigante que escucha cualquier tecla que aprietes en todo momento.
    window.addEventListener("keydown", handleKeyDown);

    // --- Bucle Principal (Optimizado) ---
    // 🧑‍💻 TÉCNICO: 'Game Loop' basado en requestAnimationFrame. Se ejecuta aprox. 60 veces por segundo, sincronizado con el refresco del monitor.
    // 🗣️ HUMANO: El corazón del juego. Es como una libreta de dibujos animados: borramos la hoja, movemos todo un poquito, dibujamos, pasamos a la siguiente hoja súper rápido.
    const frame = () => {
      // 🧑‍💻 TÉCNICO: clearRect limpia el buffer de píxeles del frame anterior para evitar el efecto 'ghosting' (estelas).
      // 🗣️ HUMANO: Borramos toda la pizarra con un trapo mojado antes de volver a dibujar la nueva posición de las cosas.
      ctx.clearRect(0, 0, ancho, alto);

      if (!nivel.muerto) {
        // 1. Lógica del Suelo Infinito
        // 🧑‍💻 TÉCNICO: Creación de efecto Parallax restando velocidad al offset X. Al superar el ancho de la pantalla, se reinicia el loop visual.
        // 🗣️ HUMANO: Movemos la imagen del piso hacia atrás. Cuando la imagen se acaba, la teletransportamos al inicio de inmediato para que parezca una cinta de correr infinita.
        sueloScroll -= nivel.velocidad;
        if (sueloScroll <= -ancho) sueloScroll = 0;

        // 2. Lógica de Gravedad
        // 🧑‍💻 TÉCNICO: Aplicación de cinemática básica. Se resta aceleración gravitatoria a la velocidad Y actual, actualizando la posición espacial.
        // 🗣️ HUMANO: Mientras el dino esté en el aire, la gravedad lo "jala" hacia abajo quitándole la fuerza del salto poco a poco hasta que vuelve a chocar contra el suelo.
        if (trex.saltando) {
          trex.y -= trex.vy;
          trex.vy -= trex.gravedad;
          if (trex.y >= sueloY) {
            trex.y = sueloY; // 🧑‍💻 Floor clamping (evita hundirse en el suelo) / 🗣️ Para evitar que el dino atraviese el piso.
            trex.saltando = false;
            trex.vy = 0;
          }
        }

        // 3. Lógica de Obstáculos (IA Progresiva)
        // 🧑‍💻 TÉCNICO: Traslación en el eje X del obstáculo. Cuando sale del viewport (-100px), se respawnea sumando randomización y modificando el state escalar (dificultad).
        // 🗣️ HUMANO: El cactus avanza hacia ti. Cuando sale de la pantalla por la izquierda, lo agarramos, le sumamos un punto a tu score y lo lanzamos desde la derecha a una distancia sorpresa para que no sepas cuándo viene.
        cactus.x -= nivel.velocidad;
        if (cactus.x < -100) {
          cactus.x = ancho + Math.floor(Math.random() * 400);
          nivel.marcador++;
          if (nivel.marcador % 5 === 0) nivel.velocidad += 0.5; // Sube dificultad
        }

        // 4. Lógica de Colisión con Vidas
        // 🧑‍💻 TÉCNICO: Disminuye el contador de frames de inmunidad (cooldown).
        // 🗣️ HUMANO: Si chocaste, este contador va bajando hasta que se te quite el "escudo mágico" y puedas volver a recibir daño.
        if (invulnerable > 0) invulnerable--;

        // 🧑‍💻 TÉCNICO: Detección de colisión AABB (Axis-Aligned Bounding Box) simplificada. Evalúa intersección de coordenadas rectangulares.
        // 🗣️ HUMANO: Calculamos matemáticamente: ¿El cuadrado invisible que rodea al dino se cruzó con el cuadrado invisible del cactus?
        if (invulnerable === 0 && cactus.x >= 80 && cactus.x <= 130 && trex.y >= sueloY - 20) {
          nivel.vidas--;
          invulnerable = 60; // 🧑‍💻 60 frames a 60FPS = 1 segundo de i-frames. / 🗣️ Te damos 1 segundo de invencibilidad para que respires.
          if (nivel.vidas === 0) {
            nivel.muerto = true;
            onWin(nivel.marcador); // 🧑‍💻 Callback al componente padre (page.js). / 🗣️ Le avisa al sistema general de puntos que perdiste y le manda tus puntos finales.
          }
        }
      }

      // --- Dibujado en Pantalla ---
      // 🧑‍💻 TÉCNICO: Renderizado rasterizado. El orden de ejecución define el 'z-index' (lo que se dibuja primero, queda atrás).
      // 🗣️ HUMANO: Momento de pintar. Primero pintamos lo que va al fondo (suelo, nubes) y encima lo que va adelante (cactus, dino).
      
      ctx.drawImage(imgSuelo, sueloScroll, sueloY + 45, ancho, 20);
      ctx.drawImage(imgSuelo, sueloScroll + ancho, sueloY + 45, ancho, 20);
      ctx.drawImage(imgNube, nube.x, nube.y, 80, 50);
      ctx.drawImage(imgCactus, cactus.x, sueloY, 50, 55);

      // 🧑‍💻 TÉCNICO: Renderizado condicional basado en ciclo de reloj (módulo matemático) para simular parpadeo de sprite.
      // 🗣️ HUMANO: Si tienes el escudo mágico activado, hacemos que el dino aparezca y desaparezca rapidísimo para crear el clásico efecto de "parpadeo" de los juegos retro.
      if (!(invulnerable > 0 && Math.floor(invulnerable / 5) % 2 === 0)) {
        ctx.drawImage(imgRex, 100, trex.y, 55, 55);
      }

      // Interfaz: Vidas (Corazones)
      // 🧑‍💻 TÉCNICO: Bucle iterativo para renderizar elementos de UI de forma dinámica según el valor del state.
      // 🗣️ HUMANO: Un bucle que dice: "Por cada vida que me queda, dibuja la foto de un corazón un poquito más a la derecha que el anterior".
      for (let i = 0; i < nivel.vidas; i++) {
        ctx.drawImage(imgCorazon, 20 + (i * 35), 60, 25, 25);
      }

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 24px Arial";
      ctx.fillText(`${nivel.marcador} PTS`, 20, 40);

      // Pantalla de Game Over
      if (nivel.muerto) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.8)"; // Fondo semi-transparente
        ctx.fillRect(0, 0, ancho, alto);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 40px Arial";
        ctx.fillText("¡GAME OVER!", ancho / 2, alto / 2 - 20);
        ctx.font = "20px Arial";
        ctx.fillText(`Puntos totales: ${nivel.marcador}`, ancho / 2, alto / 2 + 20);
        ctx.fillText("Presiona ESPACIO para jugar de nuevo", ancho / 2, alto / 2 + 60);
        ctx.textAlign = "start"; 
      }

      // 🧑‍💻 TÉCNICO: Recursividad asíncrona controlada por la API gráfica del navegador para crear el loop infinito.
      // 🗣️ HUMANO: Al terminar de pintar esta hoja, le pedimos al navegador que nos avise justo cuando esté listo para empezar a pintar la siguiente.
      requestAnimationFrame(frame);
    };

    // 🧑‍💻 TÉCNICO: Inicializa el primer frame de la recursividad al montar el componente.
    // 🗣️ HUMANO: Damos la orden de arranque para dibujar el primerísimo dibujo del juego.
    const animId = requestAnimationFrame(frame);

    // --- Cleanup de React ---
    // 🧑‍💻 TÉCNICO: Función de saneamiento que se ejecuta en el 'unmount'. Previene fugas de memoria (memory leaks) eliminando listeners activos y cancelando el loop recursivo.
    // 🗣️ HUMANO: Cuando el usuario cierra el juego, limpiamos nuestro desorden: apagamos el micrófono que escuchaba el teclado y detenemos el motor de dibujos para que la computadora no se ponga lenta por accidente.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animId);
    };
  }, [onWin]);

  // Aquí abajo va la parte visual (el HTML) que contiene al Canvas.
  return (
    <div className="flex flex-col items-center bg-slate-50 p-4 rounded-3xl">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-black text-slate-800">DINO RUN IA</h3>
        <p className="text-sm text-slate-500">Esquiva los cactus para ganar puntos LR</p>
      </div>
      
      <canvas ref={canvasRef} 
        width={700} 
        height={300} 
        className="border-8 border-slate-900 rounded-2xl bg-white shadow-2xl cursor-pointer"
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {'code': 'Space'}))}
      />
      
      <div className="mt-6 flex gap-10 text-slate-400 font-bold text-xs uppercase tracking-widest">
        <span>[ESPACIO] Saltar</span>
        <span>|</span>
        <span>3 Vidas por intento</span>
      </div>
    </div>
  );
}
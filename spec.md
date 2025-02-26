# Juego: Space Invaders + Plants vs. Zombies

Quiero crear un juego que combine la dinámica de **Space Invaders** con **Plants vs. Zombies**. El juego debe desarrollarse en **Next.js** y usar **Supabase** para guardar los puntajes y mostrar un leaderboard. Aquí tienes los detalles del juego:

---

## **Mecánica Principal**

1. **Jugador**: El jugador controla una nave espacial que puede moverse horizontalmente en la parte inferior de la pantalla.
2. **Enemigos**: Los enemigos son naves alienígenas que caen desde la parte superior de la pantalla en oleadas.
3. **Defensas**: El jugador puede colocar torretas o defensas en posiciones específicas de la pantalla para detener a los enemigos.
4. **Recursos**: El jugador gana recursos (como monedas o energía) al eliminar enemigos, que puede usar para comprar o mejorar defensas.

---

## **Dinámica del Juego**

1. **Oleadas**: Los enemigos vienen en oleadas, y cada oleada es más difícil que la anterior.
2. **Tipos de Enemigos**:
   - **Básicos**: Naves lentas y fáciles de eliminar.
   - **Rápidos**: Naves que se mueven más rápido.
   - **Fuertes**: Naves con más resistencia que requieren más disparos para ser eliminadas.
   - **Especiales**: Naves con habilidades únicas, como disparar al jugador o esquivar defensas.
3. **Defensas**:
   - **Torreta básica**: Dispara automáticamente a los enemigos más cercanos.
   - **Láser**: Hace daño en un área.
   - **Escudo**: Protege al jugador de los disparos enemigos.
   - **Misiles**: Dispara misiles que hacen daño masivo.
4. **Recursos**: Los recursos se ganan al eliminar enemigos y se usan para comprar o mejorar defensas.

---

## **Interfaz de Usuario**

1. **Pantalla de Juego**:
   - Área superior: Enemigos que caen.
   - Área inferior: Nave del jugador y defensas colocadas.
   - Barra de recursos: Muestra la cantidad de recursos disponibles.
2. **Menú de Defensas**:
   - Un menú lateral o inferior donde el jugador puede seleccionar y colocar defensas.
3. **Leaderboard**:
   - Una pantalla que muestra los mejores puntajes guardados en Supabase.

---

## **Tecnologías**

1. **Next.js**: Para el frontend y la lógica del juego.
2. **Supabase**:
   - Guardar los puntajes en una tabla llamada `scores` con columnas como `id`, `user_name`, `score`, y `created_at`.
   - Mostrar el leaderboard en tiempo real.
3. **Animaciones**: Usar librerías como **Framer Motion** o **GSAP** para animaciones fluidas.
4. **Sonidos**: Añadir efectos de sonido para disparos, explosiones y colocación de defensas.

---

## **Requisitos Técnicos**

1. **Movimiento de la Nave**:
   - La nave del jugador debe moverse horizontalmente con las teclas de flecha o el mouse.
2. **Colocación de Defensas**:
   - El jugador debe poder seleccionar una defensa del menú y colocarla en una posición específica.
3. **Disparos**:
   - Las defensas deben disparar automáticamente a los enemigos más cercanos.
4. **Oleadas**:
   - Cada oleada debe ser generada automáticamente, con un aumento progresivo de dificultad.
5. **Game Over**:
   - El juego termina cuando los enemigos alcanzan la parte inferior de la pantalla o destruyen todas las defensas.

---

## **Extras**

1. **Power-ups**:
   - Añadir power-ups que caen aleatoriamente, como "doble disparo" o "recursos extra".
2. **Modo Multijugador (opcional)**:
   - Permitir que dos jugadores jueguen juntos en la misma pantalla.
3. **Temas Visuales**:
   - Usar un tema espacial para las naves y enemigos, pero con un toque de Plants vs. Zombies (como enemigos con forma de plantas alienígenas).

---

## **Entregables**

1. **Código del Juego**:
   - Código completo en Next.js con la lógica del juego.
2. **Conexión a Supabase**:
   - Configuración completa para guardar puntajes y mostrar el leaderboard.
3. **Assets**:
   - Imágenes y sonidos para el juego (pueden ser placeholders si es necesario).
4. **Instrucciones**:
   - Cómo ejecutar el juego localmente y desplegarlo en producción.

---

Por favor, genera el código y los recursos necesarios para este juego. Si tienes alguna pregunta o necesitas más detalles, no dudes en pedírmelo.
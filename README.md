# 🏆 Mundial Porras

Juego de porras para el Mundial. Todos los jugadores apuestan los resultados de cada jornada y se asignan puntos automáticamente.

---

## 🚀 Cómo desplegarlo (15 minutos, todo gratis)

### PASO 1 — Crear la base de datos en Supabase

1. Ve a **https://supabase.com** → "Start your project" → crea una cuenta gratis
2. Crea un nuevo proyecto (elige la región más cercana, ej. "West EU")
3. Espera ~2 min a que arranque
4. Ve al menú izquierdo → **SQL Editor** → pega TODO el contenido de `supabase-schema.sql` y pulsa **Run**
5. Ve a **Settings → API** y copia:
   - `Project URL` → es tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### PASO 2 — Subir el código a GitHub

1. Ve a **https://github.com** → "New repository" → llámalo `mundial-porras` → público → Create
2. En tu ordenador, abre una terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Mundial Porras"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mundial-porras.git
git push -u origin main
```

---

### PASO 3 — Desplegar en Vercel

1. Ve a **https://vercel.com** → "Add New Project"
2. Conecta tu GitHub y selecciona el repo `mundial-porras`
3. Antes de hacer Deploy, ve a **Environment Variables** y añade:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | tu URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon key de Supabase |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | la contraseña que quieras |

4. Pulsa **Deploy** → en 2 minutos tienes la URL lista

---

### PASO 4 — ¡A jugar!

- Comparte la URL de Vercel con tus amigos (tipo `mundial-porras.vercel.app`)
- Cada uno entra desde su móvil, se registra con su nombre y avatar
- Tú entras como admin con la contraseña que pusiste
- Creas las jornadas con los partidos y la fecha de inicio
- Antes del primer partido los jugadores hacen su porra
- Cuando acaben los partidos introduces los resultados y los puntos se asignan solos

---

## 📱 Instalar como app en el móvil

En iOS: Safari → botón compartir → "Añadir a pantalla de inicio"
En Android: Chrome → menú → "Añadir a pantalla de inicio"

---

## 🔑 Sistema de puntos

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto | +4 pts |
| Signo correcto (1X2) | +2 pts |
| Fallo pero participaste | +1 pt |
| No participaste | 0 pts |

---

## ⚙️ Desarrollo local

```bash
npm install
cp .env.example .env.local
# Rellena .env.local con tus claves de Supabase
npm run dev
```

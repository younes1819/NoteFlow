@echo off
REM Despliegue de noteflow-api en Vercel
REM Requisito: vercel login (una sola vez)

cd /d "%~dp0"

echo.
echo === Verificando sesion Vercel ===
vercel whoami
if errorlevel 1 (
  echo Ejecuta primero: vercel login
  exit /b 1
)

echo.
echo === Configurando variables de entorno ===
echo Pega DATABASE_URL cuando se pida (desde Neon - Connect):
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production

echo.
echo === Desplegando a produccion ===
vercel --prod --yes

echo.
echo Listo. Copia la URL que aparece arriba y ponla en .env:
echo EXPO_PUBLIC_API_URL=https://TU-URL.vercel.app/api

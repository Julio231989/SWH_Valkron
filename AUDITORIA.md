# Auditoría de Valkron — 13-oct-2026

Alcance: `index.html`, `sw.js`, `jamr_appsscript.gs`, `manifest.webmanifest`. NO se leyó `jamr_registro.xlsx` ni se usó la URL de despliegue (pueden contener datos reales). Todo lo marcado «confirmado» se comprobó en el código; «probable» no se pudo ejecutar contra el Sheet real.

| # | Hallazgo | Estado | Gravedad | Acción |
|---|---|---|---|---|
| 1 | `saveLocalCache` hacía 17 `setItem` sin `try/catch`: con la cuota llena o en modo privado lanzaba excepción a mitad de una operación y dejaba claves sin guardar | Confirmado | Alta | **Corregido** (cada clave aislada). Prueba incluida |
| 2 | `poblarSelectorDias` solo poblaba una vez: un día nuevo (p. ej. Sábado) no aparecía hasta recargar | Confirmado | Media | **Corregido** |
| 3 | `createRecord` no es idempotente: un reintento del outbox duplica la fila | Confirmado | Media | **Corregido** (requiere pegar el .gs y redesplegar) |
| 4 | `getCollection` cae a `registros` si el nombre es desconocido | Confirmado | Media | **Corregido**: devuelve error |
| 5 | Texto del usuario se inserta con `innerHTML` sin escapar | Confirmado | Media | **Corregido**: `esc()` en 116 puntos |
| 6 | Web App «cualquier persona»: quien conozca la URL puede leer y escribir salud/familia | Probable | Alta | **Mitigado, opcional**: token en Propiedades del script (ver DESPLIEGUE_13OCT.md). Secreto compartido, no autenticación fuerte |
| 7 | Resurrección de borrados: filas borradas en el Sheet volvían a la app desde la copia local | Confirmado (por lectura de `syncCollection`) | Media | **Corregido solo para Actividades**; otras colecciones siguen igual |
| 11 | `flushOutbox` descartaba la operación si el servidor respondía `{error}` (p. ej. «no autorizado» o fallo de script): pérdida silenciosa de datos | Confirmado | Alta | **Corregido**: se conserva y se reintenta; «id no encontrado» sí se descarta |
| 12 | Una hora escrita a mano en el Sheet (`hora_objetivo`) llegaba como fecha 1899 | Probable (depende del formato de la columna) | Media | **Mitigado**: columna como texto y lectura tolerante «HH:mm». Sin probar contra un Sheet real |
| 8 | Fechas: `getHoy()` usa America/Guayaquil con `Intl` | Confirmado correcto | — | Sin acción |
| 9 | Endpoint no está escrito en el código (se guarda en `localStorage`) | Confirmado correcto | — | Sin acción |
| 10 | `sw.js`: red primero para navegación y caché del shell; versión subida a v10 | Confirmado | — | Hay que reinstalar/recargar la PWA para ver el cambio |

## Cambios hechos en esta pasada
- Plan de pantorrillas (lunes, miércoles, sábado, mañana) con botón «Añadir plan de pantorrillas a mi rutina». Usa las mismas columnas de la hoja `Rutina`, ids fijos (`rt_pant_lun_1`…), orden ≥ 100 (queda **después** de lo que ya haya cada día) y no pisa nada.
- Modo de respiración «Calma rápida» (~2 min) y guía de cuándo usar cada modo.
- Pruebas: `node tests/run.js` → 28 OK (incluye un Sheet simulado en memoria para el Apps Script).

## Contradicciones usuario/código
Dijiste que lunes y miércoles son suaves «con solo flexiones o dominadas». El texto de la app confirma el patrón (Lunes = Empuje + Handstand; Miércoles = Tracción + Muscle-up). El contenido real de la hoja `Rutina` no se leyó, así que no sé qué más hay esos días ni si el sábado ya tiene ejercicios.

## Cambios del 13-oct (segunda pasada, aprobados por el usuario)
- P1 idempotencia, colección desconocida, token opcional, colección `estres` (hoja `Estres`) y acción `version` en `jamr_appsscript.gs`.
- App: escapado de HTML, token, registro de estrés (pestaña Respiración), borrado desde el Sheet en Actividades, outbox que no pierde operaciones.
- Compatibilidad: si el Apps Script aún es el antiguo, la app NO escribe estrés en ninguna hoja (lo guardaría el antiguo en Registros_Diarios); lo conserva en el teléfono y lo sube cuando detecta la versión 2.
- Pendiente: parte del contrato sigue sin validación de esquema; ver DESPLIEGUE_13OCT.md para el orden de despliegue.

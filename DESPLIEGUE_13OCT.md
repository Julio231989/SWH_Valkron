# Despliegue de los cambios del 13-oct-2026 (v11)

Orden importa. No saltes pasos.

## A. Google Sheet / Apps Script
1. Abre el Sheet de Valkron > Extensiones > Apps Script. Reemplaza TODO el contenido por `jamr_appsscript.gs` de esta carpeta. Guarda.
2. Implementar > Administrar implementaciones > editar (lápiz) > Versión: **Nueva versión** > Implementar. La URL no cambia.
3. En la hoja **Actividades**, selecciona la columna `hora_objetivo` > Formato > Número > **Texto sin formato**. (Evita que Sheets convierta «06:30» en una hora; el script ya lo tolera, pero así queda limpio.)
4. La hoja **Estres** se crea sola con el primer registro. No hace falta crearla.

## B. Subir la app
5. Sube `index.html` y `sw.js` (v11) a tu GitHub Pages (tú haces el push). Abre la app y recárgala dos veces.
6. La app detecta sola si el Apps Script ya es el nuevo (acción `version`). Mientras no lo sea, los registros de estrés se guardan solo en el teléfono y no se escriben en ninguna otra hoja.

## C. Token de acceso (hazlo al final, cuando TODOS tus dispositivos tengan la v11)
7. Apps Script > Configuración del proyecto (engranaje) > Propiedades del script > Añadir: nombre `TOKEN`, valor una frase larga. Guarda. No hace falta redesplegar.
8. En cada dispositivo: Config > Servidor. Pega la URL (la misma) y, cuando pregunte el token, escríbelo. Se guarda en ese dispositivo.
9. Para desactivar el token: borra la propiedad `TOKEN`.
Advertencia: una versión antigua de la app (anterior a v11) que no envía token recibiría errores y, por un defecto que ya corregí en v11, **descartaba** esas operaciones. Por eso el token va al final.
Límite honesto: el token es un secreto compartido. Reduce mucho el riesgo de que alguien use la URL, pero no es autenticación fuerte; viaja en la URL de las lecturas.

## D. Actividades desde la hoja
- Editar `nombre`, `proposito`, `hora_objetivo`, `orden`, `activo`: se refleja en la app en ≤ 45 s (o con «Sincronizar»).
- El orden en Hoy es por `hora_objetivo` y, a igual hora, por `orden`. Para reordenar actividades con horas distintas hay que cambiar la hora.
- Ocultar sin borrar: `activo` = No. Desaparece de Hoy; el historial se conserva.
- Borrar la fila: desaparece de la app en la siguiente sincronización. El historial de `Registros_Diarios` queda con el `actividad_id` huérfano (conserva `actividad_nombre`).
- No cambies la columna `id` ni los encabezados de la fila 1.
- Filas nuevas escritas a mano: pon un `id` único (ej. `a_meditar`), `activo` = Sí, `tipo` = checkbox o numerico.

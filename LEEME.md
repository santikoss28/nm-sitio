# Sitio Nicole Montes (NM) · Abogacía, Turismo y Café con pago en línea

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Portada: logo NM y las tres opciones (asesoría, viajes, café) |
| `abogacia.html` | Página de asesoría jurídica |
| `turismo.html` | Página de planes de viaje |
| `cafe.html` | Tienda de café con carrito y pago en línea |
| `contenido.js` | **Aquí editas todo**: textos, servicios, planes, precios y variedades |
| `site.css`, `site.js`, `cafe.js` | Diseño y lógica (no hace falta tocarlos) |
| `img/` | Logos y fotos (sube aquí las tuyas) |
| `admin.html` | Panel privado de pedidos de café |
| `supabase/` | El servidor del pago (solo se usa en Supabase, no va a GitHub) |

## Cómo modificar cada parte (sin saber programar)
1. En GitHub abre `contenido.js` y pulsa el lápiz (Edit).
2. Cada área tiene su bloque: `abogacia`, `turismo` y `cafe`. Cambia el texto entre comillas.
3. **Agregar un servicio, plan o variedad:** copia un bloque `{ ... },`, pégalo debajo y cambia los textos.
4. **Poner tu foto en un plan de viaje:** sube la foto a la carpeta `img` y escribe su ruta en `foto: "img/mi-foto.jpg"`.
5. Pulsa **Commit changes**. En 1 o 2 minutos la página ya muestra el cambio.
6. Cuida las comillas y las comas: si la página queda en blanco, casi siempre falta una.

**Importante antes de publicar:** los servicios de abogacía y los planes de turismo que trae el sitio son EJEMPLOS. Reemplázalos por los reales (y agrega tu tarjeta profesional en `tarjetaProfesional`).

**Regla de oro:** las claves secretas (Access Token de Mercado Pago, clave de Resend, ADMIN_TOKEN) NUNCA van en los archivos de la página ni se pegan en chats. Solo se guardan como "secrets" en Supabase (paso 5).

Cómo funciona: el cliente arma su carrito → pulsa **Pagar con Mercado Pago** → el servidor recalcula los precios (no se puede alterar desde el navegador), guarda el pedido y crea el cobro → el cliente paga en la página segura de Mercado Pago → Mercado Pago avisa al servidor → el pedido pasa a *pagado* y te llega un correo (y al cliente también) → lo ves en `admin.html`.

---

## 1. Cuenta de Mercado Pago (vendedor)
1. Entra a https://www.mercadopago.com.co y crea/activa tu cuenta de vendedor (verifica identidad y cuenta bancaria para poder retirar el dinero).
2. Ve a **Tus integraciones** (developers) → **Crear aplicación** → tipo **Pagos en línea / Checkout Pro**.
3. En la aplicación, abre **Credenciales de prueba** y copia el *Access Token* (empieza por `TEST-`). Más adelante usarás las de producción.

## 2. Proyecto en Supabase (gratis)
1. Crea cuenta en https://supabase.com → **New project** (guarda la contraseña de la base de datos).
2. **SQL Editor** → pega todo `supabase/schema.sql` → **Run**.

## 3. Correos con Resend (gratis)
1. Crea cuenta en https://resend.com → **API Keys** → crea una clave.
2. Sin dominio propio, Resend solo permite enviar desde `onboarding@resend.dev` y **únicamente al correo con el que te registraste**. Úsalo para ti (aviso de pedidos). Para que al cliente también le llegue su confirmación, verifica un dominio propio en Resend y define `MAIL_FROM` (paso 5).

## 4. Subir las funciones
Necesitas Node.js instalado. En una terminal, dentro de esta carpeta:
```
npm i -g supabase
supabase login
supabase link --project-ref TU_REF        # el REF sale en Project Settings > General
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy mp-webhook --no-verify-jwt
supabase functions deploy admin-orders --no-verify-jwt
```
Tus URLs serán `https://TU_REF.supabase.co/functions/v1/<nombre-de-la-función>`.

## 5. Guardar los secretos
Elige tú una clave larga para el panel (mínimo 16 caracteres, mezcla letras y números). Luego:
```
supabase secrets set MP_ACCESS_TOKEN="TEST-..." \
  SITE_URL="https://repicris10-spec.github.io/NOMBRE-DEL-REPO" \
  RESEND_API_KEY="re_..." NOTIFY_EMAIL="tu-correo@..." \
  ADMIN_TOKEN="tu-clave-larga"
```
(`MP_WEBHOOK_SECRET` va en el paso 6.) `SITE_URL` es la dirección exacta donde publicarás la tienda, sin barra final. Opcional: `MAIL_FROM="Montaña Luminosa <pedidos@tudominio.com>"`.

## 6. Avisar a Mercado Pago (webhook)
1. En tu aplicación → **Webhooks** → **Configurar notificaciones**.
2. URL de prueba y de producción: `https://TU_REF.supabase.co/functions/v1/mp-webhook`
3. Evento: **Pagos**. Guarda y copia la **clave secreta** que aparece.
4. `supabase secrets set MP_WEBHOOK_SECRET="la-clave-secreta"`
5. Repite el paso 6 cuando cambies a credenciales de producción (la clave secreta puede ser distinta).

## 7. Conectar las páginas
- En `contenido.js`, en el bloque `cafe`, escribe en `checkoutUrl: ""` la dirección `"https://TU_REF.supabase.co/functions/v1/create-checkout"`.
- En `admin.html` busca `var API = "";` y pon `"https://TU_REF.supabase.co/functions/v1/admin-orders"`.
- Sube todos los archivos de esta carpeta (menos `supabase/`) a tu repositorio de GitHub Pages. El panel queda en `.../admin.html` (nadie ve pedidos sin tu clave).

## 8. Probar
1. Con credenciales **TEST-**, haz un pedido en tu página; Mercado Pago te mostrará su entorno de pruebas. Usa las tarjetas de prueba y usuarios de prueba de https://www.mercadopago.com.co/developers/es/docs/checkout-pro/integration-test (compra con un usuario de prueba, no con tu propia cuenta de vendedor).
2. Verifica: el pedido aparece como *pagado* en `admin.html` y llega el correo.
3. Si algo falla: Supabase → **Edge Functions → Logs**.

## 9. Salir a producción
1. En Mercado Pago, activa las credenciales de producción y copia el Access Token real.
2. `supabase secrets set MP_ACCESS_TOKEN="APP_USR-..."` y actualiza `MP_WEBHOOK_SECRET` si cambió.
3. Haz una compra real de $10.000 (tu bolsa de 125 g) para confirmar el circuito completo.

---

## Mantenimiento
- **Cambiar precios:** edita `supabase/functions/_shared/catalog.ts` (precios reales, los que se cobran) **y** ``precios` en `contenido.js` (lo que ve el cliente). Luego `supabase functions deploy create-checkout --no-verify-jwt`. Si no coinciden, el cliente verá un precio y se le cobrará otro: revisa ambos.
- **Envío:** el cobro incluye solo el café; el envío se coordina por WhatsApp con el cliente (el texto de la tienda ya lo dice: "sin envío").
- **Comisión:** Mercado Pago descuenta su comisión de cada venta (consulta la tarifa vigente en tu cuenta; en Colombia ronda ~3% + valor fijo + IVA, y el dinero se libera en pocos días).
- **Si `checkoutUrl` queda vacío**, la tienda funciona como antes: pedido por WhatsApp + transferencia.

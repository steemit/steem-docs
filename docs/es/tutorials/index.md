---
title: Tutoriales
description: Tutoriales prácticos y ejemplos de uso de las bibliotecas cliente oficiales de Steem — steem-js para JavaScript/TypeScript y steemgosdk para Go.
---

# Tutoriales

Esta sección reúne ejemplos de uso prácticos de las dos bibliotecas cliente oficiales de Steem (client library). Todos los ejemplos provienen de la documentación de las propias bibliotecas, y las demos se pueden ejecutar contra un nodo público (node) como `https://api.steemit.com`.

## Las bibliotecas

| Biblioteca | Lenguaje | Paquete / módulo | Repositorio |
|---------|----------|------------------|------------|
| steem-js | JavaScript / TypeScript | paquete npm `@steemit/steem-js` 1.2.4 | [steemit/steem-js](https://github.com/steemit/steem-js) |
| steemgosdk | Go | módulo de Go `github.com/steemit/steemgosdk` | [steemit/steemgosdk](https://github.com/steemit/steemgosdk) |

Ambas bibliotecas hablan con la misma API JSON-RPC que documenta, método a método, la [Referencia de API](/es/api/) generada. Usa los tutoriales para aprender los patrones del lado cliente; usa la Referencia de API para los detalles «en el cable» de cada método.

## Páginas de steem-js

- [Inicio rápido](/es/tutorials/steem-js/) - instalación, uso en el navegador, configuración (`config.set`, `api.setUrl`, `setOptions`, varias instancias de la API), panorama de JSON-RPC, enrutamiento de APIs, ejemplos de uso de extremo a extremo, soporte de TypeScript y manejo de errores.
- [Leer datos de la cadena](/es/tutorials/steem-js/read-api.html) - todos los helpers de lectura: etiquetas (tag), blog y discusiones, bloques (block), propiedades globales, cuentas, mercado, votos, contenido, witness, además de los helpers de login/follow y las utilidades fuera de línea de autenticación, formateo y utils.
- [Operaciones de broadcast](/es/tutorials/steem-js/broadcast.html) - el catálogo completo de operaciones de `steem.broadcast`, patrones con promise/callback, multisig y serialización binaria de transacciones (transaction).
- [Llamadas firmadas y verificación de firmas](/es/tutorials/steem-js/signed-calls.html) - peticiones `signedCall` autenticadas y el kit de herramientas de verificación de firmas, con las guías de ejemplos completas.
- [Migración de las pruebas de RPC auth](/es/tutorials/steem-js/rpc-auth-migration.html) - cómo se migró la suite de pruebas `rpc-auth` a steem-js.

## Páginas de steemgosdk

- [Inicio rápido](/es/tutorials/steemgosdk/) - configuración del cliente, ejemplos de API de lectura de la cadena, ejemplos de generación de claves para la autenticación y ejemplos de firma de URI de Steem.
- [Operaciones de broadcast](/es/tutorials/steemgosdk/broadcast.html) - votos, transferencias, comentarios, opciones de comentario con beneficiarios (beneficiary), transacciones multioperación y broadcasts de custom_json, además de ejemplos completos de extremo a extremo.
- [SignedCall API](/es/tutorials/steemgosdk/signed-call.html) - llamadas JSON-RPC autenticadas desde Go, interoperables con las llamadas firmadas de steem-js.

## Notas

- Los tutoriales están por ahora solo en inglés, al igual que la sección de Guides.
- Los ejemplos usan claves de prueba bien conocidas de la documentación de las propias bibliotecas; nunca las uses en producción — genera tus propias claves como se muestra en los ejemplos de autenticación.

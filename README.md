# Ecosistema Web RH, Vacantes y KPIs

## Configuración

1. Configura tu proyecto Firebase y reemplaza los valores en `js/firebase-config.js`.
2. Asegúrate de tener las siguientes colecciones en Firestore:
   - `projects`: Listado de proyectos (usado por checklist y todos los módulos).
   - `vacantes`: Vacantes por proyecto.
   - `entrevistas`: Entrevistas RH.
   - `users`: Usuarios con campos `assignedProjects`, `role` y/o `isAdmin`.
3. Sube los archivos a tu hosting.

## Uso

- Accede a cada módulo desde el menú principal o de administración.
- Solo usuarios autenticados pueden acceder.
- Solo gerentes/admin pueden crear/editar vacantes.
- Solo administradores pueden ver el tablero KPI.
- Todos los registros incluyen auditoría (quién y cuándo).

## Auditoría

Cada registro en Firestore incluye:
- `createdBy`, `createdAt`, `updatedBy`, `updatedAt`
- Para vacantes: `estatus`, `hireDate`
- Para entrevistas: `cvUrl`, `motivo`, `estatus`

## Diseño

Todos los módulos usan los mismos estilos y componentes visuales del sitio principal.

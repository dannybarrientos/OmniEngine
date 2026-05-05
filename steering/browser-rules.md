# Reglas de Navegación Semántica
1. **Filtro de Interacción**: Antes de cualquier acción, ejecutar `agent-browser snapshot -i`.
2. **Prioridad de Accesibilidad**: Usar exclusivamente etiquetas `@e1, @e2...` derivadas del Accessibility Tree.
3. **Validación de Estado**: No dar por exitosa una acción hasta que el DOM o la URL confirmen el cambio de estado esperado.
4. **Auth Vault**: Recuperar credenciales solo mediante el comando `auth get`.
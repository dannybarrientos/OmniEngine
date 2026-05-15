package main

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
)

func main() {
	// Patrones de limpieza (Ejemplo: Ocultar correos y números de tarjetas simulados)
	reEmail := regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
	reCard := regexp.MustCompile(`\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b`)

	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("[SHIELD] Escudo de privacidad activo...")

	for scanner.Scan() {
		line := scanner.Text()
		
		// Aplicar limpieza
		line = reEmail.ReplaceAllString(line, "[REDACTED_EMAIL]")
		line = reCard.ReplaceAllString(line, "[REDACTED_CARD]")
		
		fmt.Println(line)
	}

	if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, "Error leyendo entrada:", err)
	}
}
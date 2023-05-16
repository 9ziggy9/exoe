package config

import (
	"bufio"
	"os"
	"strings"
)

func LoadEnv(envPath string) error {
	file, err := os.Open(envPath)
	if err != nil {
		return err
	}
	// CLOSE FILE AFTER RETURN
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "#") {
			parsed := strings.SplitN(line, "=", 2)
			if len(parsed) == 2 {
				os.Setenv(parsed[0], parsed[1])
			}
		}
	}
	return scanner.Err()
}

// Generalize to also take host in the future.
func BuildDSN(user string, db string, pass string, port string) string {
	return "host=localhost" +
		" user="+user+
		" password="+pass+
		" dbname="+db+
		" port="+port
}

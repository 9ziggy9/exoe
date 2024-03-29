package main

import (
	"fmt"
	"os"
	"errors"
	"net/http"
  "gorm.io/driver/postgres"
  "gorm.io/gorm"
	"github.com/9ziggy9/go-starter/config"
	"github.com/9ziggy9/go-starter/schema"
	"github.com/9ziggy9/go-starter/seeders"
	"github.com/9ziggy9/go-starter/auth"
	"github.com/9ziggy9/go-starter/symbols"
	"github.com/gin-gonic/gin"
	jwt "github.com/appleboy/gin-jwt/v2"
)

func main() {
	// HANDLE CLI ARGS
	arg, err := processArgs()
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: %s\n", err)
		os.Exit(1)
	}

	// LOAD ENV AND SET PORT
	if err := config.LoadEnv(".env"); err != nil {
		fmt.Fprintf(os.Stderr, "Error loading .env file: %s\n", err)
		os.Exit(1)
	}

	port := os.Getenv("PORT")
	if port == "" {
		fmt.Fprintf(os.Stderr, "Error loading port env variable.\n")
		os.Exit(1)
	}

	// OPEN DB CONNECTION
	// Generalize to also take host in the future.
	dsn := config.BuildDSN(
		os.Getenv("DB_USER"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_PORT"),
	)

	fmt.Printf("\n\nCONNECTING TO DB VIA DSN\n%s\n\n\n", dsn)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error opening DB connection: %s\n", err)
		os.Exit(1)
	}

	// TODO: replace with long opts
	switch arg {
	case "seed":
		db.AutoMigrate(&schema.User{})
		db.Create(seeders.Users)
	case "purge":
		db.Migrator().DropTable(&schema.User{})
		os.Exit(0)
	default:
		db.AutoMigrate(&schema.User{})
	}

	r := gin.Default()
	r.Static("/client", "./client")
	r.LoadHTMLGlob("./client/views/*.html")

	// LOAD TEMPLATES

	client := r.Group("/") // Client side --> HTML/JS entry point
	api := r.Group("/api")

	// Configure authorization middleware
	authMiddleware, err := auth.GenerateAuth("id", "secretkey")
	if err != nil {
		fmt.Fprintf(os.Stderr, "JWT ERROR: %s\n", err.Error())
		os.Exit(1)
	}
	if errInit := authMiddleware.MiddlewareInit(); errInit != nil {
		fmt.Fprintf(os.Stderr, "MiddlewareInit() error: %s\n", errInit.Error())
		os.Exit(1)
	}

	r.NoRoute(func(c *gin.Context) {
		claims := jwt.ExtractClaims(c)
		fmt.Printf("NoRoute claims: %#v\n", claims)
		c.HTML(http.StatusNotFound, "index.html", gin.H{
			"Title": "eXoE: Bad Route",
			"Page": "noexist",
		})
	})

	// CLIENT UNPROTECTED ROUTES
	client.GET("/unauthorized", func(c *gin.Context) {
		c.HTML(http.StatusUnauthorized, "index.html", gin.H{
			"Title": "eXoE: Unauthorized",
			"Page": "unauthorized",
		})
	})
	client.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"Title": "eXoE",
			"Page": "home",
		})
	})

	// CLIENT PROTECTED ROUTES
	client.Use(authMiddleware.MiddlewareFunc())
	{
		client.GET("/editor", func(c *gin.Context) {
			c.HTML(http.StatusOK, "index.html", gin.H{
				"Title": "eXoE",
				"Page": "editor",
			})
		})
	}

	// API UNPROTECTED ROUTES
	api.POST("/login", authMiddleware.LoginHandler)
	api.GET("/logout", authMiddleware.LogoutHandler)
	api.GET("/symbols-table", func(c *gin.Context) {
		c.JSON(http.StatusOK, symbols.Table)
	})


	// API PROTECTED ROUTES
	api.GET("/refresh_token", authMiddleware.RefreshHandler)
	api.Use(authMiddleware.MiddlewareFunc())
	{
		api.GET("/", func(c *gin.Context) {
			claims := jwt.ExtractClaims(c)
			c.JSON(http.StatusOK, gin.H{
				"userID": claims["id"],
				"text": "Hello, World!",
			})
		})
	}

	fmt.Printf("Attempting to listen on port %s...\n", port)
	if err := r.Run(":"+port); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to start server: %s\n", err)
		os.Exit(1)
	}
}

func processArgs() (string, error) {
	args := os.Args

	if len(args) == 1 {
		return "", nil
	}

	if len(args) > 2 {
		fmt.Fprintf(os.Stderr, "Warning: user supplied too many CLI args.\n")
		fmt.Println("API will only use the first provided.")
	}

	arg := args[1]

	validArgs := [2]string{"seed", "purge"}
	for _, validArg := range validArgs {
		if arg == validArg {
			return arg, nil
		}
	}
	return "", errors.New(fmt.Sprintf("Invalid arg provided -- %s\n", arg))
}

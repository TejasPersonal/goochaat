package main

import (
	"embed"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

//go:embed website/main.html
//go:embed website/static/*
var embeddedFiles embed.FS

func main() {
	users := []string{}
	messages := []string{}

	engine := gin.Default()

	staticFiles, _ := fs.Sub(embeddedFiles, "website/static")
	engine.StaticFS("/static", http.FS(staticFiles))

	engine.GET("/", func(context *gin.Context) {
		data, _ := embeddedFiles.ReadFile("website/main.html")
		context.Data(http.StatusOK, "text/html; charset=utf-8", data)
	})

	engine.POST("/", func(context *gin.Context) {
		body, error := io.ReadAll(context.Request.Body)
		if error != nil {
			return
		}
		users = append(users, context.ClientIP())
		messages = append(messages, string(body))
	})

	engine.GET("/message/:index", func(context *gin.Context) {
		index, error := strconv.Atoi(context.Param("index"))
		if error != nil {
			return
		}
		if index < len(messages) {
			fmt.Println("Index: ", index)
			context.JSON(200, gin.H{
				"user":    users[index],
				"message": messages[index],
			})
		} else {
			context.Status(204)
		}
	})

	engine.Run()
}

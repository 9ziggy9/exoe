package auth

import (
	"net/http"
	"time"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/gin-gonic/gin"
)

type login struct {
  Username string `form:"username" json:"username" binding:"required"`
  Password string `form:"password" json:"password" binding:"required"`
}

type User struct {
  UserName  string
  FirstName string
  LastName  string
}

// DOCUMENTATION: https://github.com/appleboy/gin-jwt
func GenerateAuth(
	identityKey string,
	secretKey string,
) (*jwt.GinJWTMiddleware, error) {
	return jwt.New(&jwt.GinJWTMiddleware{
		Realm:				 "test zone",
		Key:					 []byte(secretKey),
		Timeout:			 time.Hour,
		MaxRefresh:		 time.Hour,
		IdentityKey:	 identityKey,
		PayloadFunc: func(data interface{}) jwt.MapClaims{
			if v, ok := data.(*User); ok {
				return jwt.MapClaims{identityKey: v.UserName}
			}
			return jwt.MapClaims{}
		},
		IdentityHandler: func(c *gin.Context) interface{} {
			claims := jwt.ExtractClaims(c)
			return &User{UserName: claims[identityKey].(string)}
		},
		Authenticator: func(c *gin.Context) (interface{}, error) {
			var loginVals login
			if err := c.ShouldBind(&loginVals); err != nil {
				return "", jwt.ErrMissingLoginValues
			}
			userID := loginVals.Username
			password := loginVals.Password

			// HARDCODED VALUES
			if (userID == "ziggy" && password == "pass") {
				return &User{
					UserName: userID,
					LastName: "Zigs",
					FirstName: "ZIGGY",
				}, nil
			}
			return nil, jwt.ErrFailedAuthentication
		},
		Authorizator: func(data interface{}, c *gin.Context) bool {
			if v, ok := data.(*User); ok && v.UserName == "ziggy" {
				return true
			}
			return false
		},
		Unauthorized: func(c *gin.Context, code int, msg string) {
			c.JSON(code, gin.H{"code": code, "message": msg})
		},
		// TokenLookup is a string in the form of "<source>:<name>" that is used
			// to extract token from the request.
			// Optional. Default value "header:Authorization".
			// Possible values:
			// - "header:<name>"
			// - "query:<name>"
			// - "cookie:<name>"
			// - "param:<name>"
		TokenLookup: "header:Authorization, query:token, cookie: jwt",
		// TokenHeadName is a string in the header. Default value is "Bearer"
		TokenHeadName: "Bearer",
		TimeFunc: time.Now,

		// TODO: fix these issues
		SendCookie: true,
		SecureCookie: false, // MAKE THIS DEV/PROD DEPENDENT, false for dev
		CookieHTTPOnly: true,
		CookieDomain: "localhost:9001", // Pull from .env in future
		CookieSameSite: http.SameSiteDefaultMode,
	})
}

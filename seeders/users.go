package seeders

import (
	"github.com/9ziggy9/go-starter/schema"
  "golang.org/x/crypto/bcrypt"
)

var pass, _ = bcrypt.GenerateFromPassword([]byte("pass"), bcrypt.DefaultCost)

var Users []*schema.User = []*schema.User{
	&schema.User{Name: "ziggy", Password: string(pass)},
	&schema.User{Name: "charlie", Password: string(pass)},
	&schema.User{Name: "echo", Password: string(pass)},
}

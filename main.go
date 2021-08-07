package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"os"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// 5432 is the default postgre port

// Create a global sql.DB pointer, so that sql.DB object will not be created for every single funcion call
var db *sql.DB

// 不同的加密演算法需要不同長度的key，這點要先上網查一下
var secret = []byte(os.Getenv("JWT_SECRET"))

type User struct {
	Email    string `json:"email,omitempty"`
	Account  string `json:"account"`
	Password string `json:"password"`
}

type Claims struct {
	Account string `json:"account"`
	jwt.StandardClaims
}

type Response struct {
	Token string `json:"token"`
}

func registerHandler(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	u := User{}

	if err := decoder.Decode(&u); err != nil {
		fmt.Println("Error!")
		return
	}

	if !inputFieldsAreValid(u, "REGISTER") {
		w.WriteHeader(400)
		return
	}

	email := u.Email
	account := u.Account

	// hash the password before storing to database
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	hashedPasswordString := string(hashedPassword)

	// Write the user data to database
	insertStmt := `insert into "userinfo"("account", "password", "email") values($1, $2, $3)`

	_, err = db.Exec(insertStmt, account, hashedPasswordString, email)
	if err != nil {
		w.WriteHeader(400)
		Err := struct {
			Error string `json:"error"`
		}{
			Error: "email or account is already taken",
		}

		JSONByte, err := json.Marshal(Err)

		if err != nil {
			return
		}
		w.Write(JSONByte)
		return
	}

	token, err := generateToken(account)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	jsonByte, err := createJSONToken(token)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonByte)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)
	u := User{}

	if err := decoder.Decode(&u); err != nil {
		fmt.Println("Error!")
		w.WriteHeader(400)
		return
	}

	if !inputFieldsAreValid(u, "LOGIN") {
		w.WriteHeader(400)
		return
	}

	account := u.Account
	password := u.Password

	var storedPassword string

	queryStmt := `select password from userinfo where account = $1`
	rows, err := db.Query(queryStmt, account) //db.Query is sql injection free

	if err != nil {
		w.WriteHeader(500)
	}

	defer rows.Close()

	checkError(err)

	if rows.Next() {
		err := rows.Scan(&storedPassword)
		checkError(err)

		fmt.Println(storedPassword)

		err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(password))

		if err != nil {
			fmt.Println(storedPassword, password)
			fmt.Println("Wrong password.")
			w.WriteHeader(400)
		} else {
			// generate jwt token
			fmt.Println("Passwords are identical. Check passed...")

			token, err := generateToken(account)
			if err != nil {
				w.WriteHeader(500)
				return
			} else {
				// send data back to frontend
				jsonByte, err := createJSONToken(token)
				if err != nil {
					w.WriteHeader(500)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				w.Write(jsonByte)
			}
		}
	} else {
		w.WriteHeader(400)
	}
}

func changePasswordHandler(w http.ResponseWriter, r *http.Request) {

	token := r.Header.Get("Authorization")
	claims := &Claims{}

	// slice off the bearer part
	if len(token) < 7 {
		w.WriteHeader(400)
		return
	}
	token = token[7:]

	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})

	if err != nil {
		w.WriteHeader(400)
		return
	}

	type Password struct {
		Password string `json:"password"`
	}

	decoder := json.NewDecoder(r.Body)
	p := Password{}

	if err := decoder.Decode(&p); err != nil {
		w.WriteHeader(400)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	hashedPasswordString := string(hashedPassword)

	updateStmt := `update userinfo set password = $1 where account = $2`
	_, err = db.Exec(updateStmt, hashedPasswordString, claims.Account)

	if err != nil {
		w.WriteHeader(500)
		return
	}
}

func getAccountHandler(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("Authorization")
	claims := &Claims{}

	if len(token) < 7 {
		w.WriteHeader(400)
		return
	}

	token = token[7:]

	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		w.WriteHeader(400)
		return
	}

	accountJSON := struct {
		Account string `json:"account"`
	}{Account: claims.Account}

	w.Header().Set("Content-Type", "application/json")
	JSONByte, err := json.Marshal(accountJSON)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	w.Write(JSONByte)
}

func inputFieldsAreValid(u User, checkType string) bool {
	account := []rune(u.Account)
	password := []rune(u.Password)
	email := u.Email // mail.PareseAddress takes string type argument

	if len(account) > 10 || len(account) < 6 {
		return false
	}

	if len(password) > 10 || len(password) < 6 {
		return false
	}

	if checkType == "REGISTER" {
		_, err := mail.ParseAddress(email)

		if err != nil || len([]rune(email)) > 50 {
			return false
		}
	}

	return true
}

func generateToken(account string) (string, error) {
	expireTime := time.Now().Add(3000 * time.Second).Unix()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expireTime,
		},
		Account: account,
	})

	tokenString, err := token.SignedString(secret)

	if err != nil {
		fmt.Println(err)
		return "", err
	}

	return tokenString, nil
}

func createJSONToken(token string) ([]byte, error) {
	r := Response{
		Token: token,
	}

	JSONByteSlice, err := json.Marshal(r)
	if err != nil {
		return []byte{}, err
	}

	return JSONByteSlice, nil
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	var (
		host     = "localhost"
		port     = 5432
		user     = os.Getenv("POSTGRE_USER")
		password = os.Getenv("POSTGRE_PASSWORD")
		dbname   = os.Getenv("POSTGRE_DBNAME")
	)

	// Establish Postgre connection
	psqlconn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

	db, err = sql.Open("postgres", psqlconn)
	checkError(err)

	defer db.Close()

	err = db.Ping()
	checkError(err)
	fmt.Println("DB Connected!")

	r := mux.NewRouter()

	r.HandleFunc("/register", registerHandler).Methods("POST")
	r.HandleFunc("/login", loginHandler).Methods("POST")
	r.HandleFunc("/change-password", changePasswordHandler).Methods("POST")
	r.HandleFunc("/get-account", getAccountHandler).Methods("GET")

	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	http.ListenAndServe(":8080", handlers.CORS(headers, methods, origins)(r))
}

func checkError(err error) {
	if err != nil {
		panic(err)
	}
}

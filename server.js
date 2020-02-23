// configurando o servivor
const express = require("express")
const server = express()

// configurando o servidor para exibir arquivos estáticos
server.use(express.static("public"))

// Habilitar body do formulário
server.use(express.urlencoded({ extended: true }))

// Configurar a conexão com o banco de dados
const Pool = require('pg').Pool
const db = new Pool({
  user: 'postgres',
  password: '0000',
  host: 'localhost',
  port: 5432,
  database: 'blood_donation',
})

// configurando a template engine
const nunjuks = require("nunjucks")
nunjuks.configure("./", {
  express: server,
  noCache: true,
})

// Lista de doadores
// const donorsList = [
//   {
//     name: "Lucas Vieira",
//     blood: "AB+",
//   },
//   {
//     name: "Léa Teixeira",
//     blood: "O-",
//   },
//   {
//     name: "Matheus Vieira",
//     blood: "AB+",
//   },
//   {
//     name: "Silvana Vieira",
//     blood: "A+",
//   },
// ]

// configurando a apresentação da pagina
server.get("/", function (req, res) {
  db.query("SELECT * FROM donors", function(error, result) {
    if (error) return res.send("Erro no banco de dados!")

    const donorsList = result.rows

    donors = selectOnlyFour(donorsList)

    return res.render("index.html", { donors })
  })
})

server.post("/", function (req, res) {
  // pegar dados do formulário
  const name = req.body.name
  const email = validateEmail(req.body.email)
  const blood = validateBlood(req.body.blood)

  if (name == "" || email == "" || blood == "") {
    return res.send("Todos os campos são obrigatórios!")
  }

  if (email== null) {
    return res.send("ERRO: Informe um E-mail válido!")
  }

  if (blood == null) {
    return res.send("ERRO: Informe um tipo sanguíneo válido!")
  }

  // Inserindo valores no banco de dados
  const query = `
    INSERT INTO donors ("name", "email", "blood")
    VALUES ($1, $2, $3)`

  const values = [name, email, blood]

  db.query(query, values, function (error) {
    if (error) return res.send("Erro no banco de dados!")

    return res.redirect("/")
  })
})

// ligar o servidor e permitir acesso a porta 3000
server.listen(3000, function () {
  console.log("Server running!")
})

// Revertendo a lista e selectionando apenas os 4 últimos
function selectOnlyFour(donorsList){
  var donors = []

  if (!donorsList.isEmpty) donors.push(donorsList[donorsList.length-1])
  if (donorsList.length > 1) donors.push(donorsList[donorsList.length-2])
  if (donorsList.length > 2) donors.push(donorsList[donorsList.length-3])
  if (donorsList.length > 3) donors.push(donorsList[donorsList.length-4])

  return donors
}

function validateBlood (blood){
  if (blood == "AB+" || blood == "AB-"){
    return blood
  } else if (blood == "A+" || blood == "A-"){
    return blood
  } else if (blood == "B+" || blood == "B-"){
    return blood
  } else if (blood == "O+" || blood == "O-"){
    return blood
  }
  return null
}

function validateEmail (email){
  if ((email.endsWith(".com") || email.endsWith(".com.br")) && email.includes("@")){
    return email
  }
  return null
}
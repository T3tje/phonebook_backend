require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./modules/phonedb.js')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':body'))

/*
const getRandomId = () => {
  let actIds = persons.map(id => id = id.id)
  let randomNumber = Math.floor(Math.random()*3000)
  while (actIds.indexOf(randomNumber) !== -1) {
    randomNumber = Math.floor(Math.random()*3000)
  }
  return randomNumber
}
*/

let persons = []

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(result => {
      res.json(result)
      persons = result
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req,res,next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }
  if (persons.find(person => person.name === body.name)) {

    return res.status(400).json({
      error:'name already exists'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      persons.concat(savedPerson)
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (req,res,next) => {
  Person.find({})
    .then(result => {
      const date = new Date()
      res.status(200).send(`<p>Phonebook has info for ${result.length} people</p><p>${date}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req,res,next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id',(req,res,next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      persons = persons.filter(person => person.name !== result.name)
      res.status(204).end()
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (req,res,next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id,person,{ new:true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  if (error.name === 'ReferenceError') {
    return res.status(503).send({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
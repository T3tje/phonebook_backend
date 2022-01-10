const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number  = process.argv[4]
const url =
`mongodb+srv://fullstackopen:${password}@cluster0.mwzy7.mongodb.net/phonebook?retryWrites=true&w=majority`


mongoose.connect(url)


    
    const personSchema = new mongoose.Schema({
    name: String,
    number: Number
    })

    const Person = mongoose.model('Person', personSchema)

if (process.argv.length > 3) {
    const person = new Person({
    name: name,
    number: number
    })

    person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
    })
}

Person.find({}).then(result => {
    result.forEach(person => {
        console.log(person);
    })
    mongoose.connection.close()
})

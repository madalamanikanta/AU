/* eslint-env node */
// Simple seed script to insert one random sample User (profile filled, forms left empty)
require('dotenv').config()
const mongoose = require('mongoose')
const connectMongo = require('../config/mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const departments = ['Computer Science', 'Mechanical', 'Civil', 'Electronics', 'Pharmacy']
const designations = ['Assistant Professor', 'Associate Professor', 'Professor']
const names = ['Ananya', 'Rahul', 'Sneha', 'Vikram', 'Meera', 'Arjun', 'Divya', 'Karthik']
const surnames = ['Reddy', 'Sharma', 'Patel', 'Nair', 'Verma']

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomPhone = () => `+91-${Math.floor(9000000000 + Math.random() * 99999999)}`

async function run() {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) {
      console.error('Please set MONGO_URI in environment or .env file')
      process.exit(1)
    }

    await connectMongo()
    console.log('Connected to MongoDB')

    const sampleEmail = `hod.ai@anurag.edu.in`
    const password = `Test@12345`
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
      email: sampleEmail,
      passwordHash,
      isHod: false,
      role: 'FACULTY',
      profile: {
        employeeName: "Dr.Mallikarjuna Reddy",
        department: "Artificial Intelligence ",
        experienceYears: 10,
        designation: "HOD",
        contactNumber: randomPhone(),
      },
      forms: [],
    })

    await user.save()

    console.log('Sample user document inserted into `users` collection:')
    console.log(`  email: ${sampleEmail}`)
    console.log(`  password (plaintext for testing): ${password}`)
    console.log(`  id: ${user._id}`)

    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error('Failed to seed user:', err)
    try {
      await mongoose.connection.close()
    } catch (closeErr) {
      console.error('Also failed to close mongoose connection', closeErr)
    }
    process.exit(2)
  }
}

run()

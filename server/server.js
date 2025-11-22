require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')

const connectMongo = require('./config/mongoose')
const authRoutes = require('./routes/auth')
const formRoutes = require('./routes/form')
const hodRoutes = require('./routes/hod')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

// Serve uploaded proof files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/forms', formRoutes)
app.use('/api/hod', hodRoutes)

app.get('/', (req, res) => res.send({ ok: true, message: 'Self-appraisal server running' }))

async function start() {
  try {
    await connectMongo()
    console.log('Connected to MongoDB')
    app.use(errorHandler)
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()

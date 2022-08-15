const config = {
    production : {
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default : {
        SECRET: 'mysecretkey',
        DATABASE: 'mongodb://localhost:27017/socialApp'
    }
}


const get = (env) => {
    return config[env] || config.default
}

exports.get = get
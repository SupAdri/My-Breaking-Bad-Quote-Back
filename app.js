const express = require('express');
const cors = require('cors');
const app = express();

//config
app.use(express.json())
app.use(cors());

//data
var User = [
    {
        "token": "69",
        "name": "Admin",
        "isAdmin": true,
        "username": "@Admin",
        "password": "Admin123",
        "quote": {
            "quote": "La limonada es la base de todo",
            "author": "Diascamelini Singarini"
        }
    },
    {
        "name": "Adrián Hernández",
        "username": "hcrespo",
        "password": "qqqqqqqq",
        "isAdmin": true,
        "quote": {
            "quote": "We tried to poison you. We tried to poison you because you are an insane, degenerate piece of filth and you deserve to die.",
            "author": "Walter White"
        },
        "token": "0.8000220200236516"
    },
    {
        "name": "Huevo duro",
        "username": "elhuevo",
        "password": "qqqqqqqq",
        "isAdmin": false,
        "quote": {
            "quote": "Fifty years I spent like that. Finding myself awake at three in the morning. But you know what? Ever since my diagnosis, I sleep just fine.",
            "author": "Walter White"
        },
        "token": "0.3878030576204553"
    },
    {
        "name": "Rosa Melano",
        "username": "rosita",
        "password": "qqqqqqqq",
        "isAdmin": false,
        "quote": {
            "quote": "You can never trust a drug addict.",
            "author": "Gustavo Fring"
        },
        "token": "0.6455704024074035"
    },
    {
        "name": "Armando Casas",
        "username": "gaytu",
        "password": "qqqqqqqq",
        "isAdmin": false,
        "quote": {
            "quote": "Tight. Tight. Tight.",
            "author": "Tuco Salamanca"
        },
        "token": "0.1376123303670721"
    }
]

//rutas

//para enviar el feed de quotes
app.get('/api/feed', (req, res) => {
    res.send(getFeed());
});

/////////////////////___USER___//////////////////////

//para logear un usuario
app.post('/api/user', (req, rep) => {

    const { username, password } = req.body
    const user = getUser(username, password)
    user ?
        rep.send(user)
        :
        rep.status(404).send({ message: 'Usuario o contraseña incorecta.' })
})

//para comprobar si existe el usuatrio
app.get('/api/user/existe/:username', (req, res) => {
    res.send({ comprobate: comprobateUser(req.params.username) });
});

//para crear un nuevo usuario
app.post('/api/user/create', (req, res) => {
    const user = req.body

    if (comprobateUser(user.username)) {
        User.push({
            ...user,
            token: Math.random(0, 999999),
        })
        res.send(getUser(user.username, user.password))
    } else {
        res.status(404).send({ message: 'El usuario ya existe' })
    };
});

//para editar un usuario
app.post('/api/user/edit', (req, res) => {
    const user = req.body
    for (let index = 0; index < User.length; index++) {
        if (user.token == User[index].token) {
            if (comprobateUser(user.username) | user.username == User[index].username) {
                User[index] = {
                    ...User[index],
                    ...user
                }
                res.send(getUser(User[index].username, User[index].password))
            } else {
                res.status(404).send({ message: 'El nombre de usuario ya existe' })
            };
        }
    }
});

////////////////////////////___END_USER___///////////////

//////////////////////////////////////___ADMIN___////////////////////////

//para agregar un usuario siendo admin
app.post('/api/admin/user/create', (req, res) => {

    const token = req.headers["authorization"];
    const user = req.body

    if (!comprobateUser(user.username)) {
        res.status(404).send({ message: 'El nombre de usuario ya existe' })
        return 0
    }

    if (isAdmin(token)) {
        User.push({
            ...user,
            token: Math.random(0, 999999).toString(),
        })
        res.send({ message: 'Usuario agregado correctamente' })
    } else {
        res.status(404).send({ message: 'Usuario no autorizado' })
    }

})

//para entregar los usuarios a los admins
app.get('/api/admin/users', (req, res) => {

    const token = req.headers["authorization"];
    if (isAdmin(token)) {
        var users = [...User]
        users.splice(getPositionForToken(token), 1)
        res.send(users)
    } else {
        res.status(404).send({ message: 'Usuario no autorizado' })
    }

})

//para modificar un usuario siendo admin
app.post('/api/admin/user/edit', (req, res) => {

    const token = req.headers["authorization"];
    const user = req.body

    if (!comprobateUser(user.username) && user.username != User[getPositionForToken(user.token)].username) {
        res.status(404).send({ message: 'El nombre de usuario ya existe' })
        return 0
    }

    if (isAdmin(token)) {
        User[getPositionForToken(user.token)] = {
            ...User[getPositionForToken(user.token)],
            ...user
        }
    } else {
        res.status(404).send({ message: 'Usuario no autorizado' })
        return 0
    }

    res.send({ message: 'Usuario actualizado exitosamente' })
})

//para modificar un usuario siendo admin
app.post('/api/admin/user/delete', (req, res) => {

    const token = req.headers["authorization"];
    const user = req.body

    if (comprobateUser(user.username)) {
        res.status(404).send({ message: 'El usuario no existe' })
        return 0
    }

    if (isAdmin(token)) {
        User.splice(getPositionForToken(user.token), 1)
    } else {
        res.status(404).send({ message: 'Usuario no autorizado' })
        return 0
    }

    res.send({ message: 'Usuario eliminado exitosamente' })
})

///////////////////////////___END_ADMIN___/////////////////////////

//funciones
//arr.splice(1, 2);
function getFeed() {
    var feed = []
    for (let index = 0; index < User.length; index++) {
        feed.push({
            name: User[index].name,
            username: User[index].username,
            quote: User[index].quote
        })
    }
    return feed
}

function getUser(username, password) {
    for (let index = 0; index < User.length; index++) {
        if (username == User[index].username && password == User[index].password) {
            return {
                token: User[index].token,
                name: User[index].name,
                username: User[index].username,
                isAdmin: User[index].isAdmin,
                quote: User[index].quote
            }
        }
    }
    return null
}

function comprobateUser(username) {
    var x = 0
    for (let index = 0; index < User.length; index++) {
        if (username == User[index].username) {
            x++
        }
    }
    return x == 0
}

function isAdmin(token) {
    for (let index = 0; index < User.length; index++) {
        if (token == User[index].token && User[index].isAdmin) {
            return true
        }

    }
    return false
}

function getPositionForToken(token) {
    for (let index = 0; index < User.length; index++) {
        if (token == User[index].token) {
            return index
        }
    }
    return null
}


//debug

app.get('/api/quote', (req, res) => {
    res.send([{
        quote: 'Yo ando enfermo de los nervios',
        author: "el rey del reparto"
    }])
});

app.get('/api/user/todes', (req, res) => {
    res.send(User)
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor corriendo en http://localhost:' + (process.env.PORT || 3000));
});

//ljasdlkj a ver si se actualiza q no se quiere actualizar
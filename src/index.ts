import express, {Request, Response} from "express";
import mysql from "mysql2/promise";

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Categorias

app.get('/categories', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM categories");
    return res.render('system/index', {
        categories: rows
    });
});

app.get("/categories/form", async function (req: Request, res: Response) {
    return res.render("system/formCategories");
});

app.post("/categories/save", async function(req: Request, res: Response) {
    const body = req.body;
    const insertQuery = "INSERT INTO categories (name) VALUES (?)";
    await connection.query(insertQuery, [body.name]);

    res.redirect("/categories");
});

app.post("/categories/delete/:id", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM categories WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/categories");
});


//Usuario

app.get('/users/add', function(req: Request, res: Response){
    return res.render('system/formUser');
});

app.post('/users', async function (req: Request, res: Response) {    
    const body = req.body;
    const insertQuery = 'INSERT INTO users (name, email, password, role, active) VALUES (?,?,?,?,?)';
    console.log(body);
    let active = false;

    if(body.active === 'on') {
        active = true;
    }

    await connection.query(insertQuery, [body.name, body.email, body.password, body.role, active]);

    res.redirect('/users');
});

app.get('/users', async function(req: Request, res: Response){
    const [rows] = await connection.query("SELECT * FROM users");
    return res.render('system/listUser', {
        users: rows
    });
});

app.post('/users/delete/:id', async function(req: Request, res: Response){
    const id = req.params.id;
    const sqlDelete = "DELETE FROM users WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/users");
});


//Login

app.get('/login', function name(req: Request, res: Response) {
    return res.render('system/login');
})

app.post('/login', async function (req: Request, res: Response) {
    const body = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    
    try {
        const [rows] = await connection.query<any[]>(query, [body.email, body.password]);

        if (rows.length === 0) {
            return res.render('system/login', { error: 'Usuário ou senha inválidos!' });
        }

        res.redirect('/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.get('/', function (req: Request, res: Response){
    return res.render('system/initialPage');
});


app.listen('3000', () => console.log("Server is listening on port 3000: http://localhost:3000/"));
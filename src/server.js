import 'dotenv/config'
import express from 'express';
import multer from 'multer';
import { extname } from 'path';
import crypto from 'crypto';
import jwt  from 'jsonwebtoken';
import { ProductService } from './services/product.service.js';

import { UserService } from './services/user-service.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

//aqui está a configuração para que o express rode
const app = express();
const port = 3000;

//aqui é para comfigurar o multer, um middlewere para subir imagens no banco de dados
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) =>{
    //aqui é para gerar um id único em hexadecimal para ser usado como nome da imagem usando o CRYPTO 
    const newFilename = crypto.randomBytes(32).toString('hex');
    const filenameExtension = extname(file.originalname);
    cb(null, `${newFilename}${filenameExtension}`);
  }
});

const uploadMiddleware = multer({storage: storageConfig});

//esssa configuração é para que o código possa aceitar arquivos .json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//esse é o retorno ao acessar o https://localhost:3000
app.get('/', async (req, res) => {
  res.send('IMAGINE SHOP');

});

app.post('/products', uploadMiddleware.single('image'), async (req, res) =>{

  const {name, description, price, summary, stock, fileName} = req.body;
  const productService = new ProductService();
  const product = {
    name,
    description,
    price,
    summary,
    stock,
    fileName: req.file.filename
  };
  await productService.add(product);
  return res.status(201).json({message: 'sucess'});
} );

app.get('/products', async (req, res) =>{
  const productService = new ProductService();
  const products = await productService.findAll();
  return res.status(200).json(products);
});

// aqui vai ser para criar novos usuarios 
app.post('/users', async (req, res) =>{

    const {name, email, password} = req.body;
    const user = {name, email, password};
    const userServices = new UserService();
    await userServices.create(user);

  return res.status(201).json(user);
} );



//aqui é para ser feito o login autenticando com um token
app.post('/login', async (req, res) =>{
  const {email, password} = req.body;
  const userService = new UserService();
  const userLogged = await userService.login(email, password);
  if(userLogged){
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign({user: userLogged}, secretKey, {expiresIn: "3600s"});
    return res.status(200).json({token});
  }
  return res.status(400).json({message: 'E-mail ou senha invalidos.'})
});

app.use(authMiddleware);

// aqui é para acessar todos os usuarios
app.get('/users', async (req, res) =>{
    const userServices = new UserService();
    const user = await userServices.findAll();
    return res.status(200).json(user);
})

//aqui é para acessar um único usuario com base em um parametro definido pelo ID
app.get('/users/:id', authMiddleware, async (req, res) =>{
    const id = req.params.id;
    const userServices = new UserService();
    const user = await userServices.find(id);
    if(user){
        return res.status(200).json(user);
       
    }
    return res.status(404).json({message: 'Usuario não encontrado.'})
    

})

// aqui sera criado o DELETE para deletar usuarios únicos com base no ID
app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  const userService = new UserService();
  try {
    await userService.delete(id);
    return res.status(200).json({ message: 'success' });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// aqui é o codigo para atualizar os dados do usuario
app.put('/users/:id', async (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;
  const user = { name, email, password };
  const userService = new UserService();
  try {
    await userService.update(id, user);
    return res.status(200).json({ message: 'success' });
  } catch (error) {
    return res.status(404).json({ message: error.message })
  }
});

app.listen(port, () => {
  console.log(`Example app listening on https://localhost:${port}`)
})


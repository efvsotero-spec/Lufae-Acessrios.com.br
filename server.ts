import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { PRODUCTS, CATEGORIES } from './src/data/products.ts';
import {
  WHATSAPP_PHONE,
  WHATSAPP_DISPLAY,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from './src/utils/formatters.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 25MB limit for image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Paths
const DATA_DIR = path.resolve('data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const UPLOADS_DIR = path.resolve('public/uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// --------------------------------------------------------------------------
// HASHING & AUTH UTILITIES
// --------------------------------------------------------------------------
function hashPassword(password: string, salt?: string) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512')
    .toString('hex');
  return { hash, salt: generatedSalt };
}

function verifyPassword(password: string, hash: string, salt: string) {
  const check = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
}

// Initialize Auth Database if not exists or if ADM is missing
function ensureAuthInitialized() {
  let authData = { users: [] as any[], activeTokens: {} as Record<string, any> };
  if (fs.existsSync(AUTH_FILE)) {
    try {
      authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    } catch {
      authData = { users: [], activeTokens: {} };
    }
  }

  const hasAdm = authData.users.some(
    (u: any) => u.username?.toUpperCase() === 'ADM' || u.id === 'usr-admin'
  );

  if (!hasAdm) {
    const initialAdmin = hashPassword('administração 2026');
    const defaultUser = {
      id: 'usr-admin',
      username: 'ADM',
      email: 'admin@lufaeacessorios.com.br',
      name: 'Administradora Lufae',
      hash: initialAdmin.hash,
      salt: initialAdmin.salt,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
    };
    authData.users = [
      defaultUser,
      ...authData.users.filter((u: any) => u.id !== 'usr-1' && u.username !== 'ADM'),
    ];
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2), 'utf-8');
  }
}

ensureAuthInitialized();

// Initialize Store Database if not exists
if (!fs.existsSync(STORE_FILE)) {
  const initialStore = {
    products: PRODUCTS.map((p) => ({
      ...p,
      descricao: '',
      imagensComplementares: [] as string[],
      status: 'publicado', // 'publicado' | 'oculto' | 'indisponivel'
      destaque: p.badge === 'Best Seller',
    })),
    categories: CATEGORIES,
    settings: {
      nomeLoja: 'Lufae Acessórios',
      assinatura: 'Luiza Leal',
      whatsappPhone: WHATSAPP_PHONE,
      whatsappDisplay: WHATSAPP_DISPLAY,
      instagramHandle: INSTAGRAM_HANDLE,
      instagramUrl: INSTAGRAM_URL,
      tagline:
        'Realce sua beleza e sofisticação com peças feitas para brilhar em todas as ocasiões.',
      logoUrl: '/logo.svg',
      pagamento: 'Pix Instantâneo; Cartões de Crédito / Débito',
      envio: 'Enviamos para todo o Brasil',
      mensagemAtendimento:
        'Estamos prontas para atender você com todo o carinho e atenção.',
    },
  };
  fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
}

// Helper to read / write store
function getStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch (err) {
    console.error('Erro ao ler store.json:', err);
    return { products: [], categories: [], settings: {} };
  }
}

function saveStore(data: any) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getAuth() {
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
  } catch (err) {
    return { users: [], activeTokens: {} };
  }
}

function saveAuth(data: any) {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// --------------------------------------------------------------------------
// AUTH MIDDLEWARE
// --------------------------------------------------------------------------
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Acesso não autorizado. Faça login para continuar.' });
  }

  const token = authHeader.split(' ')[1];
  const authData = getAuth();
  const session = authData.activeTokens[token];

  if (!session) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
  }

  (req as any).user = session;
  next();
}

// --------------------------------------------------------------------------
// PUBLIC ROUTES
// --------------------------------------------------------------------------
// Serve public static assets
app.use(express.static('public'));

app.get('/api/public/store', (req: Request, res: Response) => {
  const store = getStore();
  // Filter only published products for public store
  const publicProducts = store.products.filter(
    (p: any) => p.status === 'publicado'
  );
  res.json({
    products: publicProducts,
    categories: store.categories,
    settings: store.settings,
  });
});

// --------------------------------------------------------------------------
// AUTH ROUTES
// --------------------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const identifier = (req.body.login || req.body.username || req.body.email || '').trim().toLowerCase();
  const password = req.body.password;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: 'Usuário e senha são obrigatórios.' });
  }

  const authData = getAuth();
  const user = authData.users.find(
    (u: any) =>
      (u.username && u.username.toLowerCase() === identifier) ||
      (u.email && u.email.toLowerCase() === identifier)
  );

  if (!user || !verifyPassword(password, user.hash, user.salt)) {
    // Discreet error message without revealing which field was incorrect
    return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  authData.activeTokens[token] = {
    userId: user.id,
    username: user.username || 'ADM',
    email: user.email,
    name: user.name,
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: new Date().toISOString(),
  };
  saveAuth(authData);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username || 'ADM',
      email: user.email,
      name: user.name,
      mustChangePassword: Boolean(user.mustChangePassword),
    },
  });
});

app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const authData = getAuth();
    delete authData.activeTokens[token];
    saveAuth(authData);
  }
  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const session = (req as any).user;
  const authData = getAuth();
  const user = authData.users.find((u: any) => u.id === session.userId);
  res.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username || user?.username || 'ADM',
      email: session.email || user?.email,
      name: session.name || user?.name || 'Administrador',
      mustChangePassword: user ? Boolean(user.mustChangePassword) : false,
    },
  });
});

app.post('/api/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      error: 'A nova senha deve ter no mínimo 8 caracteres.',
    });
  }

  const userSession = (req as any).user;
  const authData = getAuth();
  const userIndex = authData.users.findIndex(
    (u: any) => u.id === userSession.userId
  );

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const user = authData.users[userIndex];
  if (!verifyPassword(currentPassword, user.hash, user.salt)) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  const updated = hashPassword(newPassword);
  authData.users[userIndex].hash = updated.hash;
  authData.users[userIndex].salt = updated.salt;
  authData.users[userIndex].mustChangePassword = false;

  const currentToken = req.headers.authorization?.split(' ')[1];
  if (currentToken && authData.activeTokens[currentToken]) {
    authData.activeTokens[currentToken].mustChangePassword = false;
  }

  saveAuth(authData);

  res.json({ success: true, message: 'Senha atualizada com sucesso!' });
});

// --------------------------------------------------------------------------
// ADMIN PRODUCTS ROUTES
// --------------------------------------------------------------------------
app.get('/api/admin/products', requireAuth, (req: Request, res: Response) => {
  const store = getStore();
  res.json(store.products);
});

app.post('/api/admin/products', requireAuth, (req: Request, res: Response) => {
  const productData = req.body;
  if (!productData.nome || !productData.preco || !productData.categoria) {
    return res
      .status(400)
      .json({ error: 'Nome, preço e categoria são campos obrigatórios.' });
  }

  const store = getStore();
  const id =
    productData.id?.trim() ||
    `P-${Date.now().toString(36).toUpperCase()}`;

  // Check unique ID
  if (store.products.some((p: any) => p.id === id)) {
    return res.status(400).json({ error: `O ID ${id} já está em uso.` });
  }

  const newProduct = {
    id,
    categoria: productData.categoria,
    nome: productData.nome,
    material: productData.material || '',
    tamanho: productData.tamanho || '',
    aro: productData.aro || '',
    preco:
      typeof productData.preco === 'number'
        ? productData.preco
        : parseFloat(productData.preco) || 0,
    badge: productData.badge || '',
    imagem: productData.imagem || '/produtos/BR-01.webp',
    imagensComplementares: productData.imagensComplementares || [],
    revisar: productData.revisar || [],
    tipoPeca: productData.tipoPeca || 'brinco',
    descricao: productData.descricao || '',
    status: productData.status || 'publicado',
  };

  store.products.unshift(newProduct);
  saveStore(store);

  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/admin/products/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const store = getStore();

  const index = store.products.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }

  const current = store.products[index];
  const safePreco =
    updateData.preco !== undefined
      ? typeof updateData.preco === 'number'
        ? updateData.preco
        : parseFloat(updateData.preco) || 0
      : current.preco;

  const updatedProduct = {
    ...current,
    ...updateData,
    id: current.id, // ID cannot be mutated to preserve catalog integrity
    preco: safePreco,
  };

  store.products[index] = updatedProduct;
  saveStore(store);

  res.json({ success: true, product: updatedProduct });
});

app.delete('/api/admin/products/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const store = getStore();

  const index = store.products.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }

  const removed = store.products.splice(index, 1);
  saveStore(store);

  res.json({ success: true, message: `Produto ${id} removido.`, product: removed[0] });
});

// --------------------------------------------------------------------------
// ADMIN IMAGES & LOGO ROUTES
// --------------------------------------------------------------------------
app.post('/api/admin/upload-image', requireAuth, (req: Request, res: Response) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data || !filename) {
      return res.status(400).json({ error: 'Arquivo ou nome não fornecido.' });
    }

    // Validate size (max 10MB)
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato base64 inválido.' });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Arquivo excede o limite máximo de 10MB.' });
    }

    const ext = path.extname(filename) || (mimeType === 'image/png' ? '.png' : '.webp');
    const safeName = `${Date.now()}-${path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({ success: true, url: publicUrl, filename: safeName });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Falha ao salvar a imagem no servidor.' });
  }
});

app.post('/api/admin/logo', requireAuth, (req: Request, res: Response) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Dados do logotipo não fornecidos.' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato base64 inválido.' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const timestamp = Date.now();
    const logoFile = `logo-${timestamp}.png`;
    const logoBackupPath = path.join(UPLOADS_DIR, logoFile);
    fs.writeFileSync(logoBackupPath, buffer);

    // Also overwrite public/logo.png
    fs.writeFileSync(path.resolve('public/logo.png'), buffer);

    // Update settings in store
    const store = getStore();
    store.settings.logoUrl = `/logo.png?v=${timestamp}`;
    saveStore(store);

    res.json({
      success: true,
      message: 'Logotipo atualizado com sucesso em todos os locais da loja!',
      url: store.settings.logoUrl,
    });
  } catch (err: any) {
    console.error('Logo update error:', err);
    res.status(500).json({ error: 'Falha ao atualizar o logotipo.' });
  }
});

app.get('/api/admin/gallery', requireAuth, (req: Request, res: Response) => {
  try {
    const images: any[] = [];
    // Read uploads
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      for (const file of files) {
        const stats = fs.statSync(path.join(UPLOADS_DIR, file));
        images.push({
          url: `/uploads/${file}`,
          name: file,
          size: stats.size,
          updatedAt: stats.mtime,
          folder: 'uploads',
        });
      }
    }

    // Read products folder
    const productsDir = path.resolve('public/produtos');
    if (fs.existsSync(productsDir)) {
      const files = fs.readdirSync(productsDir);
      for (const file of files) {
        const stats = fs.statSync(path.join(productsDir, file));
        images.push({
          url: `/produtos/${file}`,
          name: file,
          size: stats.size,
          updatedAt: stats.mtime,
          folder: 'produtos',
        });
      }
    }

    res.json(images);
  } catch (err: any) {
    res.status(500).json({ error: 'Falha ao listar imagens da galeria.' });
  }
});

// --------------------------------------------------------------------------
// ADMIN SETTINGS & CATEGORIES ROUTES
// --------------------------------------------------------------------------
app.get('/api/admin/settings', requireAuth, (req: Request, res: Response) => {
  const store = getStore();
  res.json({ settings: store.settings, categories: store.categories });
});

app.put('/api/admin/settings', requireAuth, (req: Request, res: Response) => {
  const { settings, categories } = req.body;
  const store = getStore();

  if (settings) {
    store.settings = { ...store.settings, ...settings };
  }
  if (categories && Array.isArray(categories)) {
    store.categories = categories;
  }

  saveStore(store);
  res.json({ success: true, message: 'Configurações atualizadas com sucesso!', store });
});

// --------------------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC PROD
// --------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Lufae Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

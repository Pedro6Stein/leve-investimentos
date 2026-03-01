import 'dotenv/config';
import { app } from './app';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});

if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
}
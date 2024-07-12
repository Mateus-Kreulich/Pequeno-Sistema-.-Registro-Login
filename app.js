const fs = require('fs');
const readline = require('readline');

// Função para ler o arquivo JSON
const readJSON = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// Função para escrever no arquivo JSON
const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Função para validar o JSON usando as regras do arquivo enforce
const validateJSON = (data, rules) => {
  const errors = [];
  for (const [key, rule] of Object.entries(rules)) {
    if (rule.required && !data.hasOwnProperty(key)) {
      errors.push(`${key} é obrigatório.`);
    } else if (rule.type && typeof data[key] !== rule.type) {
      errors.push(`${key} deve ser do tipo ${rule.type}.`);
    } else if (rule.minLength !== undefined && data[key].length < rule.minLength) {
      errors.push(`${key} deve ter pelo menos ${rule.minLength} caracteres.`);
    }
  }
  return errors;
};

// Caminhos dos arquivos
const usersPath = './users.json';
const enforcePath = './validate.enforce';
const configPath = './config.papyros';

// Leitura dos arquivos
const users = readJSON(usersPath);
const enforceRules = readJSON(enforcePath);
const config = readJSON(configPath);

// Interface de linha de comando para interação com o usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(config.messages.welcome);

const menu = () => {
  console.log('1. Registrar');
  console.log('2. Login');
  console.log('3. Sair');
  rl.question('Escolha uma opção: ', (option) => {
    if (option === '1') {
      registerUser();
    } else if (option === '2') {
      loginUser();
    } else if (option === '3') {
      rl.close();
    } else {
      console.log('Opção inválida. Por favor, tente novamente.');
      menu();
    }
  });
};

const registerUser = () => {
  rl.question('Nome de usuário: ', (username) => {
    rl.question('Senha: ', (password) => {
      const newUser = { username, password };
      const validationErrors = validateJSON(newUser, enforceRules.register);
      
      if (validationErrors.length > 0) {
        console.error(config.messages.validation_errors, validationErrors);
        menu();
      } else {
        users.push(newUser);
        writeJSON(usersPath, users);
        console.log(config.messages.register_success);
        menu();
      }
    });
  });
};

const loginUser = () => {
  rl.question('Nome de usuário: ', (username) => {
    rl.question('Senha: ', (password) => {
      const user = users.find(user => user.username === username && user.password === password);
      
      if (user) {
        console.log(config.messages.login_success);
      } else {
        console.log(config.messages.login_fail);
      }
      menu();
    });
  });
};

menu();

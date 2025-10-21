# 🌧️ Garoinha

**Previsão leve e certeira**

Aplicativo web de previsão do tempo com interface moderna e intuitiva, desenvolvido em JavaScript puro com a API Open-Meteo.

![Garoinha](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Funcionalidades

### 🎯 Principais
- ✅ Busca de clima por nome da cidade
- ✅ Autocomplete inteligente com sugestões em tempo real
- ✅ Dados meteorológicos detalhados:
  - Temperatura atual e sensação térmica
  - Umidade relativa do ar
  - Velocidade e direção do vento
  - Condições climáticas com ícones
  - Precipitação, pressão atmosférica e cobertura de nuvens

### 🚀 Avançadas
- ✅ **Cache inteligente**: Reduz requisições à API (10min de validade)
- ✅ **Histórico de buscas**: Salva últimas 5 cidades pesquisadas
- ✅ **Última busca**: Carrega automaticamente ao abrir (se < 24h)
- ✅ **Navegação por teclado**: Use setas para navegar no autocomplete
- ✅ **Atalho rápido**: `Ctrl/Cmd + K` para focar na busca
- ✅ **Timeout de requisições**: Evita travamentos em conexões lentas
- ✅ **Debounce**: Otimiza busca de sugestões
- ✅ **Cores dinâmicas**: Gradiente muda baseado no clima
- ✅ **Animações suaves**: Interface fluida e moderna
- ✅ **Geolocalização**: Busca clima da localização atual (em desenvolvimento)

## 🗂️ Estrutura do Projeto

```
garoinha/
│
├── index.html           # Estrutura HTML
│
├── css/
│   └── style.css        # Estilos e animações
│
└── js/
    ├── config.js        # Configurações e constantes
    ├── utils.js         # Funções utilitárias
    ├── api.js           # Gerenciamento de API e cache
    ├── ui.js            # Manipulação da interface
    └── app.js           # Lógica principal e inicialização
```

## 🛠️ Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com gradientes e animações
- **JavaScript ES6+** - Código modular e assíncrono
- **Open-Meteo API** - Dados meteorológicos gratuitos
- **LocalStorage** - Persistência de dados
- **Fetch API** - Requisições HTTP

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/garoinha.git
cd garoinha
```

2. Abra o `index.html` no navegador:
```bash
# No Linux/Mac
open index.html

# No Windows
start index.html
```

Não há dependências externas! O projeto roda diretamente no navegador.

## 🎮 Como Usar

### Busca Básica
1. Digite o nome de uma cidade no campo de busca
2. Selecione uma sugestão ou pressione Enter
3. Visualize os dados meteorológicos

### Atalhos de Teclado
- `Enter` - Buscar cidade
- `↑/↓` - Navegar nas sugestões
- `Esc` - Fechar autocomplete
- `Ctrl/Cmd + K` - Focar no campo de busca

### Console do Navegador
Funções úteis disponíveis via `window.garoinha`:

```javascript
// Limpar cache e histórico
garoinha.clearData()

// Buscar por geolocalização
garoinha.getByLocation()

// Ver versão
garoinha.version
```

## ⚙️ Configurações

Edite `js/config.js` para personalizar:

- **Cache**: Duração do cache (padrão: 10min)
- **Histórico**: Número de cidades recentes (padrão: 5)
- **Timeout**: Tempo máximo de requisição (padrão: 10s)
- **Debounce**: Delay do autocomplete (padrão: 300ms)

## 🎨 Personalização

### Cores
Edite as variáveis no `css/style.css`:
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Ícones de Clima
Adicione ou modifique em `js/config.js`:
```javascript
WEATHER_CODES: {
  0: { desc: 'Céu limpo', icon: '☀️', color: '#FFD700' }
}
```

## 🐛 Debug

Mensagens de log disponíveis no console:
- Inicialização do app
- Dados do clima carregados
- Erros de API
- Cache limpo

## 📱 Responsividade

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

## 🔒 Privacidade

- ✅ Sem cookies de terceiros
- ✅ Dados salvos apenas localmente (LocalStorage)
- ✅ API sem necessidade de autenticação
- ✅ Sem tracking ou analytics

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Créditos

- **API**: [Open-Meteo](https://open-meteo.com/) - Dados meteorológicos gratuitos
- **Fontes**: [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
- **Ícones**: Emojis Unicode

## 📞 Contato

Criado por [Seu Nome] - [seu-email@exemplo.com]

---

**Garoinha** - Desenvolvido com ☕ e 🌧️ no Brasil

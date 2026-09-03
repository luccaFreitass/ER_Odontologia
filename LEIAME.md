# ER Odontologia Avançada, site institucional

Site estático de página única. Sem build, sem dependência externa: basta subir a pasta em qualquer hospedagem.

## Estrutura

```
index.html            página completa
assets/css/style.css  estilos (tokens de cor no topo, em :root)
assets/js/main.js     animações de scroll, menu, contadores e formulário
assets/img/           imagens já tratadas, recortadas e convertidas para webp
assets/fonts/         Lora e Inter hospedadas localmente
Images/               originais enviados pela cliente, não usados pelo site
```

## Como testar

Abra `index.html` no navegador. Para ver as fontes e o mapa carregando como em produção, use um servidor local:

```
python -m http.server 8000
```

e acesse `http://localhost:8000`.

## O que trocar quando for publicar

1. `index.html`, tag `<link rel="canonical">` e `og:url`: colocar o domínio real.
2. Bloco `application/ld+json` no `<head>`: conferir endereço, telefone e horário.
3. Rodapé: confirmar o responsável técnico e o número EPAO com a clínica.
4. As imagens do WhatsApp foram recortadas para o site. Se a clínica enviar fotos em alta, basta substituir os arquivos em `assets/img/` mantendo os mesmos nomes.

## Personalização rápida

Todas as cores estão em `:root` no início do `style.css`. Trocar `--gold`, `--gold-lt` e `--ink` muda a identidade do site inteiro.

## Direção visual

Tema claro único. Fundo em branco quente quase neutro (`--paper` `#FCFCFA`), faixas alternadas em greige (`--paper-2` `#F2F2EE`), tinta profunda no texto (`--ink`) e o dourado da marca (`--gold`) apenas como acento fino: filete das etiquetas, ícones e detalhes. Botões são sólidos em tinta, sem gradiente dourado. O único bloco escuro da página é o rodapé.

Formas: arco nos retratos da equipe, 24px nos painéis grandes de imagem, 14px em cards e campos, pill nos botões. Tipografia Lora nos títulos e Inter no texto.

### Trocar as fotos dos avaliadores

Cada depoimento usa um círculo com as iniciais no lugar da foto de perfil do Google. Para colocar a foto real, basta trocar o conteúdo do `<span class="gavatar">` por uma imagem:

```html
<span class="gavatar"><img src="assets/img/avatar-julia.webp" alt=""></span>
```

A imagem preenche o círculo automaticamente. O atributo `style="--av:#A98B45"` só define a cor de fundo quando não há foto.

## Interações da página

Todas escritas em CSS e JavaScript puro, sem biblioteca:

- **Antes e depois**: comparador cujo divisor persegue o cursor com amortecimento e volta ao centro ao sair. Arrasta no celular e tem um controle de teclado invisível para acessibilidade.
- **Tratamentos**: filtro por especialidade em abas, com cartões que sobem no hover e botão que gira 45 graus abrindo o WhatsApp já com o tratamento na mensagem.
- **Galeria da odontopediatria**: a faixa em foco expande e as demais escurecem. No celular vira carrossel com encaixe.
- **Perguntas frequentes**: acordeão com abertura suave, uma pergunta aberta por vez.
- **Faixa de números**: dígitos rolantes que giram até o valor final quando entram na tela.

## Acessibilidade e performance

- Tema escuro único, contraste conferido nos textos e botões.
- Respeita `prefers-reduced-motion` e `prefers-reduced-transparency`.
- Imagens em webp com `loading="lazy"`, fontes com `font-display: swap`.
- Nenhum script de terceiros, nenhuma requisição externa além do mapa do Google.

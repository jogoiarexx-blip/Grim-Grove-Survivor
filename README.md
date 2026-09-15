## Atualização v0.8.7

- A Fase 1 recebeu novos **props ambientais**: pedras com musgo, raízes, arbustos, tocos, troncos caídos, cogumelos, flores e pequenos marcos.
- Os props são distribuídos junto das árvores, com variação de escala, tipo e espelhamento para reduzir repetição visual.
- O chão do Bosque Sussurrante foi substituído por um **atlas de 16 variações de terreno**, incluindo terra úmida, musgo, folhas, pedras pequenas, grama baixa e áreas mais escuras.
- A seleção dos tiles do chão é determinística por posição, evitando cintilação/troca de textura ao mover a câmera.
- Novos assets WebP: `forest_props.webp` e `forest_ground_variants.webp`.

## Atualização v0.8.7

- Aplicados no jogo os novos **sprites de árvores da 1ª fase** (Bosque Sussurrante).
- O cenário da fase 1 agora usa um **atlas com 11 variações de árvores e troncos**, em vez do ícone simples anterior.
- Cada árvore do mapa pode variar em tipo, escala e espelhamento, deixando a floresta mais natural e menos repetitiva.
- Mantida a estrutura do projeto em WebP, com novo arquivo `assets/tiles/props/forest_trees.webp`.

## Atualização v0.8.7

- XP no chão agora se aglomera automaticamente: quando 5 orbes de XP ficam próximos, viram um único orbe maior sem perder experiência.
- O orbe aglomerado mantém a soma exata do XP dos cinco itens.
- Pickups de XP aglomerados ficam visualmente maiores e mostram o valor acumulado.
- Sempre que um inimigo geraria XP, existe 15% de chance de o drop ser substituído por uma cura.
- A cura restaura 15% da vida máxima do herói e possui visual próprio.
- A compactação dos XP também reduz a quantidade de entidades no chão e melhora a performance em hordas longas.

## Atualização v0.8.7

- Aplicados no jogo os **novos sprites animados dos inimigos da 1ª fase** (Bosque Sussurrante), em versões mais fluidas para: comum, veloz, perseguidor, bruto e atacante à distância.
- Os inimigos da primeira fase agora usam atlas com animações de caminhada, ataque e dano, em vez das folhas simples antigas.
- Convertidas **todas as imagens do projeto para WebP** dentro da pasta `assets/`, reduzindo peso e padronizando o carregamento.
- O carregamento do jogo foi atualizado para usar `.webp` em sprites, tiros e tiles.


## Atualização v0.8.7

- Aplicados **sprites completos para os outros 5 heróis**: Eryn (Guardiã), Mira (Bruxa), Brom (Ferreiro), Syla (Druida) e Nox (Portador).
- Mantido Kael com seu sprite detalhado já integrado na v0.8.2.
- Substituídos os **tiros inimigos** por projéteis em pixel art, variando conforme cada fase: floresta, pântano, ruínas, jardim de cinzas e coração da floresta.
- Melhorada a função de desenho do player para usar atlas de animação com idle, caminhada, ataque e dano.

# Grim Grove: Survivors of the Hollow — v0.8.7

Survival roguelite para navegador em fantasia sombria.

## Correção v0.8.7

- Corrigida a falha de parsing `main.js:102 Uncaught SyntaxError: Unexpected identifier '$'`.
- HUD de objetivos/contratos reescrita com expressões explícitas.
- Corrigida ternária ambígua do efeito de invulnerabilidade.
- Mantido todo o conteúdo da v0.8.0.
- Aplicado o novo sprite detalhado do jogador para **Kael, o Caçador** (herói ranger), com animações de idle, caminhada, ataque e dano.
- Substituído o desenho em linha dos tiros por **sprites visuais reais de projéteis**, com estilos diferentes conforme a arma/herói.
- Integrado conjunto de projéteis para ataque principal, Selo Rúnico, Fogo-Fátuo e várias sinergias/especiais.


## Novidades da v0.8.0
- Mutador aleatório por fase: Névoa Faminta, Tempestade Rúnica, Lua Rubra ou Florescimento Antigo.
- Contrato opcional de alto risco no meio da fase com recompensa rara.
- Aspecto aleatório para cada boss: Eco, Espinhos ou Vazio.
- Selo Rúnico pode evoluir para **Mandala Ancestral**.
- Fogo-Fátuo pode evoluir para **Cortejo Espectral**.
- Nova sinergia **Convergência Espectral** ao evoluir as duas armas auxiliares.
- Novos efeitos ambientais e feedback na HUD.
- Progressão, limites adaptativos, objetivos, caches, santuários e 5 fases da versão anterior mantidos.

## Controles
- WASD ou setas: mover
- Espaço: habilidade especial
- Esc: pausar

Abra `index.html` em um servidor local. Para evitar bloqueios de módulos ES, use por exemplo `python -m http.server` na pasta do projeto e acesse pelo navegador.

Desenvolvido por Luis Paulo Alves.

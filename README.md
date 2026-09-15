## Atualização v0.10.1

- Substituídos no jogo os placeholders de **XP, vida e baús** por sprites reais em pixel art.
- Os drops de XP agora usam atlas animado com variações para orbe pequeno, orbe forte e cluster/XP aglomerado.
- O pickup de vida agora usa sprite próprio de coração verde animado.
- Os baús do mundo agora usam sprites detalhados para:
  - baú comum de madeira
  - baú raro/dourado
- Também foram aplicados sprites para elementos extras do mundo:
  - runas coletáveis
  - caches ancestrais
  - santuários
- Todos os itens novos foram adicionados em `assets/sprites/items/` em WebP.

## Atualização v0.10.1

- Criadas **bordas reais de transição** entre terrenos usando diferenças de máscara entre tiles vizinhos.
- As transições agora não são só manchas com alpha: elas ganham **bordas visuais** com sombreado e linha orgânica nas laterais do terreno de transição.
- Adicionados **detalhes pequenos no chão** em todas as fases, como folhas, gravetos, pedras, marcas, musgo, cinzas e sinais místicos, renderizados proceduralmente por tile.
- Cada fase agora possui **trilhas especiais próprias**:
  - Floresta: trilhas de terra sinuosas;
  - Pântano: canais de lama e passagens molhadas;
  - Ruínas: faixas de pedra e caminhos antigos;
  - Jardim de Cinzas: rastros queimados e solo ressecado;
  - Coração da Floresta: veios/rastros místicos.
- Adicionada **colisão do jogador com árvores e props sólidos** (pedras, tocos, runestones, troncos e outros obstáculos sólidos).
- Os props da cena agora são desenhados ordenados por profundidade para melhorar a leitura do cenário.

Como funciona a colisão:
1. cada árvore/prop sólido recebe um raio de colisão;
2. após o movimento do jogador, o jogo testa os obstáculos próximos;
3. se houver interseção, o personagem é empurrado para fora do volume sólido.

## Atualização v0.10.1

- O sistema de **atlas variado de chão** agora foi expandido para **todas as fases**.
- Cada bioma agora possui:
  - `*_base.webp` com 16 variações principais,
  - `*_transition.webp` com 16 variações secundárias para mistura.
- Foram adicionadas **transições de chão** por blending procedural:
  - floresta: grama → terra/trilha,
  - pântano: solo úmido → lama/charco,
  - ruínas: pedra → terra/musgo,
  - jardim de cinzas: solo orgânico → áreas mais áridas,
  - coração da floresta: chão místico → áreas corrompidas/rúnicas.
- A Fase 1 agora possui **trilhas/caminhos naturais** gerados proceduralmente, em vez de apenas manchas soltas.
- As trilhas são fixas no mundo e seguem curvas naturais, com bordas suavizadas.
- O render do chão continua usando:
  - snap em pixel inteiro,
  - overlap para eliminar frestas,
  - escolha determinística por coordenada.

Arquivos novos:
- `assets/tiles/atlases/forest_base.webp`
- `assets/tiles/atlases/forest_transition.webp`
- `assets/tiles/atlases/swamp_base.webp`
- `assets/tiles/atlases/swamp_transition.webp`
- `assets/tiles/atlases/ruins_base.webp`
- `assets/tiles/atlases/ruins_transition.webp`
- `assets/tiles/atlases/ashes_base.webp`
- `assets/tiles/atlases/ashes_transition.webp`
- `assets/tiles/atlases/heart_base.webp`
- `assets/tiles/atlases/heart_transition.webp`

Como funciona agora:
1. o mundo continua dividido em células de 128x128;
2. cada célula escolhe uma variação do atlas principal;
3. uma segunda função calcula a intensidade de transição naquele ponto;
4. se houver transição, o tile secundário é desenhado por cima com alpha controlado;
5. na floresta, a intensidade também leva em conta a distância até trilhas curvas naturais.

## Atualização v0.10.1

- Refatorado todo o sistema de chão para evitar as faixas/linhas pretas vistas no mapa.
- O render do chão agora usa **snap de câmera em pixels inteiros**, reduzindo artefatos de subpixel.
- Os tiles de chão agora são desenhados com **pequena sobreposição (+2 px)** para eliminar frestas entre blocos.
- A Fase 1 recebeu um novo **atlas 4x4 com 16 variações de chão** (`forest_ground_atlas.webp`).
- O Bosque Sussurrante agora escolhe a variação do chão por **hash determinístico de coordenadas**, formando manchas coerentes no terreno sem ficar trocando quando a câmera anda.
- As outras fases continuam usando suas texturas atuais, mas já com o novo sistema de render sem frestas.
- Mantidos os props, árvores e lógica visual anterior.

Como o novo chão funciona:
1. o mapa é dividido em células de 128x128;
2. cada célula da floresta consulta um hash das coordenadas;
3. esse hash escolhe uma entre 16 variações do atlas;
4. o resultado é sempre o mesmo para a mesma posição do mapa;
5. o desenho usa arredondamento e overlap para não abrir linhas entre os blocos.

## Atualização v0.10.1

- Substituídas as 5 texturas antigas de chão pelas novas texturas WebP.
- `forest.webp` agora usa o novo chão verde/florestal.
- `swamp.webp` usa o novo terreno úmido com poças.
- `ashes.webp` usa o novo solo avermelhado com folhas.
- `heart.webp` usa o novo chão místico roxo.
- `ruins.webp` usa o novo piso de pedra com musgo.
- Removido o atlas antigo `forest_ground_variants.webp`, que sobrescrevia a textura da Fase 1.
- Todas as fases agora carregam diretamente suas novas texturas WebP pelo sistema padrão de tiles.

## Atualização v0.10.1

- A Fase 1 recebeu novos **props ambientais**: pedras com musgo, raízes, arbustos, tocos, troncos caídos, cogumelos, flores e pequenos marcos.
- Os props são distribuídos junto das árvores, com variação de escala, tipo e espelhamento para reduzir repetição visual.
- O chão do Bosque Sussurrante foi substituído por um **atlas de 16 variações de terreno**, incluindo terra úmida, musgo, folhas, pedras pequenas, grama baixa e áreas mais escuras.
- A seleção dos tiles do chão é determinística por posição, evitando cintilação/troca de textura ao mover a câmera.
- Novos assets WebP: `forest_props.webp` e `forest_ground_variants.webp`.

## Atualização v0.10.1

- Aplicados no jogo os novos **sprites de árvores da 1ª fase** (Bosque Sussurrante).
- O cenário da fase 1 agora usa um **atlas com 11 variações de árvores e troncos**, em vez do ícone simples anterior.
- Cada árvore do mapa pode variar em tipo, escala e espelhamento, deixando a floresta mais natural e menos repetitiva.
- Mantida a estrutura do projeto em WebP, com novo arquivo `assets/tiles/props/forest_trees.webp`.

## Atualização v0.10.1

- XP no chão agora se aglomera automaticamente: quando 5 orbes de XP ficam próximos, viram um único orbe maior sem perder experiência.
- O orbe aglomerado mantém a soma exata do XP dos cinco itens.
- Pickups de XP aglomerados ficam visualmente maiores e mostram o valor acumulado.
- Sempre que um inimigo geraria XP, existe 15% de chance de o drop ser substituído por uma cura.
- A cura restaura 15% da vida máxima do herói e possui visual próprio.
- A compactação dos XP também reduz a quantidade de entidades no chão e melhora a performance em hordas longas.

## Atualização v0.10.1

- Aplicados no jogo os **novos sprites animados dos inimigos da 1ª fase** (Bosque Sussurrante), em versões mais fluidas para: comum, veloz, perseguidor, bruto e atacante à distância.
- Os inimigos da primeira fase agora usam atlas com animações de caminhada, ataque e dano, em vez das folhas simples antigas.
- Convertidas **todas as imagens do projeto para WebP** dentro da pasta `assets/`, reduzindo peso e padronizando o carregamento.
- O carregamento do jogo foi atualizado para usar `.webp` em sprites, tiros e tiles.


## Atualização v0.10.1

- Aplicados **sprites completos para os outros 5 heróis**: Eryn (Guardiã), Mira (Bruxa), Brom (Ferreiro), Syla (Druida) e Nox (Portador).
- Mantido Kael com seu sprite detalhado já integrado na v0.8.2.
- Substituídos os **tiros inimigos** por projéteis em pixel art, variando conforme cada fase: floresta, pântano, ruínas, jardim de cinzas e coração da floresta.
- Melhorada a função de desenho do player para usar atlas de animação com idle, caminhada, ataque e dano.

# Grim Grove: Survivors of the Hollow — v0.10.1

Survival roguelite para navegador em fantasia sombria.

## Correção v0.10.1

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

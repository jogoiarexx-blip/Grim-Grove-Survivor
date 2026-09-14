export const HEROES=[
{id:'warden',name:'Eryn, a Guardiã',icon:'🛡️',hp:130,speed:210,damage:18,rate:.7,desc:'Equilibrada. Espinhos orbitais defensivos.',special:'Muralha de Espinhos',cooldown:14,weapon:'Lança de Espinhos',evolved:'Lança do Bosque Antigo'},
{id:'ranger',name:'Kael, o Caçador',icon:'🏹',hp:90,speed:245,damage:26,rate:.9,desc:'Críticos altos e projéteis velozes.',special:'Chuva de Flechas',cooldown:11,weapon:'Arco de Teixo',evolved:'Tempestade de Teixo'},
{id:'witch',name:'Mira, a Bruxa',icon:'🔮',hp:85,speed:205,damage:22,rate:.6,desc:'Orbes arcanos atravessam inimigos.',special:'Nova Arcana',cooldown:13,weapon:'Orbe Umbral',evolved:'Lua Partida'},
{id:'smith',name:'Brom, o Ferreiro',icon:'🔨',hp:155,speed:180,damage:32,rate:1.05,desc:'Ataques lentos e devastadores.',special:'Impacto Sísmico',cooldown:16,weapon:'Martelo Rúnico',evolved:'Bigorna do Titã'},
{id:'druid',name:'Syla, a Druida',icon:'🌿',hp:105,speed:220,damage:16,rate:.55,desc:'Regenera vida aos poucos.',special:'Círculo Vital',cooldown:18,weapon:'Semente Cortante',evolved:'Coroa de Espinhos'},
{id:'relic',name:'Nox, o Portador',icon:'🗝️',hp:100,speed:225,damage:20,rate:.5,desc:'Relíquia amaldiçoada dispara rajadas.',special:'Ruptura da Relíquia',cooldown:12,weapon:'Fragmento Proibido',evolved:'Relíquia Desperta'}
];
export const STAGES=[
{name:'Bosque dos Sussurros',bg:'#26311f',ground:'#35422a',accent:'#8fa35a',enemy:'Rastejante de Casca',boss:'Cervo Oco',emoji:'🌲',tile:'forest',bossPattern:'charge'},
{name:'Pântano das Lanternas',bg:'#1b2d2a',ground:'#294039',accent:'#65a38b',enemy:'Afogado de Musgo',boss:'Mãe do Lodo',emoji:'🪷',tile:'swamp',bossPattern:'split'},
{name:'Ruínas do Monastério',bg:'#2f2b28',ground:'#403a35',accent:'#b08d68',enemy:'Monge Cinzento',boss:'Abade Sem-Rosto',emoji:'🏚️',tile:'ruins',bossPattern:'bolts'},
{name:'Jardim de Cinzas',bg:'#352526',ground:'#493233',accent:'#c36f66',enemy:'Flor Voraz',boss:'Rainha Esporulada',emoji:'🌺',tile:'ashes',bossPattern:'spores'},
{name:'Coração da Floresta',bg:'#17131e',ground:'#2c2434',accent:'#a986c7',enemy:'Eco da Raiz',boss:'O Rei Enraizado',emoji:'🜏',tile:'heart',bossPattern:'roots'}
];
export const ENEMY_ARCHETYPES=[
{id:'common',name:'Errante',hp:1,speed:1,damage:1,scale:1,weight:50},
{id:'swift',name:'Caçador',hp:.68,speed:1.65,damage:.8,scale:.88,weight:24},
{id:'brute',name:'Ancião',hp:2.4,speed:.63,damage:1.55,scale:1.34,weight:17},
{id:'ranged',name:'Arauto',hp:.92,speed:.72,damage:.9,scale:1.02,weight:9,ranged:true},
{id:'stalker',name:'Espreitador',hp:1.18,speed:1.08,damage:1.2,scale:.94,weight:8,stalker:true}
];
export const BLESSINGS=[
{id:'damage',name:'Fúria Antiga',text:'+18% dano',apply:g=>g.damage*=1.18},
{id:'rate',name:'Ritmo da Caçada',text:'-14% intervalo',apply:g=>g.fireRate*=.86},
{id:'speed',name:'Passos Leves',text:'+12% movimento',apply:g=>g.speed*=1.12},
{id:'hp',name:'Casca Viva',text:'+25 vida máxima e cura 25',apply:g=>{g.maxHp+=25;g.hp=Math.min(g.maxHp,g.hp+25)}},
{id:'multi',name:'Eco Duplo',text:'+1 projétil',apply:g=>g.multishot=Math.min(6,g.multishot+1)},
{id:'pierce',name:'Espinho Perfurante',text:'+1 perfuração',apply:g=>g.pierce++},
{id:'magnet',name:'Chamado da Seiva',text:'+30% alcance de coleta',apply:g=>g.magnet*=1.3},
{id:'crit',name:'Olho do Corvo',text:'+8% crítico',apply:g=>g.crit+=.08},
{id:'weapon',name:'Domínio da Arma',text:'+1 nível da arma',apply:g=>{g.weaponLevel=Math.min(5,g.weaponLevel+1);g.damage*=1.06}}
];

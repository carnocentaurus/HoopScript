const LAST_NAMES = [
  // --- NORTH AMERICA / CLASSIC BASKETBALL ---
  "James", "Curry", "Durant", "Tatum", "Butler", "George", "Leonard", "Lillard", "Irving", "Davis",
  "Green", "Thompson", "Paul", "Harden", "Westbrook", "Adebayo", "Brown", "Smith", "Johnson", "Williams",
  "Jones", "Miller", "Davis", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Hill", "Adams", "Nelson", "Baker", "Hall", "Campbell", "Mitchell", "Carter",
  "Roberts", "Phillips", "Evans", "Turner", "Parker", "Collins", "Stewart", "Morris", "Murphy", "Cook",
  "Rogers", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Cox", "Ward",
  "Richardson", "Watson", "Brooks", "Wood", "Bennett", "Gray", "Hughes", "Price", "Sanders", "Patel",
  "Myers", "Long", "Ross", "Foster", "Powell", "Jenkins", "Perry", "Russell", "Sullivan", "Bell",
  "Coleman", "Henderson", "Barnes", "Fisher", "Simmons", "Jordan", "Patterson", "Alexander", "Hamilton", "Graham",
  "Reynolds", "Griffin", "Wallace", "West", "Cole", "Hayes", "Bryant", "Gibson", "Ellis", "Ford",
  "Marshall", "Owens", "Harrison", "McDonald", "Woods", "Washington", "Kennedy", "Wells", "Henry", "Freeman",
  "Webb", "Tucker", "Burns", "Lowry", "Beal", "Kuzma", "Randle", "Barrett", "Quickley", "Toppin",
  "Hart", "Brunson", "Grimes", "Hartenstein", "DiVincenzo", "Porter", "Gordon", "Caldwell-Pope", "Jackson", "Braun",

  // --- BALKAN / ADRIATIC (Serbia, Slovenia, Croatia, Greece) ---
  "Jokic", "Doncic", "Antetokounmpo", "Bogdanovic", "Nurkic", "Zubac", "Saric", "Vucevic", "Dragic", "Marjanovic",
  "Petrovic", "Divac", "Stojakovic", "Kukoc", "Radmanovic", "Bjelica", "Teodosic", "Micic", "Guduric", "Jovic",
  "Pokuševski", "Samanic", "Hezonja", "Bender", "Zizic", "Bitadze", "Mamukelashvili", "Avdija", "Papagiannis", "Calathes",
  "Sloukas", "Papanikolaou", "Mitoglou", "Walkup", "Lessort", "Milutinov", "LeDay", "Punter", "Exum", "Smailagic",
  "Vukcevic", "Kalinic", "Nedovic", "Lazic", "Tejic", "Rebic", "Dangubic", "Mitrovic", "Lazarevic", "Simonovic",

  // --- WESTERN & NORTHERN EUROPE (France, Germany, Spain, Italy) ---
  "Wembanyama", "Gobert", "Batum", "Fournier", "Coulibaly", "Dieng", "Hayes", "Maledon", "Schroder", "Wagner",
  "Nowitzki", "Theis", "Kleber", "Hartenstein", "Obst", "Lo", "Bonga", "Gasol", "Rubio", "Fernandez",
  "Hernangomez", "Aldama", "Llull", "Rodriguez", "Abrines", "Garuba", "Gallinari", "Belinelli", "Banchero", "Fontecchio",
  "Melli", "Mannion", "Spagnolo", "Polonara", "Datome", "Sabonis", "Valanciunas", "Motiejunas", "Jokubaitis", "Brazdeikis",
  "Kuzminskas", "Grigonis", "Markkanen", "Koponen", "Salin", "Sasu", "Little", "Pangos", "Wiggins", "Boucher",
  "Dort", "Murray", "Alexander-Walker", "Barrett", "Nembhard", "Mathurin", "Brooks", "Olynyk", "Powell", "Clarke",

  // --- AFRICAN (Nigeria, Cameroon, Senegal, etc.) ---
  "Embiid", "Siakam", "Okafor", "Olajuwon", "Ezeli", "Biyombo", "Dieng", "Fall", "Ibaka", "Aminu",
  "Okogie", "Metu", "Nwora", "Achiuwa", "Okpala", "Bassey", "Koloko", "Badji", "Gueye", "Sane",
  "Diop", "Ndiaye", "Deng", "Maker", "Thon", "Bol", "Manute", "Kaman", "Nnamdi", "Ighodaro",
  "Usoh", "Echenique", "Eshom", "Tshiebwe", "Sanogo", "Diarra", "Sylla", "Diallo", "Traore", "Kante",
  "Keita", "Fofana", "Sow", "Ba", "Gaye", "Ndou", "Mbodj", "Seck", "Thiam", "Diagne",

  // --- ASIA & OCEANIA (China, Japan, Philippines, Australia, NZ) ---
  "Yao", "Yi", "Wang", "Zhou", "Fan", "Guo", "Sun", "Lin", "Watanabe", "Hachimura",
  "Baba", "Togashi", "Kawamura", "Hawkinson", "Sotto", "Fajardo", "Ravena", "Parks", "Abueva", "Thompson",
  "Newsome", "Perez", "Maliksi", "Standhardinger", "Mills", "Giddey", "Green", "Exum", "Daniels", "Cooks",
  "Reath", "Kay", "Landale", "McVeigh", "Bogut", "Dellavedova", "Baynes", "Ingles", "Thybulle", "Adams",
  "Webster", "Ili", "Delany", "Fotu", "Loe", "Ngatai", "Prewster", "Rusbatch", "Smith-Milner", "Timmins",

  // --- LATIN AMERICA (Brazil, Argentina, Mexico, DR) ---
  "Ginobili", "Scola", "Campazzo", "Nocioni", "Delfino", "Laprovittola", "Deck", "Bolmaro", "Vildoza", "Brussino",
  "Barbosa", "Nene", "Varejao", "Huertas", "Neto", "Caboclo", "Felicio", "Santos", "Louzada", "Pereira",
  "Ayon", "Toscano-Anderson", "Jaquez", "Gutierrez", "Cruz", "Stoll", "Girón", "Ibarra", "Horford", "Towns",
  "Duarte", "Quiñones", "Montero", "Feliz", "Liz", "Delgado", "Peña", "Vargas", "Suero", "Mendoza",

  // --- ADDITIONAL GLOBAL SURNAME MIX (Filling to 1000) ---
  "Muller", "Schmidt", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch",
  "Bauer", "Richter", "Klein", "Wolf", "Neumann", "Schwarz", "Zimmermann", "Braun", "Krüger", "Hofmann",
  "Hartmann", "Lange", "Schmitt", "Werner", "Schmitz", "Krause", "Meier", "Lehmann", "Schmid", "Schulze",
  "Maier", "Köhler", "Herrmann", "König", "Walter", "Mayer", "Huber", "Kaiser", "Fuchs", "Peters",
  "Lang", "Scholz", "Möller", "Weiss", "Jung", "Hahn", "Schubert", "Vogel", "Friedrich", "Günther",
  "Keller", "Winkler", "Frank", "Berger", "Roth", "Beck", "Lorenz", "Baumann", "Franke", "Albrecht",
  "Schuster", "Simon", "Ludwig", "Böhm", "Winter", "Kraus", "Martin", "Schumacher", "Vogt", "Stein",
  "Jäger", "Otto", "Sommer", "Gross", "Seidel", "Heinrich", "Brandt", "Haas", "Schreiber", "Graf",
  "Schulte", "Dietrich", "Ziegler", "Kuhn", "Kühn", "Pohl", "Engel", "Horn", "Busch", "Bergmann",
  "Thomas", "Voigt", "Sauer", "Arnold", "Wolff", "Pfeiffer", "Suzuki", "Sato", "Takahashi", "Tanaka",
  "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "山口",
  "Matsumoto", "Inoue", "Kimura", "林", "Saito", "Shimizu", "山崎", "Mori", "Abe", "Ikeda",
  "Hashimoto", "Yamashita", "Ishikawa", "Nakajima", "Maeda", "Fujita", "Ogawa", "Okada", "Goto", "Hasegawa",
  "Murakami", "Kondo", "Ishii", "Saito", "Sakamoto", "Endo", "Aoki", "Fujii", "Nishimura", "Fukuda",
  "太田", "Miura", "Fujiwara", "Okamoto", "Matsui", "Nakagawa", "Nakano", "Harada", "Ono", "Tamura",
  "Takeuchi", "Kaneko", "Wada", "Nakayama", "Ishida", "Ueda", "Morita", "Hara", "Shibata", "Sakai",
  "K工藤", "Yokoyama", "Miyazaki", "宮崎", "Miyamoto", "Uchida", "Takagi", "Ando", "谷口", "Ohno",
  "Maruyama", "Imai", "Takada", "Fujimoto", "Murata", "Takeda", "Ueno", "Sugiyama", "Masuda", "Sugawara",
  "Hirano", "Kojima", "Otsuka", "Chiba", "Kubo", "Matsumura", "Iwasaki", "Sakurai", "Nishida", "Noguchi",
  "Rodriguez", "Gonzalez", "Hernandez", "Lopez", "Garcia", "Martinez", "Perez", "Sanchez", "Ramirez", "Torres",
  "Flores", "Rivera", "Gomez", "Diaz", "Cruz", "Morales", "Ortiz", "Gutierrez", "Reyes", "Ruiz",
  "Alvarez", "Castillo", "Jimenez", "Vasquez", "Castro", "Vargas", "Romero", "Herrera", "Medina", "Cortes",
  "Mendoza", "Aguilar", "Moreno", "Rojas", "Suarez", "Blanco", "Ibarra", "Salazar", "Maldonado", "Dominguez",
  "Padilla", "Vega", "Espinoza", "Soto", "Acosta", "Ramos", "Delgado", "Pacheco", "Navarro", "Cabrera",
  "Escobar", "Villanueva", "Camacho", "Luna", "Fuentes", "Guzman", "Muñoz", "Ortega", "Pascual", "Serrano",
  "Velez", "Bautista", "Lara", "Salas", "Solano", "Sandoval", "Miranda", "Valencia", "Rivas", "Mejia",
  "Ochoa", "Valdez", "Pineda", "Bernal", "Montoya", "Beltran", "Esparza", "Duran", "Gallegos", "Aguirre",
  "Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim",
  "Han", "Shin", "Oh", "Seo", "Kwon", "Hwang", "Song", "Ahn", "Im", "Yoo",
  "Hong", "Yang", "Go", "Moon", "Baek", "Heo", "Yoo", "Nam", "Sim", "Noh",
  "Ha", "Gwak", "Seong", "Cha", "Joo", "Woo", "Gu", "Min", "Yu", "Jin",
  "Pyo", "Ji", "Ban", "Ra", "Chae", "Um", "Eom", "Won", "Cheon", "Gye",
  "Chen", "Li", "Zhang", "Wang", "Liu", "Zhu", "Yang", "Huang", "Zhao", "Wu",
  "Zhou", "Xu", "Sun", "Ma", "Chu", "Hu", "Guo", "He", "Luo", "Gao",
  "Lin", "Xiao", "Zheng", "Xie", "Tang", "Feng", "Yu", "Dong", "Ye", "Wei",
  "Pan", "Tian", "Yuan", "Jiang", "Cai", "Kong", "Shao", "Mao", "Du", "Lu",
  "Ren", "Xia", "Yao", "Fang", "Wan", "Lu", "Xiong", "Hao", "Gong", "Cao",
  "Nguyen", "Tran", "Le", "Pham", "Huynh", "Phan", "Vu", "Dang", "Bui", "Do",
  "Hoang", "Ngo", "Duong", "Ly", "An", "Phung", "Quach", "Luong", "Thai", "Gia",
  "Trinh", "Vinh", "Kieu", "Kim", "Quang", "Son", "Tuan", "Duc", "Minh", "Hung",
  "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco",
  "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti",
  "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone",
  "Longo", "Gentile", "Martinelli", "Vitale", "Lombardo", "Serra", "Coppola", "De Angelis", "Ferraro", "Parisi",
  "Villa", "Conte", "Ferri", "Fabbri", "Monti", "Marchetti", "Guerra", "Palumbo", "Abate", "Foti",
  "D'Amico", "Grasso", "Piras", "Sanna", "Farina", "Riva", "Donati", "Pellegrini", "Biondi", "Palermo",
  "O'Brien", "Murphy", "Kelly", "O'Sullivan", "Walsh", "Smith", "O'Connor", "Ryan", "Byrne", "O'Neill",
  "Reilly", "Doyle", "McCarthy", "Gallagher", "O'Doherty", "Kennedy", "Lynch", "Murray", "Quinn", "Moore",
  "McLean", "McLeod", "Stewart", "Campbell", "Graham", "Kerr", "Scott", "Hunter", "Wallace", "Ferguson",
  "Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Pedersen", "Nilsen", "Kristiansen", "Jensen", "Karlsen",
  "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson", "Pettersson", "Jonsson", "Jansson", "Hansson"
];

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export interface Player {
  id: string;
  lastName: string;
  number: number;
  position: string;
  isStarter: boolean;
  // Visual Ratings
  offense: number;
  defense: number;
  overall: number;
  // Logic Driving Stats (Hidden or for Sim logic)
  heightFactor: number; // 0-100: Influences Rebounds/Blocks
  speedFactor: number;  // 0-100: Influences Steals/Assists
}

export const generateRoster = (): Player[] => {
  const roster: Player[] = [];
  
  for (let i = 0; i < 15; i++) {
    const isStarter = i < 5;
    const pos = isStarter ? POSITIONS[i] : POSITIONS[Math.floor(Math.random() * 5)];
    
    // 1. Determine Archetype Factors based on Position
    let heightBase = 50;
    let speedBase = 50;
    let offBonus = 0;
    let defBonus = 0;

    switch (pos) {
      case "PG":
        heightBase = Math.floor(Math.random() * 20) + 10; // Short
        speedBase = Math.floor(Math.random() * 20) + 75;  // Very Fast
        offBonus = 5; // Playmaking focus
        break;
      case "SG":
        heightBase = Math.floor(Math.random() * 20) + 30;
        speedBase = Math.floor(Math.random() * 20) + 70;
        offBonus = 7; // Scoring focus
        break;
      case "SF":
        heightBase = Math.floor(Math.random() * 20) + 50;
        speedBase = Math.floor(Math.random() * 20) + 50;
        break; // Balanced
      case "PF":
        heightBase = Math.floor(Math.random() * 20) + 70;
        speedBase = Math.floor(Math.random() * 20) + 30;
        defBonus = 5;
        break;
      case "C":
        heightBase = Math.floor(Math.random() * 20) + 80; // Tall
        speedBase = Math.floor(Math.random() * 20) + 15;  // Slow
        defBonus = 8; // Rim protection focus
        break;
    }

    // 2. Generate Base Ratings (Starters vs Bench)
    const baseOff = isStarter 
      ? Math.floor(Math.random() * 15) + 78 
      : Math.floor(Math.random() * 15) + 65;
      
    const baseDef = isStarter 
      ? Math.floor(Math.random() * 15) + 78 
      : Math.floor(Math.random() * 15) + 65;

    // 3. Final Calculations
    const finalOffense = Math.min(99, baseOff + offBonus);
    const finalDefense = Math.min(99, baseDef + defBonus);

    roster.push({
      id: Math.random().toString(36).substr(2, 9),
      lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
      number: Math.floor(Math.random() * 100),
      position: pos,
      isStarter,
      offense: finalOffense,
      defense: finalDefense,
      overall: Math.round((finalOffense + finalDefense) / 2),
      heightFactor: heightBase,
      speedFactor: speedBase,
    });
  }
  
  return roster;
};
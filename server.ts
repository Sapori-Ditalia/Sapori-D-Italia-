import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { recipesList } from "./src/data/recipes";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client safely to avoid startup issues or crash when missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim() !== "" && !key.includes("MY_GEMINI_API_KEY")) {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.error("Errore durante l'inizializzazione del client Gemini:", err);
        return null;
      }
    }
  }
  return aiClient;
}

// Quiet, descriptive logger for Gemini API statuses to keep logs clean and readable
function logGeminiError(action: string, error: any) {
  const errMsg = error?.message || String(error);
  if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("Quota")) {
    console.warn(`[Gemini API - Quota Raggiunta] ${action}: Quota massima superata (429 / RESOURCE_EXHAUSTED). Attivazione automatica del sommelier/chef di backup locale.`);
  } else {
    // Keep it short and readable, avoiding raw JSON dumping to console error
    console.warn(`[Gemini API - Fallito] ${action}: ${errMsg.substring(0, 180)}`);
  }
}

// Highly authentic localized Italian wine pairing expert registry (fallback)
function getLocalWinePairing(recipeName: string, region: string, ingredients: string[] = [], description: string = "") {
  const nameLower = recipeName.toLowerCase();
  const descLower = description.toLowerCase();
  const ingJoined = (ingredients || []).join(" ").toLowerCase();
  const fullText = `${nameLower} ${descLower} ${ingJoined}`;

  // 1. Dolci / Dessert Check
  const dessertKeywords = ["dolce", "torta", "tiramisù", "tiramisu", "cannol", "biscott", "cantucc", "crema", "seadas", "budino", "baba", "cassata", "semifreddo", "gelato", "crostata", "miele", "cioccolato", "tegole"];
  if (dessertKeywords.some(kw => fullText.includes(kw))) {
    return {
      name: "Moscato d'Asti DOCG",
      type: "Bianco frizzante, dolce, aromatico, di moderata alcolicità",
      grape: "Moscato Bianco 100%",
      producerRegion: "Piemonte",
      pairingMotivation: `L'abbinamento ideale e consigliato dal sommelier dello chef. Secondo la regola fondamentale della concordanza enogastronomica, ai dolci si abbina rigorosamente un vino dolce: le gentili bollicine e i seducenti aromi freschi di pesca bianca, salvia e fiori d'arancio del Moscato d'Asti ripuliscono divinamente la ricchezza del dessert lasciando la bocca vellutata e profumata.`
    };
  }

  // 2. Seafood / Fish / Pesce / Mare / Zuppe / Spaghetti allo scoglio
  const fishKeywords = ["pesce", "sarde", "scoglio", "cozze", "vongole", "baccalà", "stoccafisso", "polpo", "calamari", "orata", "branzino", "marinara", "scorfano", "triglia", "merluzzo", "acciughe", "alici", "fregola"];
  if (fishKeywords.some(kw => fullText.includes(kw))) {
    return {
      name: "Vermentino di Gallura Superiore DOCG",
      type: "Bianco paglierino brillante, fresco, sapido e finemente minerale",
      grape: "Vermentino 100%",
      producerRegion: "Sardegna",
      pairingMotivation: `Le delicate sfumature del pescato e della sapidità marina esigono un bianco vibrante e fortemente minerale. Il Vermentino di Gallura racchiude meravigliose fragranze salmastre di macchia mediterranea ed agrumi freschi, capaci di valorizzare al massimo la naturale dolcezza del pesce sorreggendone il gusto con straordinaria freschezza.`
    };
  }

  // 3. Robust Red Meat / Spezzatino / Brasato / Bistecca / Salsiccia / Ragù
  const redMeatKeywords = ["carne", "bistecca", "brasato", "spezzatino", "vitello", "manzo", "maiale", "arrosticini", "agnello", "ragù", "salsiccia", "selvaggina", "cinghiale", "cervo"];
  if (redMeatKeywords.some(kw => fullText.includes(kw))) {
    return {
      name: "Taurasi DOCG",
      type: "Rosso rubino intenso tendente al granato, austero, speziato, caldo e persistente",
      grape: "Aglianico 100%",
      producerRegion: "Campania",
      pairingMotivation: `Un piatto così strutturato e ricco di sapore esige un rosso altrettanto regale dal profilo tannico deciso e levigato. Il Taurasi, monumentale interpretazione dell'uva Aglianico, offre splendide e calde sfumature di prugna matura, spezie scure, tabacco e liquirizia, pulendo perfettamente la bocca dall'untuosità a ogni memorabile assaggio.`
    };
  }

  // 4. White Meats / Mushrooms / Carbonara / Egg Dishes / Cheesy Pasta (e.g., Cacio e Pepe, Gricia, Frico)
  const gourmetWhiteKeywords = ["carbonara", "gricia", "uovo", "uova", "funghi", "fart", "formaggio", "fontina", "frico", "burro", "salvia", "cacio", "pecorino", "cotoletta"];
  if (gourmetWhiteKeywords.some(kw => fullText.includes(kw))) {
    return {
      name: "Fiano di Avellino DOCG",
      type: "Bianco di eccellente corpo, elegante, vellutato e minerale",
      grape: "Fiano 100%",
      producerRegion: "Campania",
      pairingMotivation: `La morbida intensità delle preparazioni a base di formaggi fusi, uova, guanciale o carne bianca predilige l'equilibrio di un bianco di eccezionale stoffa e complessità. Il Fiano si impone con la sua sontuosa sapidità, il corpo avvolgente e quell'inconfondibile impronta fruttata e di nocciola tostata che equilibra splendidamente la dolcezza lipidica del piatto.`
    };
  }

  // 5. Tomato Pasta / Risotto / Primi del Centro-Nord
  const tomatoPastaKeywords = ["lasagna", "amatriciana", "ragù", "pomodoro", "sugo", "spaghetti", "trofie", "pasta", "strangozzi", "tortellini", "gnocchi", "risotto", "ravioli", "pansoti", "tagliatelle"];
  if (tomatoPastaKeywords.some(kw => fullText.includes(kw))) {
    return {
      name: "Chianti Classico Riserva DOCG",
      type: "Rosso rubino vivo, asciutto, finemente tannico, sapido e armonico",
      grape: "Sangiovese 90%, Canaiolo 10%",
      producerRegion: "Toscana",
      pairingMotivation: `L'acidità succosa del pomodoro e la complessità amidacea dei primi piatti della tradizione si sposano magnificamente con la vibrante acidità naturale del Sangiovese toscano. Le note fragranti di ciliegia marasca e viola del Chianti Classico Riserva ripuliscono egregiamente la bocca, sostenendo la ricetta senza appesantirla.`
    };
  }

  // 6. Generic Fallback (Pizza, Aperitivi regionali)
  return {
    name: "Conegliano Valdobbiadene Prosecco Superiore DOCG",
    type: "Spumante Brut, brioso, fragrante con finissimo perlage persistente",
    grape: "Glera 100%",
    producerRegion: "Veneto",
    pairingMotivation: `Una scelta eccezionalmente beverina e festosa! La morbida e spumeggiante bollicina di questo meraviglioso Prosecco Superiore pulisce sfarzosamente i lieviti e la sapidità della tavola. I suoi sentori agrumati di mela verde e fiori bianchi lo rendono un compagno formidabile ed equilibrato per pizze o sfiziosi antipasti locali.`
  };
}

// Rules-based dynamic backup Chef recipe library (triggers on quota limits)
function getLocalRecipeGenerator(dishName: string) {
  const query = dishName.toLowerCase().trim();

  // 1. Try to fetch closest fuzzy matches from existing static recipes database
  const found = recipesList.find(r => 
    r.name.toLowerCase().includes(query) || 
    query.includes(r.name.toLowerCase())
  );
  if (found) {
    return {
      name: found.name,
      region: found.region,
      macroRegion: found.macroRegion,
      prepTime: found.prepTime,
      difficulty: found.difficulty,
      ingredients: [...found.ingredients],
      instructions: [...found.instructions],
      description: `[Autentica Specialità d'Italia] ${found.description}`,
      servings: found.servings || 4
    };
  }

  // 2. Programmatic fallbacks based on main classes
  if (query.includes("pasta") || query.includes("spaghetti") || query.includes("bucatini") || query.includes("penne") || query.includes("sugo") || query.includes("pomodoro")) {
    return {
      name: "Spaghetti alla Chitarra con Pomodorini e Basilico",
      region: "Abruzzo",
      macroRegion: "Centro" as const,
      prepTime: "20 min",
      difficulty: "Facile" as const,
      ingredients: [
        "320g Spaghetti alla chitarra freschi",
        "400g Pomodori datterini maturi",
        "2 spicchi d'Aglio",
        "4 cucchiai di Olio Extravergine d'Oliva",
        "1 mazzetto di Basilico fresco",
        "50g Pecorino abruzzese grattugiato",
        "Sale fino q.b."
      ],
      instructions: [
        "Porta a bollore abbondante acqua salata in una pentola spaziosa per la pasta.",
        "In una padella capiente, scalda l'olio extravergine d'oliva con i due spicchi d'aglio schiacciati finché non diventano leggermente dorati.",
        "Aggiungi i pomodorini datterini tagliati a metà e un pizzico di sale. Cuoci a fuoco vivace per 10 minuti, premendoli delicatamente con un cucchiaio di legno per liberare il loro delizioso sugo caramellato.",
        "Tuffa gli spaghetti nell'acqua bollente e cuocili per circa 8-10 minuti, scolandoli molto al dente.",
        "Trasferisci gli spaghetti direttamente nella padella col sugo di pomodorini e salta il tutto energicamente per 2 minuti, aggiungendo una manciata generosa di foglie di basilico spezzate a mano e un mestolo di acqua di cottura per creare un'emulsione setosa.",
        "Spegni la fiamma, spolvera con pecorino abruzzese grattugiato e servi immediatamente ben caldo!"
      ],
      description: "Un classico intramontabile e velocissimo d'Italia: la freschezza e la dolcezza dei pomodorini maturi si legano superbamente alla rustica ruvidità della pasta alla chitarra abruzzese tirata a mano.",
      servings: 4
    };
  }

  if (query.includes("pesce") || query.includes("salmone") || query.includes("tonno") || query.includes("mare") || query.includes("vongole")) {
    return {
      name: "Spaghetti al Profumo di Scoglio e Gamberi",
      region: "Campania",
      macroRegion: "Sud" as const,
      prepTime: "25 min",
      difficulty: "Media" as const,
      ingredients: [
        "320g Spaghetti trafilati al bronzo di Gragnano",
        "300g Gamberi freschi sgusciati",
        "150g Pomodorini ciliegina saporiti",
        "1 bicchiere di Vino bianco secco di qualità",
        "1 mazzetto di Prezzemolo fresco tritato",
        "2 spicchi d'Aglio",
        "5 cucchiai di Olio Extravergine d'Oliva",
        "1 pizzico di Peperoncino rosso piccante",
        "Sale marino q.b."
      ],
      instructions: [
        "Lessa la pasta in abbondante acqua bollente salata e scolala ben salda al dente, circa due minuti prima della cottura ufficiale.",
        "Contemporaneamente, rosola gli spicchi d'aglio ed il peperoncino nell'olio extravergine a fiamma delicata in un tegame.",
        "Unisci i gamberi ben puliti, falli saltare un minuto e sfuma ad alta intensità con il vino bianco finché l'alcol non evapora del tutto.",
        "Aggiungi i pomodorini tagliati a spicchi, cuocendo a fuoco dolce per altri 5-6 minuti in modo da creare un sughietto profumato.",
        "Scola la pasta direttamente nel tegame, amalgama energicamente unendo prezzemolo fresco ed un mestolo di acqua di cottura finché la salsa non risulterà corposa ed avvolgente. Condisci e goditi il mare in tavola!"
      ],
      description: "Un primo di mare goloso, fragrante e verace, ispirato ai ricchi sapori e al calore dei borghi costieri campani più suggestivi.",
      servings: 4
    };
  }

  if (query.includes("dolce") || query.includes("torta") || query.includes("cioccolato") || query.includes("tiramisu") || query.includes("crema") || query.includes("dolci") || query.includes("dessert")) {
    return {
      name: "Torta Soffice della Nonna al Limone di Sorrento",
      region: "Campania",
      macroRegion: "Sud" as const,
      prepTime: "40 min",
      difficulty: "Facile" as const,
      ingredients: [
        "300g Farina tipo 00 di grano tenero",
        "180g Zucchero semolato",
        "3 Uova intere fresche",
        "100g Burro di latteria fuso tiepido",
        "1 bicchiere di Latte intero fresco",
        "1 bustina di Lievito vanigliato per dolci",
        "Scorza finissima grattugiata di 2 Limoni biologici di Sorrento",
        "Zucchero a velo q.b."
      ],
      instructions: [
        "In una ciotola capiente monta con la foga delle frustre elettriche le uova con lo zucchero semolato per almeno 5 minuti fino ad ottenere un composto soffice e spumoso.",
        "Unisci a filo il burro fuso tiepido ed il latte intero alternando il versamento.",
        "Incorpora gradualmente la farina setacciata ed il lievito vanigliato mescolando dal basso verso l'alto per preservare l'aria incorporata.",
        "Profuma l'impasto aggiungendo la profumatissima buccia grattugiata fine di limone di Sorrento.",
        "Versa il preparato in un'apposita tortiera da forno imburrata ed inforna in modalità statica a 180°C per circa 30-35 minuti.",
        "Esegui la prova dello stecchino prima di estrarre dal forno. Fai raffreddare completamente, arricchisci la cupola con zucchero a velo fine e servi una merenda indimenticabile."
      ],
      description: "Una soffice e paradisiaca torta casalinga caratterizzata dal profumo travolgente e solare dei fantastici limoni campani, ideale per tutta la famiglia.",
      servings: 6
    };
  }

  // General Lombardian Golden Herb backup masterpiece
  return {
    name: "Risotto Cremoso alle Erbe e Parmigiano DOP",
    region: "Lombardia",
    macroRegion: "Nord" as const,
    prepTime: "25 min",
    difficulty: "Media" as const,
    ingredients: [
      "320g Riso Carnaroli di prima scelta",
      "1 litro di Brodo vegetale ben saporito caldo",
      "1 Cipolla bionda piccola affettata finemente",
      "80g Parmigiano Reggiano DOP stagionato",
      "60g Burro artigianale freddissimo di frigorifero",
      "1/2 bicchiere di Vino bianco secco piemontese",
      "1 manciata fine di Erbe fresche miste (Rosmarino, Timo, Salvia)",
      "Olio extravergine d'oliva e sale fine q.b."
    ],
    instructions: [
      "Procedi tostando a secco il riso Carnaroli in una casseruola larga per 2-3 minuti fino a riscaldarlo a fondo al contatto col palmo.",
      "Aggiungi la cipolla d'oro precedentemente appassita a parte e sfuma vigorosamente con il vino bianco.",
      "Inizia la cottura versando un mestolo di brodo vegetale bollente alla volta, assicurandoti che sia assorbito interamente prima di ripetere.",
      "Porta a termine la cottura in circa 16-18 minuti, continuando a smuovere dolcemente la casseruola.",
      "Unisci il trito fine e fragrante delle erbe fresche a circa un minuto dallo spegnimento.",
      "Spegni completamente la fiamma, introduci il burro freddo a cubetti ed una pioggia di Parmigiano Reggiano. Manteca all'onda con calore per amalgamare lo squisito amido del chicco in perfetta cremosità."
    ],
    description: "Cremoso, saporito, equilibrato. È l'essenza dell'accoglienza lombarda che fonde l'eccellenza del riso all'aromaticità fresca delle colture di terra italiana.",
    servings: 4
  };
}

// Helper dictionary to map recipes to gorgeous high-resolution food stock images
function getItalianFoodImage(name: string, description: string): string {
  const normName = name.toLowerCase();
  const normDesc = description.toLowerCase();
  const fullText = `${normName} ${normDesc}`;

  // Direct high-precision override for Sicilian Cannoli to avoid generic desserts or donuts
  if (normName.includes("cannol") || normDesc.includes("cannol")) {
    return "https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80";
  }

  // 1. First priority: Check name for pasta / primi indicators
  const pastaKeywords = [
    "pasta", "spaghetti", "lasagne", "risotto", "ravioli", "prim", "tagliatelle", 
    "gnocchi", "trofie", "bucatini", "carbonara", "amatriciana", "gricia", "sugo", 
    "pomodoro", "ragù", "pesto", "tortellini", "cappelletti", "penne", "maccheroni", 
    "linguine", "fettuccine", "orecchiette", "fusilli", "farfalle"
  ];
  if (pastaKeywords.some(kw => normName.includes(kw))) {
    return "https://images.unsplash.com/photo-1563379971899-660589a0163e?w=600&auto=format&fit=crop&q=80"; // Pasta photo
  }

  // 2. Check name for pizza / bread
  const breadKeywords = ["pizza", "focaccia", "pane", "bruschetta", "piadina", "calzone"];
  if (breadKeywords.some(kw => normName.includes(kw))) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60"; // Pizza photo
  }

  // 3. Check name for dessert / dolce indicators
  const dessertKeywords = [
    "dolce", "torta", "tiramisù", "cannol", "biscott", "cantucc", "crema", 
    "panna cotta", "seadas", "budino", "baba", "cassata", "semifreddo", "gelato"
  ];
  if (dessertKeywords.some(kw => normName.includes(kw))) {
    return "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80"; // Dessert photo
  }

  // 4. Check name for fish / seafood
  const fishKeywords = [
    "pesce", "sarde", "scoglio", "cozze", "vongole", "baccalà", "pescatrice", 
    "calamari", "polpo", "cacciucco", "gamberi", "fritto misto", "orata", "branzino"
  ];
  if (fishKeywords.some(kw => normName.includes(kw))) {
    return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"; // Fish photo
  }

  // 5. Check name for meat / carni
  const meatKeywords = [
    "carne", "bistecca", "brasato", "spezzatino", "spezzata", "cotoletta", 
    "polpette", "vitello", "manzo", "maiale", "arrosticini", "agnello", "pollo"
  ];
  if (meatKeywords.some(kw => normName.includes(kw))) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"; // Meat photo
  }

  // Fallback to description checks (same order of classes) with fullText
  if (pastaKeywords.some(kw => fullText.includes(kw))) {
    return "https://images.unsplash.com/photo-1563379971899-660589a0163e?w=600&auto=format&fit=crop&q=80";
  }
  if (breadKeywords.some(kw => fullText.includes(kw))) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60";
  }
  if (dessertKeywords.some(kw => fullText.includes(kw))) {
    return "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80";
  }
  if (fishKeywords.some(kw => fullText.includes(kw))) {
    return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80";
  }
  if (meatKeywords.some(kw => fullText.includes(kw))) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80";
  }

  return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"; // Default Italian tavern meal setting
}

// REST route to handle AI Recipe synthesis with structured JSON output formatting
app.post("/api/generate-recipe", async (req, res) => {
  const { dishName } = req.body;
  if (!dishName || typeof dishName !== "string" || dishName.trim() === "") {
    return res.status(400).json({ error: "Il nome del piatto è richiesto" });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("Client Gemini non configurato (chiave API mancante)");
    }

    const dishLower = dishName.toLowerCase();
    const simpleKeywords = [
      "sugo", "pomodoro", "aglio e olio", "aglio, olio", "cacio e pepe", "arrabbiata",
      "burro", "salvia", "semplice", "veloce", "rapido", "velocissima", "pomodorini",
      "basilico", "al sugo", "pesto veloce", "frittata", "bruschetta"
    ];
    const isSimpleDish = simpleKeywords.some(kw => dishLower.includes(kw));

    let simpleConstraint = "";
    if (isSimpleDish) {
      simpleConstraint = `
ATTENZIONE (RICHIESTA DI MASSIMA SEMPLICITÀ):
L'utente ha cercato un piatto tradizionale molto semplice, veloce e casalingo ("${dishName}").
- Devi impostare "difficulty" rigorosamente a "Facile".
- Devi impostare "prepTime" a massimo "15 min", "20 min" o "25 min" (un tempo rapido, assolutamente non superiore ai 30 minuti).
- Gli ingredienti devono essere pochi, economici e di base (es. Pasta, Olio extravergine, Aglio, Pomodori pelati o passata, Sale, Basilico fresco).
- Il procedimento e le "instructions" devono essere lineari, rapidi e comprensibili (massimo 4-5 passaggi semplici e diretti).
- NON proporre versioni gourmet o stellate elaborate, non inserire lunghe riduzioni da ore o ingredienti complessi. Conserva la purezza e la velocità della cucina casalinga immediata.`;
    }

    const prompt = `Genera una ricetta tradizionale regionale italiana autentica per il piatto chiamato "${dishName}". Assicurati che lo stile culinario corrisponda veramente alla regione indicata ed esalti la ricca eredità enogastronomica italiana. Fai in modo che le grammature siano chiare ed i passaggi numerati precisi.${simpleConstraint}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Sei un esperto accademico e rinomato chef stellato esperto della cucina tradizionale regionale italiana. Genera una scheda ricetta autentica, dettagliata ed accurata, redatta interamente in lingua italiana, per il piatto specificato. Capisci l'intento culinario: se l'utente richiede un piatto casalingo di per sé facile e veloce (come pasta al sugo, pasta al pomodoro, aglio e olio, frittata bicolore, bruschetta del contadino ecc.), devi assolutamente preservare questa immediatezza compilando difficoltà 'Facile', durata inferiore a 30 min, e passaggi semplici.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nome esatto della ricetta tradizionale, es. 'Cacciucco alla Livornese'" },
            region: { type: Type.STRING, description: "La specifica regione italiana di origine (es. 'Toscana', 'Sicilia', 'Calabria', ecc.)" },
            macroRegion: { 
              type: Type.STRING, 
              enum: ["Nord", "Centro", "Sud"], 
              description: "Filtro macroregionale: Nord, Centro, o Sud" 
            },
            prepTime: { type: Type.STRING, description: "Tempo totale di preparazione, es. '45 min' o '2 ore'" },
            difficulty: { 
              type: Type.STRING, 
              enum: ["Facile", "Media", "Difficile"], 
              description: "Livello di difficoltà" 
            },
            ingredients: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Lista degli ingredienti con grammature (es. '320g Riso Carnaroli', '100g Cipolla', '1 pizzico di Sale')" 
            },
            instructions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Lista sequenziale e articolata delle istruzioni necessarie alla preparazione del piatto" 
            },
            description: { type: Type.STRING, description: "Una ricca e invitante descrizione culturale, storica e sensoriale della ricetta." },
            servings: { type: Type.INTEGER, description: "Numero predefinito di porzioni (utilizza 4)" }
          },
          required: ["name", "region", "macroRegion", "prepTime", "difficulty", "ingredients", "instructions", "description", "servings"]
        }
      }
    });

    const jsonText = response.text?.trim() || "{}";
    const parsedRecipe = JSON.parse(jsonText);

    // Supplement with calculated metadata
    const recipeId = `ai-${dishName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const image = getItalianFoodImage(parsedRecipe.name, parsedRecipe.description);

    const completeRecipe = {
      ...parsedRecipe,
      id: recipeId,
      image,
      featured: false,
      isAiGenerated: true
    };

    res.json(completeRecipe);
  } catch (error: any) {
    logGeminiError("Generazione Ricetta", error);
    try {
      const parsedRecipe = getLocalRecipeGenerator(dishName);
      const recipeId = `ai-${dishName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const image = getItalianFoodImage(parsedRecipe.name, parsedRecipe.description);

      const completeRecipe = {
        ...parsedRecipe,
        id: recipeId,
        image,
        featured: false,
        isAiGenerated: true
      };
      res.json(completeRecipe);
    } catch (fallbackErr: any) {
      console.error("Errore anche nel generatore di ricette locale:", fallbackErr);
      res.status(500).json({ error: "Siamo spiacenti, impossibile generare la ricetta classica." });
    }
  }
});

// Dynamic Wine Recommendation pairing based on recipe traits using Gemini 3.5-flash
app.post("/api/recommend-wine", async (req, res) => {
  const { recipeName, region, ingredients, description } = req.body;
  if (!recipeName || typeof recipeName !== "string" || recipeName.trim() === "") {
    return res.status(400).json({ error: "Il nome della ricetta è richiesto" });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("Client Gemini non configurato o non attivo");
    }

    const ingredientsContext = ingredients && Array.isArray(ingredients) ? ingredients.join(", ") : "";
    
    const prompt = `Suggerisci un abbinamento con un vino italiano autentico d'eccellenza per la ricetta "${recipeName}" della regione "${region || 'Italia'}". 
Ingredienti principali: ${ingredientsContext}.
Descrizione piatto: ${description || ''}.

Trova un vino che esalti al meglio le caratteristiche del piatto, preferibilmente della stessa regione d'origine ("${region || 'Italia'}"), spiegando dettagliatamente e in modo invitante il motivo dell'abbinamento.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Sei un sommelier stellato, docente Master della Sommelierie Italiana ed esperto di abbinamenti enogastronomici territoriali. Suggerisci abbinamenti d'eccellenza, storici e sensorialmente perfetti. Compila le proprietà del JSON interamente in lingua italiana.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nome esatto del vino DOC o DOCG, es. 'Sassicaia Bolgheri Sassicaia DOC', 'Vermentino di Gallura Superiore DOCG', ecc." },
            type: { type: Type.STRING, description: "Tipologia del vino, es. 'Rosso rubino intenso, speziato, caldo e persistente', 'Bianco paglierino brillante, fresco, sapido e minerale', ecc." },
            grape: { type: Type.STRING, description: "Vitigno o vitigni principali impiegati, es. 'Nebbiolo 100%' o 'Sangiovese 85%, Canaiolo 15%'" },
            producerRegion: { type: Type.STRING, description: "Regione italiana di produzione del vino, es. 'Piedmont', 'Tuscany', 'Sardinia' in italiano" },
            pairingMotivation: { type: Type.STRING, description: "Spiegazione poetica ed esperta del motivo dell'abbinamento, spiegando come le doti del vino (acidità, tannini, morbidezza) supportino e integrino la ricetta o offrano un connubio tradizionale." }
          },
          required: ["name", "type", "grape", "producerRegion", "pairingMotivation"]
        }
      }
    });

    const jsonText = response.text?.trim() || "{}";
    const recommendedWine = JSON.parse(jsonText);

    res.json(recommendedWine);
  } catch (error: any) {
    logGeminiError("Raccomandazione Vino", error);
    try {
      const recommendedWine = getLocalWinePairing(recipeName, region, ingredients, description);
      res.json(recommendedWine);
    } catch (fallbackErr: any) {
      console.error("Errore nel sommelier di backup del vino:", fallbackErr);
      res.status(500).json({ error: "Impossibile ottenere l'abbinamento dal sommelier" });
    }
  }
});

// Configure Vite integration and start the listener
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

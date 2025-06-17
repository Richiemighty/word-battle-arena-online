
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Trophy, Target, Clock, Link } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface WordChainGameRoomProps {
  onBack: () => void;
}

const WordChainGameRoom = ({ onBack }: WordChainGameRoomProps) => {
  const [currentWord, setCurrentWord] = useState("WORD");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [computerResponse, setComputerResponse] = useState("");
  const [showComputerResponse, setShowComputerResponse] = useState(false);
  const { playSound } = useSoundEffects();

  // Common English words for computer responses
  const commonWords = [
    "apple", "elephant", "tiger", "rain", "night", "tree", "egg", "gold", "dog", "game",
    "mouse", "sun", "net", "top", "pen", "note", "earth", "hat", "table", "energy",
    "yellow", "water", "road", "dance", "eye", "green", "nest", "time", "end",
    "door", "rock", "key", "yarn", "new", "wind", "duck", "king", "garden", "north",
    "great", "eat", "team", "mean", "near", "dear", "year", "hear", "clear", "tear",
      "dog", "cat", "elephant", "lion", "tiger", "bear", "zebra", "giraffe", "hippopotamus", "rhinoceros",
      "kangaroo", "koala", "panda", "wolf", "fox", "deer", "moose", "buffalo", "antelope", "leopard",
      "cheetah", "crocodile", "alligator", "lizard", "snake", "cobra", "python", "viper", "turtle", "tortoise",
      "frog", "toad", "salamander", "newt", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish",
      "crab", "lobster", "shrimp", "starfish", "clam", "snail", "slug", "ant", "bee", "wasp", "butterfly",
      "moth", "spider", "scorpion", "bat", "rat", "mouse", "hamster", "guinea pig", "horse", "donkey",
      "camel", "llama", "alpaca", "pig", "cow", "goat", "sheep", "chicken", "duck", "goose", "turkey",
      "peacock", "eagle", "hawk", "falcon", "owl", "parrot", "pigeon", "sparrow", "penguin", "flamingo",
      "seal", "walrus", "otter", "beaver", "platypus", "porcupine", "hedgehog", "armadillo", "aardvark",
      "chimpanzee", "gorilla", "orangutan", "baboon", "lemur", "meerkat", "mongoose", "raccoon", "skunk",
      "boar", "yak", "bison", "ocelot", "jaguar", "caracal", "lynx", "cougar", "panther", "civet",
      "genet", "serval", "snow leopard", "clouded leopard", "dhole", "dingoe", "jackal", "hyena", "wolverine",
      "ferret", "weasel", "stoat", "ermine", "badger", "mink", "quokka", "wallaby", "tasmanian devil", "bandicoot",
      "numbat", "echidna", "tenrec", "slow loris", "tarsier", "aye-aye", "capuchin", "marmoset", "howler monkey", "saki",
      "uakari", "proboscis monkey", "gelada", "mandrill", "colobus", "gibbon", "manatee", "dugong", "narwhal", "beluga",
      "blue whale", "orca", "minke whale", "fin whale", "humpback whale", "sperm whale", "saola", "markhor", "ibex", "tahr",
      "chamois", "hartebeest", "gnu", "eland", "springbok", "kudu", "gerbil", "vole", "lemming", "capybara", "agouti",
      "paca", "nutria", "pangolin", "solenodon", "desman", "shrew", "mole", "hedgehog", "tapir", "okapi", "aardwolf",
      "fossa", "coati", "kinkajou", "tasmanian tiger", "quoll", "numididae", "cassowary", "emu", "kiwi", "rhea",
      "albatross", "booby", "frigatebird", "tern", "auk", "gannet", "loon", "heron", "egret", "ibis",
      "spoonbill", "crane", "stork", "bustard", "kookaburra", "lyrebird", "magpie", "toucan", "hornbill", "hoatzin",
      "weaver", "drongo", "babbler", "cuckoo", "nightjar", "swift", "swallow", "kingfisher", "woodpecker", "nuthatch",
      "wren", "warbler", "thrush", "oriole", "finch", "canary", "crossbill", "siskin", "lark", "pipit",
      "bittern", "rail", "coot", "grebe", "darter", "anhinga", "turaco", "ptarmigan", "grouse", "quail",
      "partridge", "pheasant", "horned toad", "monitor lizard", "iguana", "gecko", "chameleon", "anole", "skink", "basilisk",
      "caiman", "gavial", "komodo dragon", "sawfish", "ray", "stingray", "manta ray", "goby", "eel", "barracuda",
      "anchovy", "herring", "sardine", "cod", "haddock", "flounder", "halibut", "sole", "tilapia", "catfish",
      "piranha", "tetra", "angelfish", "guppy", "molly", "platy", "goldfish", "koi", "betta", "clownfish",
      "seahorse", "pipefish", "sunfish", "lionfish", "scorpionfish", "stonefish", "blowfish", "porcupinefish", "boxfish", "pufferfish",
      "salmon", "trout", "carp", "bass", "perch", "walleye", "pike", "muskellunge", "zander", "gar",
      "bowfin", "sturgeon", "lamprey", "hagfish", "lungfish", "coelacanth", "arowana", "bichir", "mudskipper", "electric eel",
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'pineapple', 'mango', 'papaya', 'kiwi',
      'peach', 'pear', 'cherry', 'plum', 'watermelon', 'cantaloupe', 'coconut', 'lemon', 'lime', 'avocado',
      'apricot', 'nectarine', 'blackberry', 'raspberry', 'cranberry', 'pomegranate', 'fig', 'guava', 'passionfruit', 'dragonfruit',
      'jackfruit', 'durian', 'lychee', 'longan', 'tamarind', 'starfruit', 'rambutan', 'soursop', 'custard apple', 'mulberry',
      'boysenberry', 'gooseberry', 'elderberry', 'acerola', 'persimmon', 'quince', 'jabuticaba', 'sapodilla', 'loquat', 'medlar',
      'miracle fruit', 'breadfruit', 'ackee', 'salak', 'horned melon', 'buddhas hand', 'mangosteen', 'langsat', 'santol', 'rose apple',
      'bilimbi', 'naranjilla', 'camu camu', 'huckleberry', 'jostaberry', 'tangelo', 'ugli fruit', 'pomelo', 'calamansi', 'yuzu',
      'kumquat', 'bergamot', 'clementine', 'mandarin', 'tangerine', 'blood orange', 'white currant', 'red currant', 'black currant', 'barberry',
      'sea buckthorn', 'amarena cherry', 'yellow passionfruit', 'ice cream bean', 'marang', 'pepino melon', 'feijoa', 'cherimoya', 'bael', 'mamoncillo',
      'pineberry', 'cloudberry', 'rowan berry', 'hawthorn berry', 'serviceberry', 'mayhaw', 'indian gooseberry', 'ambarella', 'canistel', 'lucuma',
      'monstera deliciosa', 'sugar apple', 'keppel fruit', 'cupuacu', 'camu-camu', 'nashi pear', 'desert lime', 'illawarra plum', 'muntries', 'finger lime',
      'santol', 'mamey sapote', 'black sapote', 'white sapote', 'tamarillo', 'chokecherry', 'desert fig', 'morinda', 'biriba', 'chalta',
      'jambolan', 'muntingia', 'wood apple', 'betel nut', 'langsat', 'duku', 'velvet apple', 'cudrania', 'cudrania tricuspidata', 'santol',
      'monkey orange', 'baobab fruit', 'marula', 'imbe', 'safou', 'african star apple', 'terap', 'pulasan', 'santol', 'genip',
      'ice apple', 'java apple', 'mammee apple', 'cashew apple', 'malay apple', 'rose apple', 'star apple', 'black cherry', 'yellow cherry', 'surinam cherry',
      'white mulberry', 'purple mangosteen', 'green sapote', 'illama', 'pindo palm fruit', 'oil palm fruit', 'peach palm fruit', 'doum palm fruit', 'snakefruit', 'yangmei',
      'cherry plum', 'greengage', 'damson', 'mirabelle plum', 'sloe', 'hackberry', 'buffaloberry', 'desert banana', 'desert quandong', 'bignay',
      'maqui berry', 'chilean guava', 'chiltepin pepper fruit', 'miracle berry', 'melon pear', 'indian almond fruit', 'hog plum', 'nipa palm fruit', 'guavaberry', 'sea grape',
      'pili nut fruit', 'brazilian guava', 'screw pine fruit', 'cattley guava', 'red mombin', 'yellow mombin', 'tahitian lime', 'wild lime', 'key lime', 'mountain soursop',
      'giant granadilla', 'banana passionfruit', 'sweet granadilla', 'finger banana', 'plantain', 'baby banana', 'red banana', 'manzano banana', 'ice cream banana', 'apple banana',
      'wine grape', 'concord grape', 'moon drop grape', 'cotton candy grape', 'muscat grape', 'scuppernong grape', 'zinfandel grape', 'chasselas', 'fox grape', 'vitamin C berry',
      'bush tomato', 'australian finger lime', 'kakadu plum', 'native currant', 'sandpaper fig', 'bunya nut fruit', 'midyim berry', 'red bush apple', 'water apple', 'jungle plum',
      'france', 'japan', 'brazil', 'canada', 'australia', 'germany', 'italy', 'spain', 'mexico', 'india',
      'china', 'russia', 'egypt', 'nigeria', 'argentina', 'chile', 'norway', 'sweden', 'thailand', 'vietnam',
      'united states', 'united kingdom', 'south africa', 'kenya', 'ethiopia', 'ghana', 'morocco', 'algeria', 'tunisia', 'libya',
      'iraq', 'iran', 'israel', 'saudi arabia', 'united arab emirates', 'qatar', 'kuwait', 'turkey', 'greece', 'portugal',
      'netherlands', 'belgium', 'switzerland', 'austria', 'poland', 'czech republic', 'slovakia', 'hungary', 'romania', 'bulgaria',
      'croatia', 'slovenia', 'serbia', 'bosnia and herzegovina', 'montenegro', 'north macedonia', 'albania', 'iceland', 'finland', 'denmark',
      'ireland', 'ukraine', 'belarus', 'moldova', 'georgia', 'armenia', 'azerbaijan', 'kazakhstan', 'uzbekistan', 'turkmenistan',
      'kyrgyzstan', 'tajikistan', 'afghanistan', 'pakistan', 'bangladesh', 'sri lanka', 'nepal', 'bhutan', 'maldives', 'myanmar',
      'laos', 'cambodia', 'malaysia', 'indonesia', 'philippines', 'south korea', 'north korea', 'mongolia', 'new zealand', 'fiji',
      'papua new guinea', 'solomon islands', 'vanuatu', 'samoa', 'tonga', 'palau', 'micronesia', 'marshall islands', 'nauru', 'kiribati',
      'singapore', 'brunei', 'east timor', 'venezuela', 'colombia', 'peru', 'ecuador', 'uruguay', 'paraguay', 'bolivia',
      'panama', 'costa rica', 'nicaragua', 'honduras', 'el salvador', 'guatemala', 'belize', 'cuba', 'haiti', 'dominican republic',
      'jamaica', 'trinidad and tobago', 'barbados', 'bahamas', 'grenada', 'saint lucia', 'saint vincent and the grenadines', 'antigua and barbuda',
      'saint kitts and nevis', 'dominica', 'venezuela', 'suriname', 'guyana', 'namibia', 'zambia', 'zimbabwe', 'mozambique', 'angola',
      'malawi', 'botswana', 'lesotho', 'eswatini', 'tanzania', 'uganda', 'rwanda', 'burundi', 'democratic republic of the congo', 'republic of the congo',
      'central african republic', 'cameroon', 'gabon', 'equatorial guinea', 'chad', 'niger', 'mali', 'senegal', 'gambia', 'guinea',
      'guinea-bissau', 'sierra leone', 'liberia', 'ivory coast', 'benin', 'togo', 'cape verde', 'mauritania', 'sudan', 'south sudan',
      'somalia', 'djibouti', 'eritrea', 'seychelles', 'comoros', 'madagascar', 'mauritius', 'palestine', 'vatican city',
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white',
      'gray', 'violet', 'indigo', 'turquoise', 'magenta', 'cyan', 'lime', 'maroon', 'navy', 'olive',
      'teal', 'coral', 'salmon', 'peach', 'beige', 'ivory', 'lavender', 'tan', 'gold', 'silver',
      'bronze', 'amber', 'charcoal', 'mint', 'plum', 'crimson', 'burgundy', 'mustard', 'aquamarine', 'periwinkle',
      'apricot', 'chartreuse', 'ochre', 'saffron', 'copper', 'brick', 'cerulean', 'fuchsia', 'eggplant', 'canary yellow',
      'sea green', 'forest green', 'sky blue', 'baby blue', 'royal blue', 'midnight blue', 'neon green', 'neon pink', 'hot pink', 'bubblegum pink',
      'rust', 'mahogany', 'sand', 'sepia', 'wheat', 'slate gray', 'steel blue', 'azure', 'alabaster', 'jet black',
      'ebony', 'snow', 'blush', 'indian red', 'firebrick', 'rose', 'mulberry', 'powder blue', 'flamingo', 'mocha',
      'denim', 'khaki', 'orchid', 'raspberry', 'lemon', 'pine green', 'sage', 'jade', 'taupe', 'hazel',
      'cobalt', 'cherry', 'carnation pink', 'persian blue', 'ice blue', 'shadow', 'dusty rose', 'space gray', 'mint cream', 'ash gray',
      'manatee', 'onyx', 'zucchini green', 'puce', 'celadon', 'moss green', 'drab', 'bistre', 'tangerine', 'sunset orange',
      'pastel yellow', 'pastel green', 'pastel blue', 'pastel pink', 'electric blue', 'fluorescent green', 'lava', 'amaranth', 'lapis lazuli', 'taupe gray',
      'football', 'basketball', 'tennis', 'swimming', 'baseball', 'volleyball', 'hockey', 'golf', 'boxing', 'wrestling',
      'running', 'cycling', 'skiing', 'surfing', 'climbing', 'badminton', 'cricket', 'rugby', 'soccer', 'racing',
      'table tennis', 'handball', 'squash', 'judo', 'karate', 'taekwondo', 'archery', 'fencing', 'gymnastics', 'equestrian',
      'skateboarding', 'snowboarding', 'bobsledding', 'luge', 'biathlon', 'triathlon', 'pentathlon', 'rowing', 'canoeing', 'kayaking',
      'sailing', 'speed skating', 'figure skating', 'ice dancing', 'ballet on ice', 'billiards', 'snooker', 'darts', 'bowling', 'paintball',
      'polo', 'water polo', 'lacrosse', 'motocross', 'bmx', 'parkour', 'freerunning', 'kickboxing', 'muay thai', 'capoeira',
      'sumo wrestling', 'powerlifting', 'weightlifting', 'strongman', 'crossfit', 'cheerleading', 'diving', 'synchronized swimming', 'bodybuilding', 'orienteering',
      'speed climbing', 'mountaineering', 'trail running', 'ultramarathon', 'ice hockey', 'field hockey', 'indoor soccer', 'futsal', 'beach soccer', 'beach volleyball',
      'paddleboarding', 'windsurfing', 'kitesurfing', 'paragliding', 'hang gliding', 'skydiving', 'base jumping', 'bungee jumping', 'sailing', 'dragon boat racing',
      'drone racing', 'esports', 'auto racing', 'kart racing', 'formula one', 'rally racing', 'jet skiing', 'wakeboarding', 'horse racing', 'bull riding',
      'rodeo', 'sambo', 'aikido', 'chessboxing', 'chess', 'draughts', 'kabaddi', 'sepak takraw', 'hurling', 'shinty',
      'pelota', 'petanque', 'boules', 'curling', 'gaelic football', 'australian rules football', 'floorball', 'wushu', 'ninjutsu', 'underwater hockey',
      'underwater rugby', 'ice climbing', 'speedcubing', 'obstacle course racing', 'mud run', 'tug of war', 'arm wrestling', 'footgolf', 'pickleball', 'quidditch',
      'roller derby', 'roller skating', 'speedway', 'air racing', 'gliding', 'boomerang', 'softball', 'kite flying (competitive)', 'sandboarding', 'snowmobiling',
      'pizza', 'burger', 'sushi', 'pasta', 'salad', 'soup', 'sandwich', 'tacos', 'rice', 'bread',
      'cheese', 'chicken', 'beef', 'fish', 'vegetables', 'noodles', 'curry', 'steak', 'pancakes', 'waffles',
      'shawarma', 'hummus', 'falafel', 'dimsum', 'ramen', 'pho', 'biryani', 'naan', 'butter chicken', 'shakshuka',
      'paella', 'empanada', 'enchilada', 'lasagna', 'risotto', 'gnocchi', 'dumplings', 'kimchi', 'bibimbap', 'ceviche',
      'yakitori', 'teriyaki', 'satay', 'kebab', 'hotdog', 'doner kebab', 'spring roll', 'croissant', 'bagel', 'quiche',
      'jollof rice', 'fried rice', 'ofada rice', 'egusi soup', 'ogbono soup', 'okro soup', 'vegetable soup', 'afang soup', 'edikang ikong', 'ogbono',
      'nsala soup', 'ogbono soup', 'draw soup', 'banga soup', 'atama', 'atama soup', 'gbegiri', 'ewedu', 'efo riro', 'ayamase (ofada stew)', 'ofe nsala',
      'ofe akwu', 'nkwobi', 'isi ewu', 'abacha', 'ugba', 'ogiri', 'ukodo (yam pepper soup)', 'yam porridge', 'beans porridge', 'ewa agoyin',
      'moimoi', 'akara', 'suya', 'kilishi', 'asun', 'pepper soup', 'banga rice', 'tuwo shinkafa', 'tuwo masara', 'masa',
      'fufu', 'amala', 'semo', 'eba', 'pounded yam', 'plantain', 'boiled yam', 'roasted yam', 'yam and egg', 'yam balls',
      'banku', 'kenkey', 'fufu', 'koki', 'ndolé', 'kushari', 'injera', 'wat', 'chapati', 'matoke',
      'meat pie', 'fish roll', 'egg roll', 'chin chin', 'puff puff', 'buns', 'scotch egg', 'sausage roll', 'doughnut', 'samosa',
      'oats', 'pap', 'akamu', 'cereal', 'toast', 'boiled egg', 'tea', 'coffee', 'spaghetti', 'indomie',
      'ice cream', 'cake', 'cookies', 'brownies', 'chocolate', 'cupcakes', 'banana bread', 'chin chin (sweet)', 'zobo (hibiscus drink)', 'kunu',
      'zobo', 'kunu', 'tigernut milk', 'fura da nono', 'palm wine', 'chapman', 'coke', 'fanta', 'malt', 'smoothie',
      'cassava', 'yam', 'cocoyam', 'sweet potato', 'potato', 'plantain', 'rice', 'corn', 'maize', 'millet'
  ];

  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore_wordchain');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);

  const isValidEnglishWord = (word: string): boolean => {
    // Basic validation - in a real app, you'd use a proper dictionary API
    const validWords = [
      ...commonWords,
      "cat", "bat", "rat", "hat", "mat", "fat", "sat", "pat", "vat", "chat",
      "dog", "log", "fog", "hog", "jog", "cog", "bog", "frog", "blog", "clog",
      "car", "bar", "far", "jar", "tar", "war", "star", "scar", "char", "czar",
      "run", "sun", "fun", "gun", "bun", "nun", "pun", "stun", "spun", "shun",
      "book", "look", "took", "cook", "hook", "nook", "brook", "crook", "shook",
      "home", "dome", "tome", "some", "come", "rome", "chrome", "genome",
      "play", "way", "day", "say", "may", "bay", "lay", "pay", "gay", "hay",
      "love", "dove", "above", "glove", "shove", "grove", "drove", "stove",
      "time", "lime", "dime", "mime", "prime", "crime", "chime", "rhyme",
      "water", "later", "greater", "theater", "sweater", "crater", "plater",
      "apple", "elephant", "tiger", "rain", "night", "tree", "egg", "gold", "dog", "game",
    "mouse", "sun", "net", "top", "pen", "note", "earth", "hat", "table", "energy",
    "yellow", "water", "road", "dance", "eye", "green", "nest", "time", "end",
    "door", "rock", "key", "yarn", "new", "wind", "duck", "king", "garden", "north",
    "great", "eat", "team", "mean", "near", "dear", "year", "hear", "clear", "tear",
      "dog", "cat", "elephant", "lion", "tiger", "bear", "zebra", "giraffe", "hippopotamus", "rhinoceros",
      "kangaroo", "koala", "panda", "wolf", "fox", "deer", "moose", "buffalo", "antelope", "leopard",
      "cheetah", "crocodile", "alligator", "lizard", "snake", "cobra", "python", "viper", "turtle", "tortoise",
      "frog", "toad", "salamander", "newt", "whale", "dolphin", "shark", "octopus", "squid", "jellyfish",
      "crab", "lobster", "shrimp", "starfish", "clam", "snail", "slug", "ant", "bee", "wasp", "butterfly",
      "moth", "spider", "scorpion", "bat", "rat", "mouse", "hamster", "guinea pig", "horse", "donkey",
      "camel", "llama", "alpaca", "pig", "cow", "goat", "sheep", "chicken", "duck", "goose", "turkey",
      "peacock", "eagle", "hawk", "falcon", "owl", "parrot", "pigeon", "sparrow", "penguin", "flamingo",
      "seal", "walrus", "otter", "beaver", "platypus", "porcupine", "hedgehog", "armadillo", "aardvark",
      "chimpanzee", "gorilla", "orangutan", "baboon", "lemur", "meerkat", "mongoose", "raccoon", "skunk",
      "boar", "yak", "bison", "ocelot", "jaguar", "caracal", "lynx", "cougar", "panther", "civet",
      "genet", "serval", "snow leopard", "clouded leopard", "dhole", "dingoe", "jackal", "hyena", "wolverine",
      "ferret", "weasel", "stoat", "ermine", "badger", "mink", "quokka", "wallaby", "tasmanian devil", "bandicoot",
      "numbat", "echidna", "tenrec", "slow loris", "tarsier", "aye-aye", "capuchin", "marmoset", "howler monkey", "saki",
      "uakari", "proboscis monkey", "gelada", "mandrill", "colobus", "gibbon", "manatee", "dugong", "narwhal", "beluga",
      "blue whale", "orca", "minke whale", "fin whale", "humpback whale", "sperm whale", "saola", "markhor", "ibex", "tahr",
      "chamois", "hartebeest", "gnu", "eland", "springbok", "kudu", "gerbil", "vole", "lemming", "capybara", "agouti",
      "paca", "nutria", "pangolin", "solenodon", "desman", "shrew", "mole", "hedgehog", "tapir", "okapi", "aardwolf",
      "fossa", "coati", "kinkajou", "tasmanian tiger", "quoll", "numididae", "cassowary", "emu", "kiwi", "rhea",
      "albatross", "booby", "frigatebird", "tern", "auk", "gannet", "loon", "heron", "egret", "ibis",
      "spoonbill", "crane", "stork", "bustard", "kookaburra", "lyrebird", "magpie", "toucan", "hornbill", "hoatzin",
      "weaver", "drongo", "babbler", "cuckoo", "nightjar", "swift", "swallow", "kingfisher", "woodpecker", "nuthatch",
      "wren", "warbler", "thrush", "oriole", "finch", "canary", "crossbill", "siskin", "lark", "pipit",
      "bittern", "rail", "coot", "grebe", "darter", "anhinga", "turaco", "ptarmigan", "grouse", "quail",
      "partridge", "pheasant", "horned toad", "monitor lizard", "iguana", "gecko", "chameleon", "anole", "skink", "basilisk",
      "caiman", "gavial", "komodo dragon", "sawfish", "ray", "stingray", "manta ray", "goby", "eel", "barracuda",
      "anchovy", "herring", "sardine", "cod", "haddock", "flounder", "halibut", "sole", "tilapia", "catfish",
      "piranha", "tetra", "angelfish", "guppy", "molly", "platy", "goldfish", "koi", "betta", "clownfish",
      "seahorse", "pipefish", "sunfish", "lionfish", "scorpionfish", "stonefish", "blowfish", "porcupinefish", "boxfish", "pufferfish",
      "salmon", "trout", "carp", "bass", "perch", "walleye", "pike", "muskellunge", "zander", "gar",
      "bowfin", "sturgeon", "lamprey", "hagfish", "lungfish", "coelacanth", "arowana", "bichir", "mudskipper", "electric eel",
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'pineapple', 'mango', 'papaya', 'kiwi',
      'peach', 'pear', 'cherry', 'plum', 'watermelon', 'cantaloupe', 'coconut', 'lemon', 'lime', 'avocado',
      'apricot', 'nectarine', 'blackberry', 'raspberry', 'cranberry', 'pomegranate', 'fig', 'guava', 'passionfruit', 'dragonfruit',
      'jackfruit', 'durian', 'lychee', 'longan', 'tamarind', 'starfruit', 'rambutan', 'soursop', 'custard apple', 'mulberry',
      'boysenberry', 'gooseberry', 'elderberry', 'acerola', 'persimmon', 'quince', 'jabuticaba', 'sapodilla', 'loquat', 'medlar',
      'miracle fruit', 'breadfruit', 'ackee', 'salak', 'horned melon', 'buddhas hand', 'mangosteen', 'langsat', 'santol', 'rose apple',
      'bilimbi', 'naranjilla', 'camu camu', 'huckleberry', 'jostaberry', 'tangelo', 'ugli fruit', 'pomelo', 'calamansi', 'yuzu',
      'kumquat', 'bergamot', 'clementine', 'mandarin', 'tangerine', 'blood orange', 'white currant', 'red currant', 'black currant', 'barberry',
      'sea buckthorn', 'amarena cherry', 'yellow passionfruit', 'ice cream bean', 'marang', 'pepino melon', 'feijoa', 'cherimoya', 'bael', 'mamoncillo',
      'pineberry', 'cloudberry', 'rowan berry', 'hawthorn berry', 'serviceberry', 'mayhaw', 'indian gooseberry', 'ambarella', 'canistel', 'lucuma',
      'monstera deliciosa', 'sugar apple', 'keppel fruit', 'cupuacu', 'camu-camu', 'nashi pear', 'desert lime', 'illawarra plum', 'muntries', 'finger lime',
      'santol', 'mamey sapote', 'black sapote', 'white sapote', 'tamarillo', 'chokecherry', 'desert fig', 'morinda', 'biriba', 'chalta',
      'jambolan', 'muntingia', 'wood apple', 'betel nut', 'langsat', 'duku', 'velvet apple', 'cudrania', 'cudrania tricuspidata', 'santol',
      'monkey orange', 'baobab fruit', 'marula', 'imbe', 'safou', 'african star apple', 'terap', 'pulasan', 'santol', 'genip',
      'ice apple', 'java apple', 'mammee apple', 'cashew apple', 'malay apple', 'rose apple', 'star apple', 'black cherry', 'yellow cherry', 'surinam cherry',
      'white mulberry', 'purple mangosteen', 'green sapote', 'illama', 'pindo palm fruit', 'oil palm fruit', 'peach palm fruit', 'doum palm fruit', 'snakefruit', 'yangmei',
      'cherry plum', 'greengage', 'damson', 'mirabelle plum', 'sloe', 'hackberry', 'buffaloberry', 'desert banana', 'desert quandong', 'bignay',
      'maqui berry', 'chilean guava', 'chiltepin pepper fruit', 'miracle berry', 'melon pear', 'indian almond fruit', 'hog plum', 'nipa palm fruit', 'guavaberry', 'sea grape',
      'pili nut fruit', 'brazilian guava', 'screw pine fruit', 'cattley guava', 'red mombin', 'yellow mombin', 'tahitian lime', 'wild lime', 'key lime', 'mountain soursop',
      'giant granadilla', 'banana passionfruit', 'sweet granadilla', 'finger banana', 'plantain', 'baby banana', 'red banana', 'manzano banana', 'ice cream banana', 'apple banana',
      'wine grape', 'concord grape', 'moon drop grape', 'cotton candy grape', 'muscat grape', 'scuppernong grape', 'zinfandel grape', 'chasselas', 'fox grape', 'vitamin C berry',
      'bush tomato', 'australian finger lime', 'kakadu plum', 'native currant', 'sandpaper fig', 'bunya nut fruit', 'midyim berry', 'red bush apple', 'water apple', 'jungle plum',
      'france', 'japan', 'brazil', 'canada', 'australia', 'germany', 'italy', 'spain', 'mexico', 'india',
      'china', 'russia', 'egypt', 'nigeria', 'argentina', 'chile', 'norway', 'sweden', 'thailand', 'vietnam',
      'united states', 'united kingdom', 'south africa', 'kenya', 'ethiopia', 'ghana', 'morocco', 'algeria', 'tunisia', 'libya',
      'iraq', 'iran', 'israel', 'saudi arabia', 'united arab emirates', 'qatar', 'kuwait', 'turkey', 'greece', 'portugal',
      'netherlands', 'belgium', 'switzerland', 'austria', 'poland', 'czech republic', 'slovakia', 'hungary', 'romania', 'bulgaria',
      'croatia', 'slovenia', 'serbia', 'bosnia and herzegovina', 'montenegro', 'north macedonia', 'albania', 'iceland', 'finland', 'denmark',
      'ireland', 'ukraine', 'belarus', 'moldova', 'georgia', 'armenia', 'azerbaijan', 'kazakhstan', 'uzbekistan', 'turkmenistan',
      'kyrgyzstan', 'tajikistan', 'afghanistan', 'pakistan', 'bangladesh', 'sri lanka', 'nepal', 'bhutan', 'maldives', 'myanmar',
      'laos', 'cambodia', 'malaysia', 'indonesia', 'philippines', 'south korea', 'north korea', 'mongolia', 'new zealand', 'fiji',
      'papua new guinea', 'solomon islands', 'vanuatu', 'samoa', 'tonga', 'palau', 'micronesia', 'marshall islands', 'nauru', 'kiribati',
      'singapore', 'brunei', 'east timor', 'venezuela', 'colombia', 'peru', 'ecuador', 'uruguay', 'paraguay', 'bolivia',
      'panama', 'costa rica', 'nicaragua', 'honduras', 'el salvador', 'guatemala', 'belize', 'cuba', 'haiti', 'dominican republic',
      'jamaica', 'trinidad and tobago', 'barbados', 'bahamas', 'grenada', 'saint lucia', 'saint vincent and the grenadines', 'antigua and barbuda',
      'saint kitts and nevis', 'dominica', 'venezuela', 'suriname', 'guyana', 'namibia', 'zambia', 'zimbabwe', 'mozambique', 'angola',
      'malawi', 'botswana', 'lesotho', 'eswatini', 'tanzania', 'uganda', 'rwanda', 'burundi', 'democratic republic of the congo', 'republic of the congo',
      'central african republic', 'cameroon', 'gabon', 'equatorial guinea', 'chad', 'niger', 'mali', 'senegal', 'gambia', 'guinea',
      'guinea-bissau', 'sierra leone', 'liberia', 'ivory coast', 'benin', 'togo', 'cape verde', 'mauritania', 'sudan', 'south sudan',
      'somalia', 'djibouti', 'eritrea', 'seychelles', 'comoros', 'madagascar', 'mauritius', 'palestine', 'vatican city',
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white',
      'gray', 'violet', 'indigo', 'turquoise', 'magenta', 'cyan', 'lime', 'maroon', 'navy', 'olive',
      'teal', 'coral', 'salmon', 'peach', 'beige', 'ivory', 'lavender', 'tan', 'gold', 'silver',
      'bronze', 'amber', 'charcoal', 'mint', 'plum', 'crimson', 'burgundy', 'mustard', 'aquamarine', 'periwinkle',
      'apricot', 'chartreuse', 'ochre', 'saffron', 'copper', 'brick', 'cerulean', 'fuchsia', 'eggplant', 'canary yellow',
      'sea green', 'forest green', 'sky blue', 'baby blue', 'royal blue', 'midnight blue', 'neon green', 'neon pink', 'hot pink', 'bubblegum pink',
      'rust', 'mahogany', 'sand', 'sepia', 'wheat', 'slate gray', 'steel blue', 'azure', 'alabaster', 'jet black',
      'ebony', 'snow', 'blush', 'indian red', 'firebrick', 'rose', 'mulberry', 'powder blue', 'flamingo', 'mocha',
      'denim', 'khaki', 'orchid', 'raspberry', 'lemon', 'pine green', 'sage', 'jade', 'taupe', 'hazel',
      'cobalt', 'cherry', 'carnation pink', 'persian blue', 'ice blue', 'shadow', 'dusty rose', 'space gray', 'mint cream', 'ash gray',
      'manatee', 'onyx', 'zucchini green', 'puce', 'celadon', 'moss green', 'drab', 'bistre', 'tangerine', 'sunset orange',
      'pastel yellow', 'pastel green', 'pastel blue', 'pastel pink', 'electric blue', 'fluorescent green', 'lava', 'amaranth', 'lapis lazuli', 'taupe gray',
      'football', 'basketball', 'tennis', 'swimming', 'baseball', 'volleyball', 'hockey', 'golf', 'boxing', 'wrestling',
      'running', 'cycling', 'skiing', 'surfing', 'climbing', 'badminton', 'cricket', 'rugby', 'soccer', 'racing',
      'table tennis', 'handball', 'squash', 'judo', 'karate', 'taekwondo', 'archery', 'fencing', 'gymnastics', 'equestrian',
      'skateboarding', 'snowboarding', 'bobsledding', 'luge', 'biathlon', 'triathlon', 'pentathlon', 'rowing', 'canoeing', 'kayaking',
      'sailing', 'speed skating', 'figure skating', 'ice dancing', 'ballet on ice', 'billiards', 'snooker', 'darts', 'bowling', 'paintball',
      'polo', 'water polo', 'lacrosse', 'motocross', 'bmx', 'parkour', 'freerunning', 'kickboxing', 'muay thai', 'capoeira',
      'sumo wrestling', 'powerlifting', 'weightlifting', 'strongman', 'crossfit', 'cheerleading', 'diving', 'synchronized swimming', 'bodybuilding', 'orienteering',
      'speed climbing', 'mountaineering', 'trail running', 'ultramarathon', 'ice hockey', 'field hockey', 'indoor soccer', 'futsal', 'beach soccer', 'beach volleyball',
      'paddleboarding', 'windsurfing', 'kitesurfing', 'paragliding', 'hang gliding', 'skydiving', 'base jumping', 'bungee jumping', 'sailing', 'dragon boat racing',
      'drone racing', 'esports', 'auto racing', 'kart racing', 'formula one', 'rally racing', 'jet skiing', 'wakeboarding', 'horse racing', 'bull riding',
      'rodeo', 'sambo', 'aikido', 'chessboxing', 'chess', 'draughts', 'kabaddi', 'sepak takraw', 'hurling', 'shinty',
      'pelota', 'petanque', 'boules', 'curling', 'gaelic football', 'australian rules football', 'floorball', 'wushu', 'ninjutsu', 'underwater hockey',
      'underwater rugby', 'ice climbing', 'speedcubing', 'obstacle course racing', 'mud run', 'tug of war', 'arm wrestling', 'footgolf', 'pickleball', 'quidditch',
      'roller derby', 'roller skating', 'speedway', 'air racing', 'gliding', 'boomerang', 'softball', 'kite flying (competitive)', 'sandboarding', 'snowmobiling',
      'pizza', 'burger', 'sushi', 'pasta', 'salad', 'soup', 'sandwich', 'tacos', 'rice', 'bread',
      'cheese', 'chicken', 'beef', 'fish', 'vegetables', 'noodles', 'curry', 'steak', 'pancakes', 'waffles',
      'shawarma', 'hummus', 'falafel', 'dimsum', 'ramen', 'pho', 'biryani', 'naan', 'butter chicken', 'shakshuka',
      'paella', 'empanada', 'enchilada', 'lasagna', 'risotto', 'gnocchi', 'dumplings', 'kimchi', 'bibimbap', 'ceviche',
      'yakitori', 'teriyaki', 'satay', 'kebab', 'hotdog', 'doner kebab', 'spring roll', 'croissant', 'bagel', 'quiche',
      'jollof rice', 'fried rice', 'ofada rice', 'egusi soup', 'ogbono soup', 'okro soup', 'vegetable soup', 'afang soup', 'edikang ikong', 'ogbono',
      'nsala soup', 'ogbono soup', 'draw soup', 'banga soup', 'atama', 'atama soup', 'gbegiri', 'ewedu', 'efo riro', 'ayamase (ofada stew)', 'ofe nsala',
      'ofe akwu', 'nkwobi', 'isi ewu', 'abacha', 'ugba', 'ogiri', 'ukodo (yam pepper soup)', 'yam porridge', 'beans porridge', 'ewa agoyin',
      'moimoi', 'akara', 'suya', 'kilishi', 'asun', 'pepper soup', 'banga rice', 'tuwo shinkafa', 'tuwo masara', 'masa',
      'fufu', 'amala', 'semo', 'eba', 'pounded yam', 'plantain', 'boiled yam', 'roasted yam', 'yam and egg', 'yam balls',
      'banku', 'kenkey', 'fufu', 'koki', 'ndolé', 'kushari', 'injera', 'wat', 'chapati', 'matoke',
      'meat pie', 'fish roll', 'egg roll', 'chin chin', 'puff puff', 'buns', 'scotch egg', 'sausage roll', 'doughnut', 'samosa',
      'oats', 'pap', 'akamu', 'cereal', 'toast', 'boiled egg', 'tea', 'coffee', 'spaghetti', 'indomie',
      'ice cream', 'cake', 'cookies', 'brownies', 'chocolate', 'cupcakes', 'banana bread', 'chin chin (sweet)', 'zobo (hibiscus drink)', 'kunu',
      'zobo', 'kunu', 'tigernut milk', 'fura da nono', 'palm wine', 'chapman', 'coke', 'fanta', 'malt', 'smoothie',
      'cassava', 'yam', 'cocoyam', 'sweet potato', 'potato', 'plantain', 'rice', 'corn', 'maize', 'millet'
    ];
    return validWords.includes(word.toLowerCase()) || word.length >= 3;
  };

  const startGame = async () => {
    await playSound('click');
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(180); // 3 minutes
    setUsedWords([]);
    setFeedback("");
    setStreak(0);
    setIsNewHighScore(false);
    setShowComputerResponse(false);
    setCurrentWord("WORD");
  };

  const generateComputerResponse = useCallback((lastLetter: string) => {
    const possibleWords = commonWords.filter(word => 
      word.toLowerCase().startsWith(lastLetter.toLowerCase()) && 
      !usedWords.includes(word)
    );
    
    if (possibleWords.length > 0) {
      const computerWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
      setComputerResponse(computerWord);
      setUsedWords(prev => [...prev, computerWord]);
      setShowComputerResponse(true);
      
      setTimeout(() => {
        setCurrentWord(computerWord.toUpperCase());
        setShowComputerResponse(false);
      }, 2000);
    } else {
      // Generate a random word if no matches
      const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)];
      setCurrentWord(randomWord.toUpperCase());
    }
  }, [usedWords]);

  const calculatePoints = (word: string): number => {
    let basePoints = 15; // Base 15 credits as requested
    
    // Bonus for longer words (5 points per extra letter beyond 3)
    if (word.length > 3) {
      basePoints += (word.length - 3) * 5;
    }
    
    // Streak bonus
    basePoints += streak * 2;
    
    return basePoints;
  };

  const submitWord = async () => {
    if (!userInput.trim() || !gameActive) return;

    const word = userInput.toLowerCase().trim();
    const lastLetterOfCurrent = currentWord[currentWord.length - 1].toLowerCase();
    const firstLetterOfInput = word[0].toLowerCase();

    // Check if word starts with the last letter of current word
    if (firstLetterOfInput === lastLetterOfCurrent && 
        isValidEnglishWord(word) && 
        !usedWords.includes(word)) {
      
      await playSound('correct');
      const points = calculatePoints(word);
      setScore(prev => prev + points);
      setUsedWords(prev => [...prev, word]);
      setStreak(prev => prev + 1);
      setFeedback(`Correct! +${points} credits`);
      
      // Generate computer response
      const lastLetter = word[word.length - 1];
      generateComputerResponse(lastLetter);
      
    } else {
      await playSound('incorrect');
      setStreak(0);
      if (usedWords.includes(word)) {
        setFeedback("Word already used!");
      } else if (firstLetterOfInput !== lastLetterOfCurrent) {
        setFeedback(`Word must start with "${lastLetterOfCurrent.toUpperCase()}"`);
      } else {
        setFeedback("Invalid word!");
      }
    }

    setUserInput("");
    setTimeout(() => setFeedback(""), 2000);
  };

  const endGame = async () => {
    setGameActive(false);
    setGameOver(true);
    
    if (score > highScore) {
      setHighScore(score);
      setIsNewHighScore(true);
      localStorage.setItem('highScore_wordchain', score.toString());
      await playSound('win');
    } else {
      await playSound('lose');
    }
  };

  const resetGame = () => {
    setGameActive(false);
    setGameOver(false);
    setScore(0);
    setTimeLeft(180);
    setUsedWords([]);
    setFeedback("");
    setStreak(0);
    setIsNewHighScore(false);
    setCurrentWord("WORD");
    setUserInput("");
    setShowComputerResponse(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text flex items-center gap-2">
            <Link className="h-6 w-6" />
            Word Chain Challenge
          </h1>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{score}</div>
              <p className="text-xs text-muted-foreground">Score</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{highScore}</div>
              <p className="text-xs text-muted-foreground">High Score</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
              <p className="text-xs text-muted-foreground">Time Left</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Brain className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{streak}</div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="bg-gradient-card mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              {!gameActive && !gameOver && "Ready for Word Chain?"}
              {gameActive && "Build the Word Chain!"}
              {gameOver && "Game Over!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!gameActive && !gameOver && (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Create word chains! Each word must start with the last letter of the previous word.
                  Get 15 credits per word + bonuses for longer words and streaks!
                </p>
                <Button onClick={startGame} className="bg-gradient-battle hover:opacity-90">
                  Start Word Chain (3 mins)
                </Button>
              </div>
            )}

            {gameActive && (
              <>
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current word:</p>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {currentWord}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your word must start with "{currentWord[currentWord.length - 1]}"
                    </p>
                  </div>
                  
                  {showComputerResponse && (
                    <div className="animate-fade-in">
                      <p className="text-sm text-muted-foreground mb-2">Computer plays:</p>
                      <Badge variant="outline" className="text-lg px-4 py-2 border-blue-500">
                        {computerResponse}
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && submitWord()}
                      placeholder="Enter your word..."
                      className="bg-input"
                    />
                    <Button onClick={submitWord} disabled={!userInput.trim()}>
                      Submit
                    </Button>
                  </div>

                  {feedback && (
                    <p className={`text-sm font-medium ${
                      feedback.includes("Correct") ? "text-green-500" : "text-red-500"
                    }`}>
                      {feedback}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time Progress</span>
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <Progress value={(timeLeft / 180) * 100} className="h-2" />
                </div>
              </>
            )}

            {gameOver && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Final Score: {score} credits</h3>
                  {isNewHighScore && (
                    <div className="animate-bounce-in">
                      <Badge className="bg-yellow-500 text-black">
                        🎉 New High Score! 🎉
                      </Badge>
                    </div>
                  )}
                  <p className="text-muted-foreground">
                    Words used: {usedWords.length}
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={startGame} className="bg-gradient-battle hover:opacity-90">
                    Play Again
                  </Button>
                  <Button variant="outline" onClick={resetGame}>
                    New Game
                  </Button>
                  <Button variant="outline" onClick={onBack}>
                    Back to Practice
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Used Words */}
        {usedWords.length > 0 && (
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-sm">Word Chain ({usedWords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {usedWords.map((word, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {word}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WordChainGameRoom;

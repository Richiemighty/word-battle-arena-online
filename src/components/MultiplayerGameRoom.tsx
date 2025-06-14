import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, Users, Crown, RotateCcw, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string;
  current_turn: string;
  player1_score: number;
  player2_score: number;
  category: string;
  status: string;
  words_used: string[];
  started_at: string;
  time_limit: number;
  turn_time_limit: number;
  max_credits: number;
  winner_id?: string;
  player1: {
    id: string;
    username: string;
    display_name: string;
  };
  player2: {
    id: string;
    username: string;
    display_name: string;
  };
}

interface MultiplayerGameRoomProps {
  gameId: string;
  currentUserId: string;
}

const MultiplayerGameRoom = ({ gameId, currentUserId }: MultiplayerGameRoomProps) => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameTimeLeft, setGameTimeLeft] = useState(120);
  const [countdown, setCountdown] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();




  const wordDatabase: Record<string, string[]> = {
    "Animals" : [
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
      "bowfin", "sturgeon", "lamprey", "hagfish", "lungfish", "coelacanth", "arowana", "bichir", "mudskipper", "electric eel"
    ],
    "Fruits" : [
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
      'bush tomato', 'australian finger lime', 'kakadu plum', 'native currant', 'sandpaper fig', 'bunya nut fruit', 'midyim berry', 'red bush apple', 'water apple', 'jungle plum'
    ],
    "Countries" : [
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
      'somalia', 'djibouti', 'eritrea', 'seychelles', 'comoros', 'madagascar', 'mauritius', 'palestine', 'vatican city'
    ],
  
    "Colors" : [
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
      'pastel yellow', 'pastel green', 'pastel blue', 'pastel pink', 'electric blue', 'fluorescent green', 'lava', 'amaranth', 'lapis lazuli', 'taupe gray'
    ],
    "Sports" : [
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
      'roller derby', 'roller skating', 'speedway', 'air racing', 'gliding', 'boomerang', 'softball', 'kite flying (competitive)', 'sandboarding', 'snowmobiling'
    ],
    
    "Food" : [
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
    ],
    // "Animals": ['lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'panda', 'koala', 'kangaroo', 'dolphin'],
    // "Countries": ['france', 'japan', 'brazil', 'canada', 'australia', 'germany', 'italy', 'spain', 'mexico', 'india'],
    // "Food": ['pizza', 'burger', 'sushi', 'pasta', 'salad', 'soup', 'sandwich', 'tacos', 'rice', 'bread'],
    // "Sports": ['football', 'basketball', 'tennis', 'swimming', 'baseball', 'volleyball', 'hockey', 'golf', 'boxing', 'wrestling'],
    "Movies": [
      'avatar', 'titanic', 'inception', 'matrix', 'gladiator', 'jaws', 'rocky', 'alien', 'batman', 'superman',
      'the godfather', 'the godfather part ii', 'the dark knight', 'pulp fiction', 'fight club', 'forrest gump', 'interstellar', 'the shawshank redemption', 'the prestige', 'django unchained',
      'avengers: endgame', 'avengers: infinity war', 'iron man', 'captain america: civil war', 'thor: ragnarok', 'black panther', 'spider-man: no way home', 'doctor strange', 'guardians of the galaxy', 'ant-man',
      'frozen', 'frozen ii', 'moana', 'encanto', 'zootopia', 'tangled', 'beauty and the beast', 'aladdin', 'the lion king', 'mulan',
      'toy story', 'toy story 2', 'toy story 3', 'toy story 4', 'inside out', 'soul', 'up', 'coco', 'ratatouille', 'finding nemo',
      'finding dory', 'cars', 'cars 2', 'cars 3', 'the incredibles', 'the incredibles 2', 'monsters inc', 'monsters university', 'brave', 'turning red',
      'shrek', 'shrek 2', 'shrek the third', 'shrek forever after', 'madagascar', 'madagascar 2', 'madagascar 3', 'kung fu panda', 'kung fu panda 2', 'kung fu panda 3',
      'how to train your dragon', 'how to train your dragon 2', 'how to train your dragon: the hidden world', 'despicable me', 'despicable me 2', 'despicable me 3', 'minions', 'the secret life of pets', 'sing', 'the croods',
      'the lego movie', 'the lego batman movie', 'the lego ninjago movie', 'hotel transylvania', 'hotel transylvania 2', 'hotel transylvania 3', 'hotel transylvania 4', 'cloudy with a chance of meatballs', 'cloudy with a chance of meatballs 2', 'rio',
      'rio 2', 'ice age', 'ice age 2', 'ice age 3', 'ice age 4', 'ice age 5', 'the peanuts movie', 'smurfs', 'smurfs 2', 'smurfs: the lost village',
      'alita: battle angel', 'ready player one', 'the hunger games', 'catching fire', 'mockingjay part 1', 'mockingjay part 2', 'maze runner', 'maze runner: scorched trials', 'maze runner: death cure', 'twilight',
      'new moon', 'eclipse', 'breaking dawn part 1', 'breaking dawn part 2', 'divergent', 'insurgent', 'allegiant', 'the fault in our stars', 'love rosie', 'me before you',
      'a walk to remember', 'the notebook', 'dear john', 'the vow', 'safe haven', 'five feet apart', 'to all the boys i’ve loved before', 'the kissing booth', 'the kissing booth 2', 'the kissing booth 3',
      'after', 'after we collided', 'after we fell', 'after ever happy', '365 days', 'through my window', 'purple hearts', 'chemical hearts', 'midnight sun', 'everything everything',
      'the great gatsby', 'la la land', 'a star is born', 'whiplash', 'the pianist', 'bohemian rhapsody', 'elvis', 'rocketman', 'tick tick boom', 'les miserables',
      'cats', 'mamma mia', 'mamma mia 2', 'dreamgirls', 'high school musical', 'high school musical 2', 'high school musical 3', 'camp rock', 'the greatest showman', 'grease',
      'the sound of music', 'mary poppins', 'chitty chitty bang bang', 'enchanted', 'cinderella', 'snow white', 'sleeping beauty', 'peter pan', 'pinocchio', 'bambi',
      'dumbo', 'lady and the tramp', '101 dalmatians', 'the jungle book', 'robin hood', 'the fox and the hound', 'the black cauldron', 'the little mermaid', 'beauty and the beast (1991)', 'aladdin (1992)',
      'pocahontas', 'the hunchback of notre dame', 'hercules', 'tarzan', 'atlantis: the lost empire', 'treasure planet', 'brother bear', 'home on the range', 'chicken little', 'meet the robinsons',
      'bolt', 'princess and the frog', 'wreck-it ralph', 'ralph breaks the internet', 'big hero 6', 'strange world', 'wish', 'elemental', 'lightyear', 'onward',
      'braveheart', 'lincoln', 'the king’s speech', 'darkest hour', 'the imitation game', 'hidden figures', '12 years a slave', 'schindler’s list', 'saving private ryan', 'hacksaw ridge',
      'dunkirk', '1917', 'american sniper', 'zero dark thirty', 'black hawk down', 'platoon', 'full metal jacket', 'apocalypse now', 'born on the fourth of july', 'jarhead',
      'troy', '300', 'immortals', 'clash of the titans', 'wrath of the titans', 'percy jackson and the olympians', 'wrath of the titans', 'eragon', 'narnia: the lion the witch and the wardrobe', 'narnia: prince caspian',
      'narnia: voyage of the dawn treader', 'the golden compass', 'his dark materials', 'fantastic beasts', 'fantastic beasts: the crimes of grindelwald', 'fantastic beasts: the secrets of dumbledore', 'harry potter and the sorcerer’s stone', 'chamber of secrets', 'prisoner of azkaban', 'goblet of fire',
      'order of the phoenix', 'half-blood prince', 'deathly hallows part 1', 'deathly hallows part 2', 'it', 'it chapter two', 'the conjuring', 'the conjuring 2', 'the nun', 'annabelle',
      'annabelle: creation', 'annabelle comes home', 'insidious', 'insidious: chapter 2', 'insidious: the last key', 'sinister', 'the babadook', 'hereditary', 'midsommar', 'the ring',
      'the grudge', 'paranormal activity', 'the blair witch project', 'saw', 'saw ii', 'saw iii', 'saw iv', 'saw v', 'saw vi', 'spiral',
      'get out', 'us', 'nope', 'candyman', 'smile', 'barbarian', 'x', 'pearl', 'a quiet place', 'a quiet place part ii',
      'old', 'the visit', 'glass', 'split', 'the sixth sense', 'signs', 'the village', 'lady in the water', 'the happening', 'knock at the cabin',
      'oppenheimer', 'barbie', 'tenet', 'dune', 'dune part two', 'blade runner 2049', 'arrival', 'gravity', 'the martian', 'ex machina',
      'moon', 'sunshine', 'contact', 'ad astra', 'passengers', 'lucy', 'limitless', 'the island', 'i robot', 'chappie',
      'district 9', 'e.t.', 'close encounters of the third kind', 'war of the worlds', 'independence day', 'men in black', 'men in black 2', 'men in black 3', 'edge of tomorrow', 'oblivion'
    ],
    "Technology": [
      'computer', 'smartphone', 'internet', 'software', 'hardware', 'network', 'database', 'programming', 'algorithm', 'artificial',
      'machine learning', 'deep learning', 'neural network', 'cloud computing', 'cybersecurity', 'data science', 'data mining', 'data visualization', 'big data', 'iot',
      'blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'smart contract', 'virtual reality', 'augmented reality', 'mixed reality', 'digital twin', 'edge computing',
      'quantum computing', '5g', '6g', 'wi-fi', 'ethernet', 'router', 'switch', 'firewall', 'vpn', 'encryption',
      'biometrics', 'facial recognition', 'fingerprint scanner', 'voice recognition', 'natural language processing', 'chatbot', 'robotics', 'automation', 'raspberry pi', 'arduino',
      'linux', 'windows', 'macos', 'android', 'ios', 'html', 'css', 'javascript', 'python', 'java',
      'c', 'c++', 'c#', 'php', 'ruby', 'go', 'swift', 'kotlin', 'r', 'sql',
      'nosql', 'mongodb', 'postgresql', 'mysql', 'firebase', 'oracle', 'docker', 'kubernetes', 'jenkins', 'github',
      'gitlab', 'bitbucket', 'ci/cd', 'api', 'rest', 'graphql', 'json', 'xml', 'yaml', 'http',
      'https', 'tcp/ip', 'udp', 'ip address', 'mac address', 'dns', 'dhcp', 'ssl', 'tls', 'ssh',
      'ftp', 'sftp', 'smtp', 'imap', 'pop3', 'email', 'browser', 'chrome', 'firefox', 'edge',
      'safari', 'tor', 'brave', 'search engine', 'google', 'bing', 'duckduckgo', 'web app', 'mobile app', 'desktop app',
      'frontend', 'backend', 'full stack', 'react', 'angular', 'vue', 'next.js', 'nuxt.js', 'svelte', 'jquery',
      'bootstrap', 'tailwind css', 'material ui', 'redux', 'react native', 'flutter', 'ionic', 'capacitor', 'cordova', 'xamarin',
      'visual studio', 'vscode', 'android studio', 'intellij idea', 'pycharm', 'jupyter notebook', 'anaconda', 'spyder', 'terminal', 'command line',
      'bash', 'powershell', 'zsh', 'shell scripting', 'cron job', 'virtual machine', 'vmware', 'virtualbox', 'hyper-v', 'cloudflare',
      'aws', 'azure', 'google cloud', 'heroku', 'netlify', 'vercel', 'digital ocean', 'linode', 'cloud functions', 'lambda',
      'firebase functions', 'firestore', 'realtime database', 'cloud storage', 'cdn', 'load balancer', 'reverse proxy', 'nginx', 'apache', 'lighttpd',
      'sql injection', 'xss', 'csrf', 'brute force', 'ddos', 'malware', 'ransomware', 'trojan', 'spyware', 'phishing',
      'firewall rules', 'intrusion detection', 'antivirus', 'endpoint protection', 'zero trust', 'threat intelligence', 'siem', 'soc', 'red team', 'blue team',
      'penetration testing', 'ethical hacking', 'bug bounty', 'cyber forensics', 'hashing', 'sha256', 'md5', 'bcrypt', 'jwt', 'oauth',
      'sso', 'saml', 'multi-factor authentication', 'otp', 'captcha', 'honeypot', 'sandbox', 'devops', 'devsecops', 'sre',
      'agile', 'scrum', 'kanban', 'jira', 'confluence', 'trello', 'notion', 'monday.com', 'slack', 'zoom',
      'teams', 'webex', 'figma', 'adobe xd', 'photoshop', 'illustrator', 'after effects', 'premiere pro', 'canva', 'corel draw',
      '3d printing', 'cad', 'solidworks', 'autocad', 'blender', 'unity', 'unreal engine', 'godot', 'game dev', 'metaverse',
      'token', 'nft', 'wallet', 'ledger', 'metamask', 'smart home', 'home assistant', 'alexa', 'google assistant', 'siri',
      'wearable', 'smartwatch', 'fitness tracker', 'drone', 'autonomous vehicle', 'self-driving car', 'tesla', 'gps', 'lidar', 'radar',
      'sensor', 'actuator', 'api gateway', 'microservices', 'monolith', 'serverless', 'graphql playground', 'postman', 'swagger', 'openapi',
      'uml', 'data model', 'er diagram', 'flowchart', 'sequence diagram', 'wireframe', 'mockup', 'prototype', 'product design', 'ui design',
      'ux design', 'usability testing', 'a/b testing', 'analytics', 'google analytics', 'mixpanel', 'segment', 'data lake', 'data warehouse', 'etl',
      'elt', 'airflow', 'dbt', 'tableau', 'power bi', 'looker', 'superset', 'redshift', 'snowflake', 'bigquery',
      'spark', 'hadoop', 'hive', 'pig', 'hbase', 'kafka', 'pulsar', 'flink', 'storm', 'beam',
      'tensorflow', 'keras', 'pytorch', 'scikit-learn', 'xgboost', 'lightgbm', 'catboost', 'mlflow', 'dvc', 'model serving',
      'mlops', 'cv', 'computer vision', 'image recognition', 'object detection', 'ocr', 'nlp', 'bert', 'gpt', 'transformer',
      'tokenization', 'stemming', 'lemmatization', 'sentiment analysis', 'text classification', 'language modeling', 'text-to-speech', 'speech-to-text', 'voice bot', 'chatgpt',
      'openai', 'anthropic', 'cohere', 'huggingface', 'deepmind', 'stability ai', 'generative ai', 'ai ethics', 'bias in ai', 'explainable ai',
      'recommender system', 'collaborative filtering', 'content-based filtering', 'ranking algorithm', 'search engine optimization', 'seo', 'sem', 'adsense', 'admob', 'facebook pixel',
      'ecommerce', 'shopify', 'woocommerce', 'magento', 'bigcommerce', 'dropshipping', 'payment gateway', 'stripe', 'paypal', 'flutterwave',
      'paystack', 'coinbase commerce', 'smart grid', 'digital currency', 'central bank digital currency', 'edtech', 'healthtech', 'agritech', 'fintech', 'proptech',
      'legaltech', 'govtech', 'insurtech', 'martech', 'medtech', 'greentech', 'clean energy', 'solar panel', 'wind turbine', 'battery storage'
    ],
    "Nature": [
      'mountain', 'ocean', 'forest', 'desert', 'river', 'lake', 'volcano', 'beach', 'canyon', 'valley',
      'hill', 'plateau', 'plain', 'glacier', 'waterfall', 'island', 'archipelago', 'peninsula', 'bay', 'lagoon',
      'delta', 'stream', 'creek', 'swamp', 'marsh', 'wetland', 'coral reef', 'atoll', 'gulf', 'cape',
      'cliff', 'ridge', 'peak', 'range', 'basin', 'tundra', 'savanna', 'prairie', 'rainforest', 'jungle',
      'steppe', 'badlands', 'butte', 'mesa', 'dune', 'geyser', 'hot spring', 'sinkhole', 'karst', 'cave',
      'stalactite', 'stalagmite', 'lava field', 'crater', 'moraine', 'floodplain', 'mudflat', 'shoal', 'sandbar', 'terrace',
      'fjord', 'iceberg', 'permafrost', 'tide pool', 'rapids', 'glacial lake', 'salt flat', 'salt lake', 'thermal vent', 'estuary',
      'boreal forest', 'coniferous forest', 'deciduous forest', 'temperate forest', 'alpine meadow', 'rainshadow', 'chaparral', 'heathland', 'bog', 'fen',
      'fenland', 'grove', 'woodland', 'thicket', 'copse', 'hedgerow', 'pasture', 'meadow', 'grassland', 'scrubland',
      'monsoon', 'cyclone', 'hurricane', 'typhoon', 'storm', 'blizzard', 'thunderstorm', 'hailstorm', 'sandstorm', 'dust storm',
      'whirlwind', 'tornado', 'avalanche', 'landslide', 'rockslide', 'tsunami', 'earthquake', 'aftershock', 'tremor', 'wildfire',
      'lightning', 'thunder', 'fog', 'mist', 'dew', 'frost', 'snow', 'rain', 'drizzle', 'sleet',
      'hail', 'cloud', 'cirrus cloud', 'cumulus cloud', 'stratus cloud', 'nimbus cloud', 'sunshine', 'sunset', 'sunrise', 'moonrise',
      'moonset', 'eclipse', 'solar eclipse', 'lunar eclipse', 'rainbow', 'aurora', 'northern lights', 'southern lights', 'mirage', 'halo',
      'glow', 'ember', 'fire', 'smoke', 'ash', 'pumice', 'obsidian', 'granite', 'limestone', 'sandstone',
      'shale', 'slate', 'basalt', 'coal', 'peat', 'soil', 'topsoil', 'silt', 'clay', 'loam',
      'earth', 'humus', 'rock', 'mineral', 'crystal', 'quartz', 'diamond', 'gold', 'silver', 'copper',
      'iron', 'zinc', 'nickel', 'platinum', 'mercury', 'uranium', 'sulfur', 'graphite', 'mica', 'jade',
      'emerald', 'ruby', 'sapphire', 'amethyst', 'opal', 'garnet', 'peridot', 'aquamarine', 'tourmaline', 'topaz',
      'flora', 'fauna', 'tree', 'shrub', 'bush', 'vine', 'fern', 'moss', 'grass', 'algae',
      'lily', 'rose', 'sunflower', 'daisy', 'tulip', 'orchid', 'lotus', 'hibiscus', 'jasmine', 'lavender',
      'oak', 'maple', 'pine', 'cedar', 'willow', 'bamboo', 'sequoia', 'birch', 'elm', 'spruce',
      'cactus', 'succulent', 'baobab', 'acacia', 'eucalyptus', 'olive tree', 'banana tree', 'coconut tree', 'mango tree', 'apple tree',
      'pollination', 'seed', 'fruit', 'nut', 'root', 'stem', 'leaf', 'bark', 'sap', 'resin',
      'fungus', 'mushroom', 'lichen', 'coral', 'plankton', 'krill', 'insect', 'bee', 'butterfly', 'dragonfly',
      'ant', 'termite', 'grasshopper', 'cricket', 'beetle', 'mosquito', 'fly', 'wasp', 'hornet', 'moth',
      'bird', 'eagle', 'hawk', 'falcon', 'owl', 'sparrow', 'pigeon', 'parrot', 'toucan', 'woodpecker',
      'penguin', 'albatross', 'swan', 'goose', 'duck', 'heron', 'crane', 'flamingo', 'stork', 'vulture',
      'bat', 'mammal', 'reptile', 'amphibian', 'fish', 'shark', 'whale', 'dolphin', 'porpoise', 'seal',
      'sea lion', 'walrus', 'otter', 'beaver', 'platypus', 'frog', 'toad', 'salamander', 'newt', 'turtle',
      'tortoise', 'lizard', 'gecko', 'chameleon', 'snake', 'python', 'cobra', 'viper', 'anole', 'iguana',
      'lion', 'tiger', 'leopard', 'cheetah', 'jaguar', 'lynx', 'bobcat', 'wolf', 'fox', 'bear',
      'grizzly', 'polar bear', 'panda', 'koala', 'kangaroo', 'wombat', 'camel', 'horse', 'zebra', 'giraffe',
      'elephant', 'rhino', 'hippopotamus', 'buffalo', 'bison', 'deer', 'moose', 'antelope', 'gazelle', 'boar',
      'rabbit', 'hare', 'squirrel', 'chipmunk', 'mouse', 'rat', 'porcupine', 'hedgehog', 'armadillo', 'raccoon',
      'skunk', 'badger', 'mongoose', 'meerkat', 'chimpanzee', 'gorilla', 'orangutan', 'baboon', 'lemur', 'sloth',
      'echidna', 'pangolin', 'tapir', 'okapi', 'manatee', 'dugong', 'sea cucumber', 'sea urchin', 'jellyfish', 'octopus',
      'squid', 'crab', 'lobster', 'shrimp', 'clam', 'mussel', 'scallop', 'oyster', 'starfish', 'sand dollar',
      'pebble', 'boulder', 'driftwood', 'tide', 'current', 'wave', 'ripple', 'foam', 'splash', 'spray',
      'fog bank', 'cloudburst', 'downpour', 'shower', 'rainstorm', 'snowstorm', 'ice storm', 'wind gust', 'breeze', 'gale',
      'calm', 'stillness', 'sunbeam', 'moonbeam', 'twilight', 'dusk', 'dawn', 'nightfall', 'starlight', 'moonlight',
      'equinox', 'solstice', 'gravity', 'magnetism', 'photosynthesis', 'erosion', 'weathering', 'deposition', 'evaporation', 'condensation',
      'precipitation', 'cycle', 'ecosystem', 'habitat', 'biodiversity', 'carbon cycle', 'nitrogen cycle', 'ozone', 'biosphere', 'stratosphere'
    ],
    "History": ['egypt', 'rome', 'greece', 'medieval', 'renaissance', 'revolution', 'empire', 'kingdom', 'dynasty', 'civilization'],
    // "Colors": ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'],
    // "Fruits": ['apple', 'banana', 'orange', 'grape', 'strawberry', 'mango', 'pineapple', 'watermelon', 'peach', 'cherry']
  };






  useEffect(() => {
    fetchGameSession();
    
    // Listen for real-time updates
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Game session updated:', payload);
          fetchGameSession();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_moves',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('New move:', payload);
          fetchGameSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  useEffect(() => {
    if (gameSession?.status === 'active' && !gameStarted) {
      setGameStarted(true);
      // Start countdown for receiver advantage
      if (gameSession.player2_id === currentUserId) {
        startCountdown();
      } else {
        setGameActive(true);
        setTimeLeft(gameSession.turn_time_limit);
        setGameTimeLeft(gameSession.time_limit);
      }
    }
  }, [gameSession, currentUserId, gameStarted]);

  // Game timer
  useEffect(() => {
    if (gameActive && gameTimeLeft > 0) {
      const timer = setTimeout(() => setGameTimeLeft(gameTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && gameTimeLeft === 0) {
      endGame('time');
    }
  }, [gameTimeLeft, gameActive]);

  // Turn timer
  useEffect(() => {
    if (gameActive && timeLeft > 0 && gameSession?.current_turn === currentUserId) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0 && gameSession?.current_turn === currentUserId) {
      // Player ran out of time
      switchTurn();
    }
  }, [timeLeft, gameActive, gameSession?.current_turn, currentUserId]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && gameStarted && !gameActive) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && gameStarted && !gameActive) {
      setGameActive(true);
      setTimeLeft(gameSession?.turn_time_limit || 30);
      setGameTimeLeft(gameSession?.time_limit || 120);
      inputRef.current?.focus();
    }
  }, [countdown, gameStarted, gameActive, gameSession]);

  const startCountdown = () => {
    setCountdown(5);
  };

  const fetchGameSession = async () => {
    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .select(`
          *,
          player1:profiles!game_sessions_player1_id_fkey(id, username, display_name),
          player2:profiles!game_sessions_player2_id_fkey(id, username, display_name)
        `)
        .eq("id", gameId)
        .single();

      if (error) throw error;
      
      // Handle words_used properly - it might be a JSON array or string array
      const processedData = {
        ...data,
        words_used: Array.isArray(data.words_used) 
          ? data.words_used 
          : data.words_used 
            ? JSON.parse(data.words_used as string) 
            : []
      };
      
      setGameSession(processedData);
      
      // Check if game has ended
      if (data.status === 'completed') {
        setGameEnded(true);
        setGameActive(false);
      }
    } catch (error) {
      console.error("Error fetching game session:", error);
      toast({
        title: "Error",
        description: "Failed to load game session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitWord = async () => {
    if (!currentWord.trim() || !gameSession) return;

    const word = currentWord.toLowerCase().trim();
    const validWords = wordDatabase[gameSession.category] || [];
    
    // Check if word is valid
    if (!validWords.includes(word)) {
      toast({
        title: "Invalid Word!",
        description: `"${currentWord}" is not a valid ${gameSession.category.toLowerCase()}`,
        variant: "destructive",
      });
      setCurrentWord("");
      return;
    }

    // Check if word was already used
    if (gameSession.words_used.includes(word)) {
      toast({
        title: "Word Already Used!",
        description: `"${currentWord}" has already been used`,
        variant: "destructive",
      });
      setCurrentWord("");
      return;
    }

    // Calculate score based on time
    const timeBonus = Math.max(1, Math.floor(timeLeft / 5));
    const wordScore = 10 + timeBonus;

    try {
      // Record the move
      await supabase.from("game_moves").insert({
        game_id: gameId,
        player_id: currentUserId,
        word: word,
        points_earned: wordScore,
        time_taken: gameSession.turn_time_limit - timeLeft,
        is_valid: true
      });

      // Update game session
      const isPlayer1 = gameSession.player1_id === currentUserId;
      const newScore = isPlayer1 ? gameSession.player1_score + wordScore : gameSession.player2_score + wordScore;
      const newWordsUsed = [...gameSession.words_used, word];
      
      await supabase
        .from("game_sessions")
        .update({
          [isPlayer1 ? 'player1_score' : 'player2_score']: newScore,
          words_used: newWordsUsed,
          current_turn: isPlayer1 ? gameSession.player2_id : gameSession.player1_id,
          updated_at: new Date().toISOString()
        })
        .eq("id", gameId);

      toast({
        title: "Great Word!",
        description: `+${wordScore} points! Time bonus: +${timeBonus}`,
      });

      setCurrentWord("");
      setTimeLeft(gameSession.turn_time_limit);

      // Check win condition
      if (newScore >= gameSession.max_credits) {
        endGame('score');
      }
    } catch (error) {
      console.error("Error submitting word:", error);
      toast({
        title: "Error",
        description: "Failed to submit word",
        variant: "destructive",
      });
    }
  };

  const switchTurn = async () => {
    if (!gameSession) return;

    const nextPlayer = gameSession.current_turn === gameSession.player1_id 
      ? gameSession.player2_id 
      : gameSession.player1_id;

    await supabase
      .from("game_sessions")
      .update({
        current_turn: nextPlayer,
        updated_at: new Date().toISOString()
      })
      .eq("id", gameId);

    setTimeLeft(gameSession.turn_time_limit);
  };

  const endGame = async (reason: 'time' | 'score') => {
    if (!gameSession) return;

    setGameActive(false);
    
    const player1Score = gameSession.player1_score;
    const player2Score = gameSession.player2_score;
    
    let winnerId = null;
    let isDraw = false;

    if (player1Score > player2Score) {
      winnerId = gameSession.player1_id;
    } else if (player2Score > player1Score) {
      winnerId = gameSession.player2_id;
    } else {
      isDraw = true;
    }

    try {
      // Update game session
      await supabase
        .from("game_sessions")
        .update({
          status: 'completed',
          winner_id: winnerId,
          ended_at: new Date().toISOString()
        })
        .eq("id", gameId);

      // Update player stats
      await supabase.rpc("update_user_stats_after_game", {
        user_id: gameSession.player1_id,
        credits_earned: player1Score,
        is_winner: winnerId === gameSession.player1_id,
        is_draw: isDraw
      });

      await supabase.rpc("update_user_stats_after_game", {
        user_id: gameSession.player2_id,
        credits_earned: player2Score,
        is_winner: winnerId === gameSession.player2_id,
        is_draw: isDraw
      });

      const resultMessage = isDraw 
        ? "Game ended in a draw!"
        : winnerId === currentUserId 
          ? "Congratulations! You won!"
          : "Game over! Better luck next time!";

      toast({
        title: "Game Over!",
        description: resultMessage,
      });
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };

  const playAgain = () => {
    navigate("/dashboard");
  };

  const chooseNewCategory = () => {
    navigate("/dashboard");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitWord();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-2xl">Loading game...</div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Game not found</h1>
          <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isMyTurn = gameSession.current_turn === currentUserId;
  const opponent = gameSession.player1_id === currentUserId ? gameSession.player2 : gameSession.player1;
  const myScore = gameSession.player1_id === currentUserId ? gameSession.player1_score : gameSession.player2_score;
  const opponentScore = gameSession.player1_id === currentUserId ? gameSession.player2_score : gameSession.player1_score;

  // Waiting room
  if (gameSession.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-6">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text">
              Waiting for Player
            </CardTitle>
            <p className="text-muted-foreground">Game will start when both players join</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl animate-pulse">⏳</div>
            <div className="space-y-2">
              <p><strong>Category:</strong> {gameSession.category}</p>
              <p><strong>Opponent:</strong> {opponent.display_name || opponent.username}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Countdown phase
  if (gameStarted && !gameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-6">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text">
              {gameSession.category} Battle
            </CardTitle>
            <p className="text-muted-foreground">Get ready!</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-8xl font-bold text-primary mb-4 animate-countdown">
              {countdown}
            </div>
            <p className="text-lg text-muted-foreground">
              Game starts in...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game ended - show options
  if (gameEnded || gameSession?.status === 'completed') {
    const isWinner = gameSession?.winner_id === currentUserId;
    const isDraw = !gameSession?.winner_id;
    const opponent = gameSession?.player1_id === currentUserId ? gameSession?.player2 : gameSession?.player1;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold gradient-text mb-4">
              {isDraw ? "It's a Draw!" : isWinner ? "You Won! 🏆" : "Game Over"}
            </CardTitle>
            <div className="space-y-2">
              <p className="text-lg">Final Scores:</p>
              <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg">
                <span>You: {gameSession.player1_id === currentUserId ? gameSession.player1_score : gameSession.player2_score}</span>
                <span>{opponent?.display_name || opponent?.username}: {gameSession.player1_id === currentUserId ? gameSession.player2_score : gameSession.player1_score}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={playAgain}
                className="flex-1 bg-gradient-battle hover:opacity-90"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              <Button 
                variant="outline" 
                onClick={chooseNewCategory}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold gradient-text text-center">
            {gameSession?.category} Battle
          </h1>
          <div className="w-16 sm:w-24" />
        </div>

        {/* Game Stats - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-gradient-card border-accent/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Clock className="h-4 sm:h-6 w-4 sm:w-6 text-accent mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">
                {Math.floor(gameTimeLeft / 60)}:{(gameTimeLeft % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Game Time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-primary/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Clock className="h-4 sm:h-6 w-4 sm:w-6 text-primary mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">{timeLeft}s</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Turn Time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-green-500/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Trophy className="h-4 sm:h-6 w-4 sm:w-6 text-green-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">
                {gameSession?.player1_id === currentUserId ? gameSession?.player1_score : gameSession?.player2_score}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Your Score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-red-500/40">
            <CardContent className="p-2 sm:p-4 text-center">
              <Users className="h-4 sm:h-6 w-4 sm:w-6 text-red-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-sm sm:text-xl font-bold text-foreground">
                {gameSession?.player1_id === currentUserId ? gameSession?.player2_score : gameSession?.player1_score}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Opponent</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Turn - Mobile Responsive */}
        <Card className="bg-gradient-card border-primary/40 mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-center flex items-center justify-center gap-2 text-sm sm:text-base">
              {gameSession?.current_turn === currentUserId ? (
                <>
                  <Crown className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-base">Your Turn - Name a {gameSession?.category.toLowerCase().slice(0, -1)}!</span>
                </>
              ) : (
                <>
                  <Users className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
                  <span className="text-xs sm:text-base">Waiting for opponent...</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Input
                ref={inputRef}
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && gameSession?.current_turn === currentUserId && submitWord()}
                placeholder={`Enter a ${gameSession?.category.toLowerCase().slice(0, -1)}...`}
                className="text-sm sm:text-lg py-3 sm:py-6 bg-input border-border focus:border-primary"
                disabled={!gameActive || gameSession?.current_turn !== currentUserId}
              />
              <Button 
                onClick={submitWord}
                disabled={!gameActive || gameSession?.current_turn !== currentUserId || !currentWord.trim()}
                className="px-4 sm:px-8 py-3 sm:py-6 bg-gradient-battle hover:opacity-90 text-sm sm:text-base whitespace-nowrap"
              >
                Submit
              </Button>
            </div>
            <div className="text-center">
              <Badge variant={gameSession?.current_turn === currentUserId ? "default" : "secondary"} className="text-xs sm:text-sm">
                {gameSession?.current_turn === currentUserId ? "YOUR TURN" : "OPPONENT'S TURN"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Used Words - Mobile Responsive */}
        {gameSession?.words_used.length > 0 && (
          <Card className="bg-gradient-card border-secondary/40">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Words Used ({gameSession.words_used.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {gameSession.words_used.map((word, index) => (
                  <span 
                    key={index}
                    className="px-2 sm:px-3 py-1 bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-medium"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGameRoom;

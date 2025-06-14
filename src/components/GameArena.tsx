
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Trophy, Target } from "lucide-react";
import { Category } from "./CategorySelection";
import { toast } from "@/hooks/use-toast";

interface GameArenaProps {
  category: Category;
  onBack: () => void;
}

const GameArena = ({ category, onBack }: GameArenaProps) => {
  const [currentWord, setCurrentWord] = useState("");
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample word databases for each category
  const wordDatabase: Record<string, string[]> = {
    animals : [
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
    fruits : [
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
    countries : [
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
  
    colors : [
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
    sports : [
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
    
    food : [
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
    ]
  };

  const validWords = wordDatabase[category.id] || [];

  // Start countdown
  useEffect(() => {
    if (!gameStarted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!gameStarted && countdown === 0) {
      setGameStarted(true);
      setGameActive(true);
      inputRef.current?.focus();
    }
  }, [countdown, gameStarted]);

  // Game timer
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const submitWord = () => {
    if (!currentWord.trim()) return;

    const word = currentWord.toLowerCase().trim();
    
    // Check if word is valid for this category
    if (!validWords.includes(word)) {
      toast({
        title: "Invalid Word!",
        description: `"${currentWord}" is not a valid ${category.name.toLowerCase().slice(0, -1)}. Try again!`,
        variant: "destructive"
      });
      setCurrentWord("");
      return;
    }

    // Check if word was already used
    if (usedWords.includes(word)) {
      toast({
        title: "Word Already Used!",
        description: `"${currentWord}" has already been used. Think of a new one!`,
        variant: "destructive"
      });
      setCurrentWord("");
      return;
    }

    // Calculate score based on time remaining
    const timeBonus = Math.max(1, Math.floor(timeLeft / 5));
    const wordScore = 10 + timeBonus;
    
    setUsedWords([...usedWords, word]);
    setScore(score + wordScore);
    setCurrentWord("");
    setTimeLeft(30); // Reset timer for next word
    
    toast({
      title: "Great Word!",
      description: `+${wordScore} points! Time bonus: +${timeBonus}`,
    });

    inputRef.current?.focus();
  };

  const endGame = () => {
    setGameActive(false);
    toast({
      title: "Game Over!",
      description: `Final Score: ${score} points with ${usedWords.length} words!`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitWord();
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-6">
        <Card className="bg-gradient-card border-primary/40 max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">{category.icon}</div>
            <CardTitle className="text-3xl font-bold gradient-text">
              {category.name} Battle
            </CardTitle>
            <p className="text-muted-foreground">Get ready to battle!</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            {category.name} Battle Arena
          </h1>
          <div className="w-24" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-card border-accent/40">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{timeLeft}s</div>
              <p className="text-sm text-muted-foreground">Time Left</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-primary/40">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{score}</div>
              <p className="text-sm text-muted-foreground">Score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-green-500/40">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{usedWords.length}</div>
              <p className="text-sm text-muted-foreground">Words Found</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Input */}
        <Card className="bg-gradient-card border-primary/40 mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Name a {category.name.toLowerCase().slice(0, -1)}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                ref={inputRef}
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Enter a ${category.name.toLowerCase().slice(0, -1)}...`}
                className="text-lg py-6 bg-input border-border focus:border-primary"
                disabled={!gameActive}
              />
              <Button 
                onClick={submitWord}
                disabled={!gameActive || !currentWord.trim()}
                className="px-8 py-6 bg-gradient-battle hover:opacity-90"
              >
                Submit
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Type fast for bonus points! {30 - timeLeft < 5 ? "⚡ Speed bonus active!" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Used Words */}
        {usedWords.length > 0 && (
          <Card className="bg-gradient-card border-secondary/40">
            <CardHeader>
              <CardTitle>Words Used ({usedWords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {usedWords.map((word, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
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

export default GameArena;

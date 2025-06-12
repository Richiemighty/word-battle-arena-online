
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  examples: string[];
}

interface CategorySelectionProps {
  onSelectCategory: (category: Category) => void;
  onBack: () => void;
}

const categories: Category[] = [
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦁',
    description: 'Wild and domestic creatures',
    color: 'border-green-500/40 hover:border-green-500/60',
    examples: ['Lion', 'Tiger', 'Elephant', 'Dolphin']
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    description: 'Fresh and delicious fruits',
    color: 'border-red-500/40 hover:border-red-500/60',
    examples: ['Apple', 'Banana', 'Orange', 'Mango']
  },
  {
    id: 'countries',
    name: 'Countries',
    icon: '🌍',
    description: 'Nations around the world',
    color: 'border-blue-500/40 hover:border-blue-500/60',
    examples: ['France', 'Japan', 'Brazil', 'Canada']
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: '🎨',
    description: 'Vibrant colors and shades',
    color: 'border-purple-500/40 hover:border-purple-500/60',
    examples: ['Red', 'Blue', 'Green', 'Yellow']
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    description: 'Games and athletic activities',
    color: 'border-orange-500/40 hover:border-orange-500/60',
    examples: ['Football', 'Basketball', 'Tennis', 'Swimming']
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍕',
    description: 'Delicious dishes and cuisine',
    color: 'border-yellow-500/40 hover:border-yellow-500/60',
    examples: ['Pizza', 'Burger', 'Sushi', 'Pasta']
  }
];

const CategorySelection = ({ onSelectCategory, onBack }: CategorySelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-6">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Choose Your Battle Zone
          </h1>
          <div className="w-24" /> {/* Spacer for center alignment */}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className={`bg-gradient-card ${category.color} cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              onClick={() => onSelectCategory(category)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4">{category.icon}</div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {category.name}
                </CardTitle>
                <p className="text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((example, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-secondary rounded-md text-xs text-secondary-foreground"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Select a category to start your word battle training!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;
export type { Category };

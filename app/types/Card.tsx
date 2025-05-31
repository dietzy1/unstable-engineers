export type CardType = 'mana' | 'action' | 'spell';
export type ManaColor = 'red' | 'blue' | 'green' | 'black';

// Mana cards are the cards that are used to pay for spells
// Action cards are useable on your own turn and are used to deal damage or buff yourself
// Spell cards can be used whenever you want

// Red cards are meant for dealing dmg and being annoying in the game
// Blue cards are meant for using spells, drawing cards and comboing
// Green cards are meant for buffing yourself
// Black cards are meant for using spells and debuffs with high cost

/* export interface ManaCard {
  id: string;
  image: string;
  manaColor: ManaColor;
  type: 'mana';
} */

export interface MagicCard {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
  type: CardType;
  manaColor: ManaColor;
  onPress: () => void;
  onLongPress?: () => void;
}

import {
  CloudMoon,
  Contrast,
  Crown,
  FileText,
  Flame,
  Landmark,
  LucideIcon,
  Sparkles,
  Tornado,
} from 'lucide-react';

export interface TopicContextItem {
  title: string;
  description: string;
  color?: string;
}

export interface AnalysisTopic {
  id: string;
  title: string;
  subtitle: string;
  mainContent: string;
  contexts: TopicContextItem[];
  quote: string;
}

export const ANALYSIS_TOPICS: Record<string, AnalysisTopic> = {
  'benefic-planets': {
    id: 'benefic-planets',
    title: 'Benefic Planets',
    subtitle: 'DETAILED VEDIC INSIGHTS & COSMIC ALIGNMENT',
    mainContent: `
# The Luminous Grace: Unveiling Benefic Planets for the Rohini Soul

**Hari Om.**

Welcome, seeker of celestial wisdom. To understand the *Benefic Planets* (Saumya Grahas) is to understand the very nectar of existence that sustains life, inspires art, and grants wisdom. For a native born under the exquisite starlight of **Rohini**, this understanding is not merely academic—it is a reflection of your own inner architecture.

Let us journey through the astral plane to understand how these benevolent forces shape your destiny.

---

## I. The Mystical Nature of Benefic Planets (Saumya Grahas)

In the grand cosmic loom of Vedic Astrology (Jyotish), planets are not categorized as "good" or "bad" in a moral sense, but rather by their method of delivery.

**Benefic Planets** operate through the principle of "Vriddhi" (growth) and "Sukha" (ease). They are the cosmic mothers, the teachers, and the lovers. Unlike Malefics, which teach through friction, separation, and heat, Benefics teach through accumulation, magnetism, and light.

There are two primary types of Benefics you must understand:
1. **Natural Benefics (Naisargika Shubha):** Jupiter (Guru), Venus (Shukra), the Waxing Moon (Chandra), and Mercury (Budha, when unassociated with malefics). These planets naturally exude the energy of preservation (Vishnu Tattva).
2. **Functional Benefics (Tatkalika Shubha):** These are planets that become auspicious specifically based on your Rising Sign (Lagna).

For the purpose of our spiritual inquiry, we focus on the **Natural Benefics**. They represent the "Sattvic" and "Rajasic" forces that bring:
* **Jupiter:** Wisdom, expansion, divine grace, and spiritual grounding.
* **Venus:** Love, beauty, sensual pleasure, and artistic refinement.
* **Moon:** Emotional nourishment, peace of mind, and intuition.
* **Mercury:** Intelligence, communication, and adaptability.

They are the soft rays of dawn that wake you gently, opposed to the harsh alarm of the Malefics.
    `,
    contexts: [
      {
        title: 'Perspective',
        description:
          "This analysis uses Parashara's classical methods blended with modern intuitive wisdom.",
        color: 'blue',
      },
      {
        title: 'Birth Influence',
        description: 'Calculated specifically for the Rohini nakshatra energy.',
        color: 'purple',
      },
      {
        title: 'Current Transit',
        description:
          'Includes influences from the Moon in Shravana and current Saturn movements.',
        color: 'orange',
      },
    ],
    quote:
      'Knowledge of the stars is the lantern of the soul. May this wisdom illuminate your path to dharma.',
  },
  'malefic-planets': {
    id: 'malefic-planets',
    title: 'Malefic Planets',
    subtitle: 'UNDERSTANDING THE AGNI & TRANSFORMATION',
    mainContent: `
# The Harsh Teachers: Navigating Malefic Forces

**Hari Om.**

To understand the *Malefic Planets* (Papa Grahas) is to understand the fires of transformation that refine the soul. While Benefics provide comfort, Malefics provide the friction necessary for growth.

---

## I. The Necessity of Malefics

In Vedic thought, Malefics are the architects of karma. They bring delays, separations, and challenges, not to punish, but to awaken.

**Key Malefic Forces:**
* **Saturn (Shani):** The taskmaster, representing discipline, delay, and ultimate truth.
* **Mars (Mangala):** The warrior, representing energy, drive, and conflict.
* **Rahu & Ketu:** The nodes of the Moon, representing obsession and liberation.
    `,
    contexts: [
      {
        title: 'Perspective',
        description:
          'Analysis focusing on karmic retribution and soul refinement.',
        color: 'red',
      },
      {
        title: 'Karmic Depth',
        description:
          'Evaluating past-life influences on current structural challenges.',
        color: 'slate',
      },
    ],
    quote:
      'Through the fire of discipline, the iron of the ego is forged into the steel of the spirit.',
  },
  analysis: {
    id: 'analysis',
    title: 'Chart Analysis',
    subtitle: 'COMPREHENSIVE SPIRITUAL BLUEPRINT',
    mainContent: `
# Deciphering Your Celestial Signature

This analysis provides a holistic view of your birth chart, looking at the interaction between the ascendant (Lagna) and the major planetary placements.

---

## I. The Architecture of Your Destiny

Every chart is a unique map of karmic patterns. By analyzing the houses and their lords, we uncover the primary themes of your current incarnation.
    `,
    contexts: [
      {
        title: 'Perspective',
        description: 'Synthesis of Jaimini and Parashara systems.',
        color: 'purple',
      },
    ],
    quote:
      'The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.',
  },
  'lagna-lord': {
    id: 'lagna-lord',
    title: 'Your Lagna Lord',
    subtitle: 'THE CAPTAIN OF YOUR SHIP',
    mainContent: `
# Understanding the Lagna Lord (Ascendant Lord)

The Lagna Lord is the most important planet in your chart, representing your physical self, your overall direction in life, and your general vitality.

---

## I. Position and Strength

The house and sign occupied by your Lagna Lord indicate where your life's purpose is most focused and how you express your core identity.
    `,
    contexts: [
      {
        title: 'Core Identity',
        description:
          'Analyzing the primary focus of your physical and mental energy.',
        color: 'orange',
      },
    ],
    quote: 'Know thyself, and thou shalt know the universe and God.',
  },
};

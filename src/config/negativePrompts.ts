import list from '../static/negative_prompts.json';

interface NegativePromptsType {
  negative_prompts: string[];
}

export const NegativePrompts: NegativePromptsType = list;

import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

export const placeholderImages: ImagePlaceholder[] = PlaceHolderImages;

export const learningTopics = [
  {
    id: 'pharmacovigilance',
    title: 'Pharmacovigilance',
    description: 'Learn about the science and activities relating to the detection, assessment, understanding, and prevention of adverse effects or any other drug-related problem.',
    image: placeholderImages.find((img) => img.id === 'learn-1'),
  },
  {
    id: 'gmp-gcp-ich-guidelines',
    title: 'GMP/GCP/ICH Guidelines',
    description: 'Understand the essential guidelines for Good Manufacturing, Clinical, and Harmonization practices in the pharmaceutical industry.',
    image: placeholderImages.find((img) => img.id === 'learn-2'),
  },
  {
    id: 'clinical-trials',
    title: 'Clinical Trials',
    description: 'Explore the phases, design, and ethics of clinical trials, which are critical for bringing new drugs to market safely.',
    image: placeholderImages.find((img) => img.id === 'learn-3'),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    description: 'Dive into the world of patents, trademarks, and copyrights within the pharmaceutical landscape to protect innovations.',
    image: placeholderImages.find((img) => img.id === 'learn-4'),
  },
];

export const defaultDrugInfo = {
  drugName: 'Paracetamol',
  formulation: 'Tablet',
  strength: '500mg',
  uses: 'For the relief of mild to moderate pain including headache, migraine, neuralgia, toothache, sore throat, period pains, and for the symptomatic relief of rheumatic and muscular aches and pains, and colds and influenza. It is also used for the reduction of fever.',
  dosage: 'Adults and children over 12 years: 1-2 tablets every 4-6 hours, as required. Maximum of 8 tablets in 24 hours. Children 6-12 years: a half to 1 tablet every 4-6 hours. Maximum of 4 tablets in 24 hours.',
  contraindications: 'Hypersensitivity to paracetamol or to any of the excipients. Severe liver disease.',
  warnings: 'Do not exceed the stated dose. Immediate medical advice should be sought in the event of an overdose, even if you feel well. Contains paracetamol. Do not take with any other paracetamol-containing products.',
};

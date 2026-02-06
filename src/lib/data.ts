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

export const mockPrescription = {
  patientName: "Rahul Sharma",
  doctorName: "Dr. Mehta",
  medicines: [
    "Paracetamol 500 mg - twice daily",
    "Amoxicillin 250 mg - three times daily"
  ],
  dosageInstructions: ["Take after food", "Complete course for 5 days"],
  diagnosis: "Fever and throat infection",
  precautions: [
    "Drink warm fluids",
    "Take rest",
    "Avoid cold food and drinks"
  ],
  summary: "You have a fever and throat infection. Please take the prescribed medicines regularly for 5 days to recover fully."
};
  
export const mockMedicine = {
    medicineName: "Paracetamol 500 mg",
    brand: "Crocin",
    genericName: "Acetaminophen",
    drugClass: "Analgesic / Antipyretic",
    medicineType: "Tablet",
    summary: "A common over-the-counter medication used for relieving mild to moderate pain and reducing fever.",
    uses: "• Reduces fever\n• Relieves mild to moderate pain (e.g., headache, toothache, body pain)",
    howItWorks: "It works by blocking the release of certain chemical messengers responsible for pain and fever.",
    safeUseInstructions: "Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets (4000mg) in a 24-hour period.",
    commonSideEffects: "• Nausea\n• Stomach pain",
    seriousSideEffects: "• Severe skin rashes\n• Liver damage (in case of overdose)",
    warnings: "• Do not take more than the recommended dose.\n• Consult a doctor if you have liver disease.\n• Avoid consuming alcohol.",
    whenToConsultDoctor: "If your symptoms do not improve after 3 days, or if they get worse.",
    prescriptionRequired: false,
    confidence: "98%"
};

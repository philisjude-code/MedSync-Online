module.exports = [
  {
    id: 1,
    name: "Flu",
    anySymptoms: ["fever", "bodyache", "cold", "cough", "sore throat", "fatigue"],
    redFlags: [],
    minMatch: 1,
    confidenceBase: 0.4,
    triage: "self-care",
    advice: [
      "Stay hydrated.",
      "Take paracetamol 500mg for fever.",
      "Rest well.",
      "Monitor symptoms for 48 hours."
    ]
  },

  {
    id: 2,
    name: "Dengue",
    anySymptoms: ["high fever", "joint pain", "muscle pain", "severe headache", "rash", "nausea"],
    redFlags: ["bleeding", "severe abdominal pain"],
    minMatch: 1,
    confidenceBase: 0.6,
    triage: "see-doctor",
    advice: [
      "Drink plenty of fluids.",
      "Avoid self-medication.",
      "Get a blood test (NS1/Platelets)."
    ]
  },

  {
    id: 3,
    name: "Malaria",
    anySymptoms: ["high fever", "chills", "sweating", "nausea", "vomiting", "body pain"],
    redFlags: [],
    minMatch: 1,
    confidenceBase: 0.5,
    triage: "see-doctor",
    advice: [
      "Stay hydrated.",
      "Avoid cold exposure.",
      "Consult a physician for malaria test."
    ]
  },

  {
    id: 4,
    name: "Heat Stroke",
    anySymptoms: ["high temperature", "confusion", "dizziness", "rapid heartbeat", "no sweating", "hot skin"],
    redFlags: ["unconscious"],
    minMatch: 1,
    confidenceBase: 0.8,
    triage: "emergency",
    advice: [
      "Move to a cool area immediately.",
      "Drink water or ORS.",
      "Seek emergency care."
    ]
  },

  {
    id: 5,
    name: "Stomach Ulcer",
    anySymptoms: ["burning stomach pain", "heartburn", "bloating", "nausea", "acid reflux"],
    redFlags: ["bloody vomit", "black stool"],
    minMatch: 1,
    confidenceBase: 0.4,
    triage: "see-doctor",
    advice: [
      "Avoid spicy foods.",
      "Avoid acidic beverages.",
      "Consider antacids.",
      "Book a gastroenterologist visit."
    ]
  },

  {
    id: 6,
    name: "Asthma Attack",
    anySymptoms: ["wheezing", "shortness of breath", "tight chest", "difficulty breathing"],
    redFlags: ["severe breathlessness"],
    minMatch: 1,
    confidenceBase: 0.7,
    triage: "see-doctor",
    advice: [
      "Use your prescribed inhaler.",
      "Sit upright and stay calm.",
      "Avoid triggers like dust or smoke."
    ]
  },

  {
    id: 7,
    name: "Heart Attack",
    anySymptoms: [
      "chest pain",
      "left arm pain",
      "jaw pain",
      "shortness of breath",
      "sweating",
      "nausea",
      "tightness in chest"
    ],
    redFlags: ["severe chest pain", "collapse"],
    minMatch: 1,
    confidenceBase: 0.9,
    triage: "emergency",
    advice: [
      "Seek immediate emergency care.",
      "Do not drive yourself.",
      "Chew aspirin if available (unless allergic)."
    ]
  },

  {
    id: 8,
    name: "Stroke",
    anySymptoms: [
      "face drooping",
      "arm weakness",
      "slurred speech",
      "sudden numbness",
      "confusion",
      "vision problem",
      "loss of balance"
    ],
    redFlags: ["unconscious"],
    minMatch: 1,
    confidenceBase: 0.9,
    triage: "emergency",
    advice: [
      "Seek immediate medical attention.",
      "Time is critical for stroke treatment.",
      "Do not give food or water."
    ]
  },

  {
    id: 9,
    name: "Food Poisoning",
    anySymptoms: ["vomiting", "diarrhea", "stomach cramps", "nausea"],
    redFlags: ["bloody diarrhea"],
    minMatch: 1,
    confidenceBase: 0.5,
    triage: "self-care",
    advice: [
      "Drink ORS frequently.",
      "Avoid solid food for a few hours.",
      "Seek help if dehydration occurs."
    ]
  },

  {
    id: 10,
    name: "Migraine",
    anySymptoms: ["one sided headache", "severe headache", "light sensitivity", "sound sensitivity", "nausea"],
    redFlags: ["vision loss"],
    minMatch: 1,
    confidenceBase: 0.4,
    triage: "see-doctor",
    advice: [
      "Rest in a dark room.",
      "Avoid loud sounds.",
      "Hydrate well.",
      "Avoid stress triggers."
    ]
  },

  {
    id: 11,
    name: "Skin Infection",
    anySymptoms: ["redness", "itching", "rash", "pus", "skin swelling", "warm skin", "infection"],
    redFlags: ["fever"],
    minMatch: 1,
    confidenceBase: 0.35,
    triage: "self-care",
    advice: [
      "Keep the area clean.",
      "Avoid scratching.",
      "Use mild antiseptic.",
      "See a dermatologist if it spreads."
    ]
  },

  {
    id: 12,
    name: "Typhoid",
    anySymptoms: ["prolonged fever", "weakness", "abdominal pain", "constipation", "rose spots", "loss of appetite"],
    redFlags: [],
    minMatch: 1,
    confidenceBase: 0.6,
    triage: "see-doctor",
    advice: [
      "Drink clean water.",
      "Avoid heavy meals.",
      "Get a blood test (Widal/typhi)."
    ]
  },

  {
    id: 13,
    name: "Kidney Stones",
    anySymptoms: ["severe back pain", "side pain", "blood in urine", "burning urination", "sharp stomach pain"],
    redFlags: [],
    minMatch: 1,
    confidenceBase: 0.6,
    triage: "see-doctor",
    advice: [
      "Drink plenty of water.",
      "Use warm compress.",
      "Consult a urologist."
    ]
  }
];

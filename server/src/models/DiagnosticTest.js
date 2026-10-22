import mongoose from 'mongoose';

const diagnosticTestSchema = new mongoose.Schema({
  testName: { type: String, required: true, trim: true },
  testCode: { type: String, required: true, unique: true, uppercase: true }, // e.g. "CBC-101"
  category: { 
    type: String, 
    required: true, 
    enum: ['Hematology', 'Biochemistry', 'Radiology', 'Microbiology', 'Pathology'] 
  },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  preparationInstructions: { type: String, default: 'No special preparation needed.' },
  turnaroundHours: { type: Number, required: true, default: 24 },
  isHomeSampleAvailable: { type: Boolean, default: false },
  sampleType: { type: String, default: 'Blood' }, // e.g. Blood, Urine, X-Ray
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

diagnosticTestSchema.index({ category: 1, isActive: 1 });

export const DiagnosticTest = mongoose.model('DiagnosticTest', diagnosticTestSchema);

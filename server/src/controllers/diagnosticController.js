import { DiagnosticTest } from '../models/DiagnosticTest.js';

export const getAllTests = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { testName: { $regex: search, $options: 'i' } },
        { testCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tests = await DiagnosticTest.find(filter).sort({ category: 1, testName: 1 });
    res.status(200).json({ success: true, count: tests.length, data: tests });
  } catch (err) {
    next(err);
  }
};

export const getTestById = async (req, res, next) => {
  try {
    const test = await DiagnosticTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Diagnostic test not found' });
    }
    res.status(200).json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
};

export const createTest = async (req, res, next) => {
  try {
    const test = await DiagnosticTest.create(req.body);
    res.status(201).json({ success: true, message: 'Diagnostic test created', data: test });
  } catch (err) {
    next(err);
  }
};

export const updateTest = async (req, res, next) => {
  try {
    const test = await DiagnosticTest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Diagnostic test not found' });
    }
    res.status(200).json({ success: true, message: 'Diagnostic test updated', data: test });
  } catch (err) {
    next(err);
  }
};

export const deleteTest = async (req, res, next) => {
  try {
    const test = await DiagnosticTest.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!test) {
      return res.status(404).json({ success: false, message: 'Diagnostic test not found' });
    }
    res.status(200).json({ success: true, message: 'Diagnostic test archived successfully' });
  } catch (err) {
    next(err);
  }
};

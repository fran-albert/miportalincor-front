// src/store/Pre-Occupational/selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';

export const selectFlatFormData = createSelector(
  (state: RootState) => state.preOccupational.formData,
  (formData): Record<string, unknown> => {
    // Aplanamos testsPerformed con prefijo "tests_"
    const flatTests = Object.entries(formData.testsPerformed).reduce((acc, [key, value]) => {
      acc[`tests_${key}`] = value;
      return acc;
    }, {} as Record<string, boolean>);

    // Aplanamos examResults con prefijo "exams_"
    const flatExams = Object.entries(formData.examResults).reduce((acc, [key, value]) => {
      acc[`exams_${key}`] = value;
      return acc;
    }, {} as Record<string, string>);

    return {
      ...formData,
      ...flatTests,
      ...flatExams,
      // Puedes agregar otros aplanados con sus propios prefijos
      // Nota: Si algunas propiedades ya tienen índice, se mantendrán
    };
  }
);

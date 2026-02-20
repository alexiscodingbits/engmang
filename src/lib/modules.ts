export type Module = { code: string; name: string }

const modulesByYear: Record<number, Module[]> = {
  1: [
    { code: 'EE1E01', name: 'Engineering Maths I' },
    { code: 'EE1E02', name: 'Engineering Maths II' },
    { code: 'EE1E03', name: 'Introduction to Programming' },
    { code: 'EE1E04', name: 'Engineering Mechanics' },
    { code: 'EE1E05', name: 'Physics for Engineers' },
    { code: 'EE1E06', name: 'Engineering Chemistry' },
    { code: 'EE1E07', name: 'Engineering Design I' },
  ],
  2: [
    { code: 'EE2E01', name: 'Linear Algebra' },
    { code: 'EE2E02', name: 'Differential Equations' },
    { code: 'EE2E03', name: 'Statics & Dynamics' },
    { code: 'EE2E04', name: 'Thermodynamics' },
    { code: 'EE2E05', name: 'Electrical Circuits' },
    { code: 'EE2E06', name: 'Data Structures & Algorithms' },
    { code: 'EE2E07', name: 'Fluid Mechanics' },
  ],
  3: [
    { code: 'EE3E01', name: 'Signals & Systems' },
    { code: 'EE3E02', name: 'Control Systems' },
    { code: 'EE3E03', name: 'Structural Analysis' },
    { code: 'EE3E04', name: 'Digital Electronics' },
    { code: 'EE3E05', name: 'Database Systems' },
    { code: 'EE3E06', name: 'Computer Networks' },
    { code: 'EE3E07', name: 'Engineering Economics' },
  ],
  4: [
    { code: 'EE4E01', name: 'Machine Learning' },
    { code: 'EE4E02', name: 'Advanced Control' },
    { code: 'EE4E03', name: 'Embedded Systems' },
    { code: 'EE4E04', name: 'Software Engineering' },
    { code: 'EE4E05', name: 'Power Systems' },
    { code: 'EE4E06', name: 'Final Year Project' },
    { code: 'EE4E07', name: 'Communications Systems' },
  ],
  5: [
    { code: 'EE5E01', name: 'Advanced Research Methods' },
    { code: 'EE5E02', name: 'Masters Thesis' },
    { code: 'EE5E03', name: 'Advanced Machine Learning' },
    { code: 'EE5E04', name: 'Robotics & Automation' },
    { code: 'EE5E05', name: 'Sustainable Engineering' },
  ],
}

export function getModulesForYear(year: number): Module[] {
  return modulesByYear[year] ?? []
}

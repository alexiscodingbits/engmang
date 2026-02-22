export type Module = { code: string; name: string }

export const NOTE_TAGS = [
  'Lecture Notes',
  'Lecture Slides',
  'Tutorial',
  'Tutorial Solutions',
  'Past Exam Paper',
  'Past Exam Solutions',
  'Labs',
  'Homework',
  'Formulae Sheet',
  'Revision Notes',
  'Cheat Sheet',
  'Assignment/Project',
  'General Notes',
  'Untagged',
] as const

const modulesByYear: Record<number, Module[]> = {
  1: [
    { code: 'STU11004', name: 'Introduction to Management Science' },
    { code: 'CHU11E05', name: 'Chemistry' },
    { code: 'MAU11E01', name: 'Engineering Mathematics I' },
    { code: 'MEU11EM1', name: 'Introduction to Manufacturing' },
    { code: 'CEU11E20', name: 'Physics' },
    { code: 'MEU11E16', name: 'Materials Science' },
    { code: 'CEU11E07', name: 'Mechanics' },
    { code: 'EEU11E06', name: 'Electrical Engineering' },
    { code: 'MAU11E02', name: 'Engineering Mathematics II' },
    { code: 'MEU11EM4', name: 'Introduction to Computing' },
  ],
  2: [
    { code: 'CEU22E04', name: 'Solids and Structures' },
    { code: 'EEU22E06', name: 'Electronics' },
    { code: 'MAU22E01', name: 'Engineering Mathematics III' },
    { code: 'MEU22EM2', name: 'Strategic Financial Management' },
    { code: 'MEU22EM3', name: 'Design I' },
    { code: 'MEU23B10', name: '3D Computer Aided Design' },
    { code: 'EEU22E12', name: 'Computational Science and Engineering 1' },
    { code: 'MAU22E02', name: 'Engineering Mathematics IV' },
    { code: 'MEU22E05', name: 'Thermo-fluids' },
    { code: 'MEU22M11', name: 'Manufacturing Engineering Design' },
    { code: 'MEU33B07', name: 'Manufacturing Technology and Systems' },
  ],
  3: [
    { code: 'MEU33EM3', name: 'Design II' },
    { code: 'EEU33C01', name: 'Signals and Systems' },
    { code: 'MAU33E01', name: 'Engineering Mathematics V' },
    { code: 'MEU33B04', name: 'Mechanical Engineering Materials' },
    { code: 'MEU33B02', name: 'Fluid Mechanics' },
    { code: 'MEU33B01', name: 'Thermodynamics' },
    { code: 'EEU33E03', name: 'Probability and Statistics' },
    { code: 'MEU33B05', name: 'Mechanics of Machines' },
    { code: 'MEU33EM1', name: 'Laser Processing and Additive Manufacturing' },
    { code: 'MEU33EM5', name: 'Manufacturing Systems 1' },
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

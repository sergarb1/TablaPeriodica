export interface ElementData {
  atomicNumber: number
  symbol: string
  nameEs: string
  nameEn: string
  group: number | null
  period: number
  block: 's' | 'p' | 'd' | 'f'
  family: string
  familyEs: string
  familyEn: string
  state: string
  stateEs: string
  stateEn: string
  atomicMass: string
  electronConfiguration: string
  electronShells: number[]
  electronegativity: number | null
  atomicRadius: number | null
  ionizationEnergy: number | null
  valence: number[]
  oxidationStates: string
  density: number | null
  meltingPoint: number | null
  boilingPoint: number | null
  yearDiscovered: string
  discovererEs: string
  discovererEn: string
  nameOriginEs: string
  nameOriginEn: string
  curiosityEs: string
  curiosityEn: string
  usesEs: string
  usesEn: string
  risksEs: string
  risksEn: string
  color: string
  x: number
  y: number
}

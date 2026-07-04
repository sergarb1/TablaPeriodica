import elementsJson from '@/data/elements.json'
import familiesJson from '@/data/families.json'
import type { ElementData, FamilyData } from '@/types'

const elements = elementsJson as ElementData[]
const families = familiesJson as FamilyData[]

export function useElement() {
  const getAll = () => elements

  const getByNumber = (n: number) => elements.find(e => e.atomicNumber === n) || null

  const getBySymbol = (sym: string) => elements.find(e => e.symbol === sym) || null

  const getFamily = (familyId: string) => families.find(f => f.id === familyId) || null

  const getFamilyByElement = (element: ElementData) =>
    families.find(f => f.id === element.family) || null

  const getNeighbors = (element: ElementData) => {
    const result: (ElementData | null)[] = []
    const positions = [
      { x: element.x, y: element.y - 1 },
      { x: element.x, y: element.y + 1 },
      { x: element.x - 1, y: element.y },
      { x: element.x + 1, y: element.y }
    ]
    for (const pos of positions) {
      result.push(elements.find(e => e.x === pos.x && e.y === pos.y) || null)
    }
    return result
  }

  const search = (query: string) => {
    const q = query.toLowerCase()
    return elements.filter(e =>
      e.symbol.toLowerCase().includes(q) ||
      e.nameEs.toLowerCase().includes(q) ||
      e.nameEn.toLowerCase().includes(q) ||
      e.atomicNumber.toString() === q
    )
  }

  return { getAll, getByNumber, getBySymbol, getFamily, getFamilyByElement, getNeighbors, search }
}

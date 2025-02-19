
export type CardDisplayArg = CardDisplayArg1[] | FamilyMemberFormatter | FamilyMemberDataString
type CardDisplayArg1 = FamilyMemberFormatter | FamilyMemberDataString | CardDisplayArg2
type CardDisplayArg2 = FamilyMemberDataString[]

type StringKeys<T> = {
    [K in keyof T]: T[K] extends string | number ? K : never;
  }[keyof T];


export type FamilyMemberFormatter = (familyMember: IFamilyMember) => string | number

type IFamilyMember = {data: Record<string,string | number>}

type FamilyMemberDataString = StringKeys<IFamilyMember['data']>
type ProcessCardDisplay =  (cardDisplay: CardDisplayArg) => FamilyMemberFormatter[]

export const  processCardDisplay: ProcessCardDisplay = (card_display: CardDisplayArg) =>  {
  const card_display_arr: FamilyMemberFormatter[] = []
  if (Array.isArray(card_display)) {
    card_display.forEach(d => {
      if (typeof d === 'function') {
        card_display_arr.push(d)
      } else if (typeof d === 'string') {
        card_display_arr.push((d1: IFamilyMember) => d1.data[d]!)
      } else if (Array.isArray(d)) {
        card_display_arr.push(d1 => d.map(d2 => d1.data[d2]).join(' '))
      }
    })
  } else if (typeof card_display === 'function') {
    card_display_arr.push(card_display)
  } else if (typeof card_display === 'string') {
    card_display_arr.push(d1 => d1.data[card_display]!)
  }
  return card_display_arr
}

